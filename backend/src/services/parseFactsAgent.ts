import OpenAI from 'openai';
import { generateEmbedding } from './embeddingService';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ParsedFact {
  original: string;
  cleaned: string;
  tooVague: boolean;
  confidence: number;
  factType: 'definition' | 'process' | 'localization' | 'comparison' | 'clinical' | 'association';
  nodeMatches: Array<{
    id: string;
    title: string;
    confidence: number;
  }>;
  newNodeProposal: {
    title: string;
    parentNodeId: string;
    reason: string;
  } | null;
  variants: Array<{
    kind: 'basic' | 'cloze' | 'explain';
    front: string;
    back: string;
    confidence: number;
  }>;
}

interface ContextNode {
  id: string;
  name: string;
  summary?: string;
  embedding: number[];
}

const PARSE_FACTS_SYSTEM_PROMPT = `You are a veterinary neurology fact processor. Convert messy student notes into atomic facts and spaced repetition cards.

CONTEXT:
- Domain: Veterinary neuroanatomy, embryology, clinical neurology
- Source: de Lahunta's Veterinary Neuroanatomy textbook
- User: Veterinary neurology resident taking rapid notes

OUTPUT REQUIREMENTS:
Return ONLY valid JSON array. For each input note, output:

{
  "original": "[exact input text]",
  "cleaned": "[grammatically correct atomic fact, ONE idea only]",
  "too_vague": false,  // true if note is too general to make a card
  "confidence": 0.0-1.0,
  "fact_type": "definition|process|localization|comparison|clinical|association",
  "node_matches": [
    {"id": "node_id", "title": "Node Title", "confidence": 0.0-1.0}
  ],
  "new_node_proposal": {  // ONLY if fact is too specific for existing nodes
    "title": "Specific Subtopic",
    "parentNodeId": "parent_id",
    "reason": "Why this deserves its own node"
  },
  "variants": [
    {
      "kind": "basic",
      "front": "Clear question testing the fact",
      "back": "Complete answer",
      "confidence": 0.0-1.0
    },
    {
      "kind": "cloze",
      "front": "Fact with {{c1::key term}} and {{c2::second term}} blanked",
      "back": "term1 / term2",
      "confidence": 0.0-1.0
    },
    {
      "kind": "explain",
      "front": "Open-ended question about the concept",
      "back": "2-3 sentence explanation with key details",
      "confidence": 0.0-1.0
    }
  ]
}

RULES:
1. ONE atomic fact per note (split compound ideas)
2. Fix spelling but KEEP proper veterinary terms
3. Cloze should blank 1-2 KEY terms only
4. Basic questions should be exam-style
5. Explain should test understanding, not memorization
6. Match to most specific existing node when confidence > 0.7
7. Only propose new nodes for truly distinct subtopics
8. Set confidence based on clarity and textbook support
9. If note is too vague/general, set too_vague: true and provide minimal variants

EXAMPLE INPUT:
"neural crest -> DRG + schwann + melanocytes"

EXAMPLE OUTPUT:
{
  "original": "neural crest -> DRG + schwann + melanocytes",
  "cleaned": "Neural crest cells differentiate into dorsal root ganglia, Schwann cells, and melanocytes",
  "too_vague": false,
  "confidence": 0.95,
  "fact_type": "process",
  "node_matches": [
    {"id": "node_neural_crest", "title": "Neural crest", "confidence": 0.92}
  ],
  "new_node_proposal": null,
  "variants": [
    {
      "kind": "basic",
      "front": "What are the three major derivatives of neural crest cells?",
      "back": "Dorsal root ganglia (DRG), Schwann cells, and melanocytes",
      "confidence": 0.94
    },
    {
      "kind": "cloze",
      "front": "Neural crest cells differentiate into {{c1::dorsal root ganglia}}, {{c2::Schwann cells}}, and melanocytes",
      "back": "dorsal root ganglia / Schwann cells",
      "confidence": 0.92
    },
    {
      "kind": "explain",
      "front": "Explain the fate of neural crest cells",
      "back": "Neural crest cells migrate from the dorsal neural tube and differentiate into peripheral nervous system structures including sensory neurons (dorsal root ganglia), glial cells (Schwann cells), and melanocytes that produce pigmentation.",
      "confidence": 0.90
    }
  ]
}

Return ONLY the JSON array. No other text.`;

/**
 * Parse messy notes into structured facts with card variants
 */
export async function parseFacts(
  notes: string[],
  availableNodes: ContextNode[],
  topic?: string
): Promise<ParsedFact[]> {
  if (!notes || notes.length === 0) {
    return [];
  }

  // Limit to 20 notes per batch (as per architecture)
  const limitedNotes = notes.slice(0, 20);

  try {
    // Build user message with context
    const nodeContext = availableNodes.map(node => ({
      id: node.id,
      title: node.name,
      summary: node.summary || '',
    }));

    const userMessage = `
AVAILABLE NODES:
${JSON.stringify(nodeContext, null, 2)}

${topic ? `TOPIC CONTEXT: ${topic}\n\n` : ''}NOTES TO PARSE:
${limitedNotes.map((note, i) => `${i + 1}. ${note}`).join('\n')}

Parse each note into the JSON format specified. Return an array with ${limitedNotes.length} objects.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: PARSE_FACTS_SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3, // Lower temperature for more consistent parsing
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    // Parse the JSON response
    let parsedData;
    try {
      parsedData = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', content);
      throw new Error('Invalid JSON response from AI');
    }

    // Handle both array and object with array property
    let facts: any[] = [];
    if (Array.isArray(parsedData)) {
      facts = parsedData;
    } else if (parsedData.facts && Array.isArray(parsedData.facts)) {
      facts = parsedData.facts;
    } else if (parsedData.data && Array.isArray(parsedData.data)) {
      facts = parsedData.data;
    } else {
      throw new Error('Response does not contain an array of facts');
    }

    // Normalize field names (snake_case to camelCase)
    return facts.map((fact: any) => ({
      original: fact.original || '',
      cleaned: fact.cleaned || '',
      tooVague: fact.too_vague || fact.tooVague || false,
      confidence: fact.confidence || 0,
      factType: fact.fact_type || fact.factType || 'definition',
      nodeMatches: fact.node_matches || fact.nodeMatches || [],
      newNodeProposal: fact.new_node_proposal || fact.newNodeProposal || null,
      variants: fact.variants || [],
    }));
  } catch (error: any) {
    console.error('Error parsing facts with AI:', error);
    throw new Error(`Failed to parse facts: ${error.message}`);
  }
}

/**
 * Find relevant nodes for a note using embedding similarity
 */
export async function findRelevantNodes(
  noteText: string,
  allNodes: ContextNode[],
  topK: number = 10
): Promise<ContextNode[]> {
  if (!noteText || !allNodes || allNodes.length === 0) {
    return [];
  }

  try {
    // Generate embedding for the note
    const noteEmbedding = await generateEmbedding(noteText);

    // Calculate similarity to all nodes
    const withSimilarity = allNodes.map(node => {
      // Simple cosine similarity
      const similarity = cosineSimilarity(noteEmbedding, node.embedding);
      return { node, similarity };
    });

    // Sort by similarity and return top K
    return withSimilarity
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK)
      .map(item => item.node);
  } catch (error: any) {
    console.error('Error finding relevant nodes:', error);
    return [];
  }
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
