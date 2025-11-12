import Anthropic from '@anthropic-ai/sdk';
// @ts-ignore - pdf-parse v1.1.1 doesn't have TypeScript definitions
import pdf from 'pdf-parse';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * AI-powered fact extraction from text
 * Takes raw text and extracts structured facts
 */
export async function extractFactsFromText(
  text: string
): Promise<Array<{ statement: string; factType: string; keyTerms: string[] }>> {
  const prompt = `Extract veterinary neurology facts from the following text.
For each fact, provide:
1. The fact statement (concise, one sentence)
2. The fact type (definition, association, localization, comparison, clinical, or simple)
3. Key terms (important words/concepts)

Format as JSON array:
[
  {
    "statement": "Neural folds fuse dorsally → neural tube",
    "factType": "association",
    "keyTerms": ["neural folds", "neural tube", "dorsal fusion"]
  }
]

Text:
${text}

Return ONLY valid JSON, no other text.`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type === 'text') {
      const jsonMatch = content.text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    }

    return [];
  } catch (error) {
    console.error('AI extraction failed:', error);
    throw error;
  }
}

/**
 * AI-powered card generation from fact
 * Creates better cards than template system
 */
export async function generateCardsWithAI(
  fact: { statement: string; factType: string }
): Promise<Array<{ front: string; back: string; hint?: string; cardType: string }>> {
  const prompt = `Generate flashcards for this veterinary neurology fact:

Fact: "${fact.statement}"
Type: ${fact.factType}

Create 3-5 high-quality flashcards that:
1. Test understanding from different angles
2. Use active recall (no recognition-only questions)
3. Are specific and unambiguous
4. Include context where helpful

Format as JSON array:
[
  {
    "front": "Question or prompt",
    "back": "Answer",
    "hint": "Optional hint",
    "cardType": "basic"
  }
]

Return ONLY valid JSON, no other text.`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type === 'text') {
      const jsonMatch = content.text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    }

    return [];
  } catch (error) {
    console.error('AI card generation failed:', error);
    throw error;
  }
}

/**
 * AI-powered summary generation for nodes
 */
export async function generateNodeSummary(nodeName: string, facts: string[]): Promise<string> {
  const prompt = `Generate a concise summary (2-3 sentences) for this veterinary neurology topic:

Topic: ${nodeName}

Facts covered:
${facts.map((f, i) => `${i + 1}. ${f}`).join('\n')}

Summary should:
- Be clear and professional
- Highlight key concepts
- Be useful for review

Return only the summary text, no JSON or formatting.`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type === 'text') {
      return content.text.trim();
    }

    return '';
  } catch (error) {
    console.error('AI summary generation failed:', error);
    throw error;
  }
}

/**
 * AI-powered fact improvement suggestions
 */
export async function suggestFactImprovements(
  statement: string
): Promise<{ improved: string; reasoning: string }> {
  const prompt = `Review this veterinary neurology fact and suggest improvements:

Fact: "${statement}"

Provide:
1. An improved version (if needed) that is:
   - More precise and specific
   - Uses proper terminology
   - Is optimized for flashcard learning
2. Brief reasoning for changes

Format as JSON:
{
  "improved": "Improved fact statement",
  "reasoning": "Why these changes improve the fact"
}

If the fact is already good, return it unchanged with reasoning explaining why.
Return ONLY valid JSON, no other text.`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type === 'text') {
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    }

    return { improved: statement, reasoning: 'No improvements suggested' };
  } catch (error) {
    console.error('AI improvement suggestion failed:', error);
    throw error;
  }
}

/**
 * AI-powered image description for image occlusion prep
 *
 * Note: Temporarily disabled - Anthropic API only supports base64 images,
 * not URLs. Will be re-enabled when image upload is implemented.
 */
export async function describeImageForOcclusion(imageBase64: string): Promise<{
  description: string;
  keyStructures: string[];
  suggestedOcclusions: Array<{ label: string; importance: 'high' | 'medium' | 'low' }>;
}> {
  // TODO: Implement when image upload is ready
  // const message = await anthropic.messages.create({
  //   model: 'claude-3-5-sonnet-20241022',
  //   max_tokens: 1000,
  //   messages: [{
  //     role: 'user',
  //     content: [{
  //       type: 'image',
  //       source: { type: 'base64', media_type: 'image/jpeg', data: imageBase64 }
  //     }]
  //   }]
  // });

  return {
    description: 'Image analysis not yet implemented',
    keyStructures: [],
    suggestedOcclusions: [],
  };
}

