import { CardTemplate, FactType } from '../types';

interface Fact {
  statement: string;
  factType: FactType;
  keyTerms: string[];
}

/**
 * Card Generation Template System
 *
 * Automatically generates flashcards from structured facts.
 * Each fact type has specific patterns that produce multiple card variants.
 */
export function generateCards(fact: Fact): CardTemplate[] {
  const generators: { [key in FactType]: (f: Fact) => CardTemplate[] } = {
    definition: generateDefinitionCards,
    association: generateAssociationCards,
    localization: generateLocalizationCards,
    comparison: generateComparisonCards,
    clinical: generateClinicalCards,
    simple: generateSimpleCards,
  };

  const generator = generators[fact.factType] || generateSimpleCards;
  return generator(fact);
}

/**
 * Definition cards: "Term = Definition"
 * Example: "Schiff-Sherrington = UMN signs in TL after acute T3-L3 injury"
 */
function generateDefinitionCards(fact: Fact): CardTemplate[] {
  const match = fact.statement.match(/(.+?)\s*=\s*(.+)/);
  if (!match) return generateSimpleCards(fact);

  const [_, term, definition] = match;
  const termTrimmed = term.trim();
  const definitionTrimmed = definition.trim();

  return [
    {
      front: `What is ${termTrimmed}?`,
      back: definitionTrimmed,
      cardType: 'basic',
    },
    {
      front: `Define: ${termTrimmed}`,
      back: definitionTrimmed,
      cardType: 'basic',
    },
    {
      front: termTrimmed,
      back: definitionTrimmed,
      cardType: 'basic',
      hint: 'Define this term',
    },
  ];
}

/**
 * Association cards: "A → B" or "A causes B"
 * Example: "Neural folds fuse dorsally → neural tube"
 */
function generateAssociationCards(fact: Fact): CardTemplate[] {
  // Try arrow notation first
  let parts = fact.statement.split('→').map((s) => s.trim());

  // If no arrow, try "causes", "leads to", "results in"
  if (parts.length < 2) {
    const causeMatch = fact.statement.match(
      /(.+?)\s+(causes?|leads? to|results? in)\s+(.+)/i
    );
    if (causeMatch) {
      parts = [causeMatch[1].trim(), causeMatch[3].trim()];
    }
  }

  if (parts.length < 2) return generateSimpleCards(fact);

  const cards: CardTemplate[] = [];

  // Forward card
  cards.push({
    front: `${parts[0]} leads to what?`,
    back: parts[1],
    cardType: 'basic',
  });

  // Reverse card
  cards.push({
    front: `What causes ${parts[1]}?`,
    back: parts[0],
    cardType: 'basic',
  });

  // Cloze-style card
  cards.push({
    front: `${parts[0]} → [...]`,
    back: parts[1],
    cardType: 'cloze',
    hint: 'Fill in the consequence',
  });

  return cards;
}

/**
 * Localization cards: "Structure is located in Location"
 * Example: "Hippocampus is located in the medial temporal lobe"
 */
function generateLocalizationCards(fact: Fact): CardTemplate[] {
  const locationMatch = fact.statement.match(
    /(.+?)\s+(?:is |are )?(?:located |found )?(?:in |at |on )\s*(.+)/i
  );

  if (!locationMatch) return generateSimpleCards(fact);

  const [_, structure, location] = locationMatch;
  const structureTrimmed = structure.trim();
  const locationTrimmed = location.trim();

  return [
    {
      front: `Where is the ${structureTrimmed} located?`,
      back: locationTrimmed,
      cardType: 'basic',
    },
    {
      front: `What structure is located in ${locationTrimmed}?`,
      back: structureTrimmed,
      cardType: 'basic',
    },
    {
      front: `${structureTrimmed} location?`,
      back: locationTrimmed,
      cardType: 'basic',
      hint: 'Anatomical location',
    },
  ];
}

/**
 * Comparison cards: "A vs B: difference"
 * Example: "UMN vs LMN lesions: UMN = hyperreflexia, LMN = hyporeflexia"
 */
function generateComparisonCards(fact: Fact): CardTemplate[] {
  const vsMatch = fact.statement.match(/(.+?)\s+vs\.?\s+(.+?):\s*(.+)/i);

  if (!vsMatch) return generateSimpleCards(fact);

  const [_, itemA, itemB, difference] = vsMatch;
  const itemATrimmed = itemA.trim();
  const itemBTrimmed = itemB.trim();
  const differenceTrimmed = difference.trim();

  return [
    {
      front: `Compare ${itemATrimmed} vs ${itemBTrimmed}`,
      back: differenceTrimmed,
      cardType: 'basic',
    },
    {
      front: `What's the difference between ${itemATrimmed} and ${itemBTrimmed}?`,
      back: differenceTrimmed,
      cardType: 'basic',
    },
    {
      front: `${itemATrimmed} vs ${itemBTrimmed}`,
      back: differenceTrimmed,
      cardType: 'basic',
      hint: 'Key differences',
    },
  ];
}

/**
 * Clinical cards: Diagnosis, symptoms, treatment
 * Example: "Tetanus: progressive muscle rigidity, opisthotonus, risus sardonicus"
 */
function generateClinicalCards(fact: Fact): CardTemplate[] {
  const colonMatch = fact.statement.match(/(.+?):\s*(.+)/);

  if (!colonMatch) return generateSimpleCards(fact);

  const [_, condition, details] = colonMatch;
  const conditionTrimmed = condition.trim();
  const detailsTrimmed = details.trim();

  return [
    {
      front: `What are the signs of ${conditionTrimmed}?`,
      back: detailsTrimmed,
      cardType: 'basic',
    },
    {
      front: `Describe ${conditionTrimmed}`,
      back: detailsTrimmed,
      cardType: 'basic',
    },
    {
      front: conditionTrimmed,
      back: detailsTrimmed,
      cardType: 'basic',
      hint: 'Clinical presentation',
    },
  ];
}

/**
 * Simple/fallback cards: Just the statement
 */
function generateSimpleCards(fact: Fact): CardTemplate[] {
  // If there are key terms, create cloze deletions
  if (fact.keyTerms.length > 0) {
    const cards: CardTemplate[] = [];

    // Create a card for each key term
    fact.keyTerms.slice(0, 3).forEach((term) => {
      const front = fact.statement.replace(term, '[...]');
      cards.push({
        front,
        back: term,
        cardType: 'cloze',
        hint: 'Fill in the blank',
      });
    });

    // Also create a basic card
    cards.push({
      front: `What does this mean: "${fact.statement}"?`,
      back: fact.statement,
      cardType: 'basic',
      hint: 'Explain this concept',
    });

    return cards;
  }

  // Absolute fallback: simple Q&A
  return [
    {
      front: 'What is this fact?',
      back: fact.statement,
      cardType: 'basic',
    },
  ];
}

/**
 * Extract key terms from a fact statement
 * Simple implementation: looks for capitalized words, technical terms
 */
export function extractKeyTerms(statement: string): string[] {
  const terms: string[] = [];

  // Find capitalized words (not at sentence start)
  const capitalizedWords = statement.match(/(?<!^|\. )[A-Z][a-z]+/g) || [];
  terms.push(...capitalizedWords);

  // Find technical terms (e.g., hyphenated words, acronyms)
  const technicalTerms =
    statement.match(/\b[A-Z]{2,}\b|\b\w+-\w+\b/g) || [];
  terms.push(...technicalTerms);

  // Remove duplicates and return
  return [...new Set(terms)];
}
