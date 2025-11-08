import Anthropic from '@anthropic-ai/sdk';

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
      model: 'claude-3-5-sonnet-20241022',
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
      model: 'claude-3-5-sonnet-20241022',
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
      model: 'claude-3-5-sonnet-20241022',
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
      model: 'claude-3-5-sonnet-20241022',
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
 */
export async function describeImageForOcclusion(imageUrl: string): Promise<{
  description: string;
  keyStructures: string[];
  suggestedOcclusions: Array<{ label: string; importance: 'high' | 'medium' | 'low' }>;
}> {
  const prompt = `Analyze this veterinary neurology image and provide:

1. Overall description
2. Key anatomical structures visible
3. Suggested structures to occlude for flashcards (with importance)

Format as JSON:
{
  "description": "Brief description of the image",
  "keyStructures": ["structure1", "structure2", ...],
  "suggestedOcclusions": [
    {"label": "structure name", "importance": "high"},
    ...
  ]
}

Return ONLY valid JSON, no other text.`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'url',
                url: imageUrl,
              },
            },
            {
              type: 'text',
              text: prompt,
            },
          ],
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

    return {
      description: '',
      keyStructures: [],
      suggestedOcclusions: [],
    };
  } catch (error) {
    console.error('AI image description failed:', error);
    throw error;
  }
}