/**
 * Smart text splitting for large documents
 * Tries to split on chapter boundaries, section headings, or paragraph breaks
 */
function smartSplitText(text: string, chunkSize: number): string[] {
  const chunks: string[] = [];

  // If text is smaller than chunk size, return as-is
  if (text.length <= chunkSize) {
    return [text];
  }

  // Chapter markers to look for
  const chapterMarkers = [
    /\n\s*CHAPTER\s+\d+/gi,
    /\n\s*Chapter\s+\d+/g,
    /\n\s*\d+\.\s+[A-Z]/g, // "1. Something"
    /\n\s*#{1,3}\s+/g, // Markdown headers
  ];

  // Try to split on chapter boundaries first
  for (const marker of chapterMarkers) {
    const matches = Array.from(text.matchAll(marker));
    if (matches.length > 1) {
      const positions = matches.map(m => m.index!);

      // Check if these splits would give us reasonable chunk sizes
      let goodSplit = true;
      for (let i = 0; i < positions.length - 1; i++) {
        const chunkLen = positions[i + 1] - positions[i];
        if (chunkLen > chunkSize * 1.5) {
          goodSplit = false;
          break;
        }
      }

      if (goodSplit) {
        // Use this splitting strategy
        for (let i = 0; i < positions.length; i++) {
          const start = positions[i];
          const end = i < positions.length - 1 ? positions[i + 1] : text.length;
          chunks.push(text.slice(start, end));
        }
        return chunks;
      }
    }
  }

  // Fallback: split on paragraph boundaries (double newlines)
  const paragraphs = text.split(/\n\s*\n/);
  let currentChunk = '';

  for (const para of paragraphs) {
    if (currentChunk.length + para.length + 2 <= chunkSize) {
      currentChunk += (currentChunk ? '\n\n' : '') + para;
    } else {
      if (currentChunk) {
        chunks.push(currentChunk);
      }

      // If a single paragraph exceeds chunk size, split it
      if (para.length > chunkSize) {
        const sentences = para.split(/\.\s+/);
        let sentenceChunk = '';

        for (const sentence of sentences) {
          if (sentenceChunk.length + sentence.length + 2 <= chunkSize) {
            sentenceChunk += (sentenceChunk ? '. ' : '') + sentence;
          } else {
            if (sentenceChunk) {
              chunks.push(sentenceChunk + '.');
            }
            sentenceChunk = sentence;
          }
        }

        if (sentenceChunk) {
          currentChunk = sentenceChunk;
        }
      } else {
        currentChunk = para;
      }
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks.length > 0 ? chunks : [text.slice(0, chunkSize)];
}

/**
 * Deduplicate and merge nodes from multiple chunks
 */
function deduplicateNodes(allNodes: Array<{
  name: string;
  parentName?: string;
  summary: string;
  suggestedTags: string[];
}>): Array<{
  name: string;
  parentName?: string;
  summary: string;
  suggestedTags: string[];
}> {
  const nodeMap = new Map<string, {
    name: string;
    parentName?: string;
    summary: string;
    suggestedTags: Set<string>;
  }>();

  for (const node of allNodes) {
    const key = node.name.toLowerCase().trim();

    if (nodeMap.has(key)) {
      // Merge with existing node
      const existing = nodeMap.get(key)!;

      // Add new tags (deduplicate)
      for (const tag of node.suggestedTags) {
        existing.suggestedTags.add(tag);
      }

      // Use longer summary
      if (node.summary.length > existing.summary.length) {
        existing.summary = node.summary;
      }

      // Preserve parent relationship
      if (node.parentName && !existing.parentName) {
        existing.parentName = node.parentName;
      }
    } else {
      // Add new node
      nodeMap.set(key, {
        name: node.name,
        parentName: node.parentName,
        summary: node.summary,
        suggestedTags: new Set(node.suggestedTags),
      });
    }
  }

  // Convert back to array format
  return Array.from(nodeMap.values()).map(node => ({
    name: node.name,
    parentName: node.parentName,
    summary: node.summary,
    suggestedTags: Array.from(node.suggestedTags),
  }));
}

/**
 * Process large textbook PDFs with automatic chunking
 * Callback is invoked with progress updates
 */
export async function extractNodesFromLargeTextbook(
  text: string,
  progressCallback?: (current: number, total: number, chunkNodes: number) => void
): Promise<{
  nodes: Array<{
    name: string;
    parentName?: string;
    summary: string;
    suggestedTags: string[];
  }>;
  chunksProcessed: number;
}> {
  const CHUNK_SIZE = parseInt(process.env.AI_CHUNK_SIZE || '100000', 10);
  const chunks = smartSplitText(text, CHUNK_SIZE);

  console.log(`Processing ${chunks.length} chunks (${text.length} chars total)`);

  const allNodes: Array<{
    name: string;
    parentName?: string;
    summary: string;
    suggestedTags: string[];
  }> = [];

  for (let i = 0; i < chunks.length; i++) {
    console.log(`Processing chunk ${i + 1}/${chunks.length} (${chunks[i].length} chars)`);

    try {
      const result = await extractNodesFromTextbook(chunks[i]);
      allNodes.push(...result.nodes);

      // Progress callback
      if (progressCallback) {
        progressCallback(i + 1, chunks.length, result.nodes.length);
      }

      // Small delay to avoid rate limits
      const delay = parseInt(process.env.AI_RATE_LIMIT_DELAY_MS || '1000', 10);
      if (i < chunks.length - 1 && delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    } catch (error) {
      console.error(`Error processing chunk ${i + 1}:`, error);
      // Continue processing other chunks
    }
  }

  // Deduplicate and merge nodes
  const mergedNodes = deduplicateNodes(allNodes);

  console.log(`Extracted ${allNodes.length} total nodes, merged to ${mergedNodes.length} unique nodes`);

  return {
    nodes: mergedNodes,
    chunksProcessed: chunks.length,
  };
}

/**
 * AI-powered textbook chapter analysis and node extraction
 * Analyzes textbook content and identifies hierarchical topics
 */
export async function extractNodesFromTextbook(text: string): Promise<{
  nodes: Array<{
    name: string;
    parentName?: string;
    summary: string;
    suggestedTags: string[];
  }>;
}> {
  // Analyze up to 100k characters for single-chunk processing
  const textToAnalyze = text.slice(0, 100000);

  const prompt = `You are analyzing a veterinary neurology textbook chapter. Extract the knowledge structure as a hierarchy of topics (nodes).

For each topic, identify:
1. Topic name (concise, specific)
2. Parent topic (if it's a subtopic)
3. Brief summary (2-3 sentences covering key concepts)
4. Suggested tags for categorization

Focus on creating a logical hierarchy. For example:
- Main topic: "Spinal Cord Anatomy"
  - Subtopic: "White Matter Tracts"
  - Subtopic: "Gray Matter Organization"
- Main topic: "Spinal Cord Localization"
  - Subtopic: "C6-T2 Lesions"
  - Subtopic: "T3-L3 Lesions"

Extract as many nodes as make sense to capture the chapter's knowledge structure (10-30 nodes is typical).

Textbook content:
${textToAnalyze}

Return ONLY valid JSON in this format:
{
  "nodes": [
    {
      "name": "Spinal Cord Anatomy",
      "summary": "Overview of spinal cord structure including gray and white matter organization, cervical and lumbar enlargements for limb innervation, and segmental anatomy.",
      "suggestedTags": ["anatomy", "spinal-cord"]
    },
    {
      "name": "White Matter Tracts",
      "parentName": "Spinal Cord Anatomy",
      "summary": "Organization of ascending sensory pathways (dorsal columns, spinothalamic) and descending motor tracts (corticospinal, rubrospinal) within the spinal cord white matter.",
      "suggestedTags": ["anatomy", "spinal-cord", "white-matter"]
    }
  ]
}`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000, // Increased from 4000 to allow full JSON responses
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type === 'text') {
      console.log('AI response (first 500 chars):', content.text.slice(0, 500));

      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonStr = jsonMatch[0];

        // Validate JSON is complete before parsing
        try {
          const parsed = JSON.parse(jsonStr);
          return parsed;
        } catch (parseError) {
          console.error('JSON parse error. Response was:', jsonStr.slice(0, 1000));
          console.error('Parse error:', parseError);
          throw new Error('AI returned incomplete or invalid JSON. Try a smaller text sample or simpler content.');
        }
      }
    }

    return { nodes: [] };
  } catch (error) {
    console.error('AI textbook extraction failed:', error);
    throw error;
  }
}

/**
 * Extract text from PDF buffer using pdf-parse
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  const data = await pdf(buffer);
  return data.text;
}
