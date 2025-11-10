# MostlyMyelinated System Architecture

## 🏗️ System Architecture

### Tech Stack
```yaml
Backend:
  - Node.js + Express (existing)
  - PostgreSQL + pgvector extension (for embeddings)
  - Prisma ORM with vector support
  - OpenAI API (embeddings + GPT-4 for agents)
  - Fuse.js (fuzzy matching)
  - Bull Queue (background jobs)
  - MinIO/S3 (image storage)

Frontend:
  - React + TypeScript (existing)
  - TanStack Query (caching/optimistic updates)
  - Tiptap (rich text editing)
  - Konva.js (image occlusion editor)
  - Papaparse (CSV parsing)
  - React-hotkeys-hook (keyboard shortcuts)
```

### Database Schema

```prisma
// Core Knowledge Structure
model Chapter {
  id          String   @id @default(cuid())
  userId      String
  title       String
  source      String   // "de_lahunta_ch3"
  importedAt  DateTime @default(now())

  chunks      Chunk[]
  images      ChapterImage[]
  user        User     @relation(fields: [userId], references: [id])

  @@index([userId])
}

model Chunk {
  id          String   @id @default(cuid())
  chapterId   String
  sequence    Int      // order in chapter
  heading     String?  // section heading
  text        String   @db.Text
  embedding   Unsupported("vector(1536)")  // OpenAI ada-002

  chapter     Chapter  @relation(fields: [chapterId], references: [id], onDelete: Cascade)

  @@index([chapterId, sequence])
  @@index([embedding(ops: "vector_cosine_ops")], type: Gist)
}

model Node {
  id          String   @id @default(cuid())
  userId      String
  title       String
  slug        String   // URL-safe version
  parentId    String?
  path        String   // "root.spinal.neural_tube"
  summary     String?
  module      String?  // Spinal/Brainstem/etc
  embedding   Unsupported("vector(1536)")
  strength    Float    @default(0)  // 0-100

  parent      Node?    @relation("NodeHierarchy", fields: [parentId], references: [id])
  children    Node[]   @relation("NodeHierarchy")
  facts       Fact[]
  images      NodeImage[]
  chunkLinks  NodeChunkLink[]

  @@index([userId, strength])
  @@index([userId, path])
  @@index([embedding(ops: "vector_cosine_ops")], type: Gist)
}

model Fact {
  id            String   @id @default(cuid())
  userId        String
  nodeId        String?  // null = unsorted
  originalText  String   @db.Text
  cleanedText   String   @db.Text
  factType      String   // definition/process/localization/comparison/clinical
  confidence    Float
  embedding     Unsupported("vector(1536)")

  node          Node?    @relation(fields: [nodeId], references: [id])
  variants      CardVariant[]
  images        FactImage[]

  @@index([userId, nodeId])
  @@index([embedding(ops: "vector_cosine_ops")], type: Gist)
}

model CardVariant {
  id          String   @id @default(cuid())
  factId      String
  kind        String   // basic/cloze/explain
  front       String   @db.Text
  back        String   @db.Text
  confidence  Float

  // FSRS fields
  due         DateTime @default(now())
  interval    Float    @default(0)
  ease        Float    @default(2.5)
  reps        Int      @default(0)
  lapses      Int      @default(0)

  fact        Fact     @relation(fields: [factId], references: [id], onDelete: Cascade)
  reviews     Review[]

  @@index([due, factId])
}

model ChapterImage {
  id          String   @id @default(cuid())
  chapterId   String
  url         String
  caption     String?
  pageNum     Int?
  embedding   Unsupported("vector(1536)")  // from caption + context

  chapter     Chapter  @relation(fields: [chapterId], references: [id])
  nodeImages  NodeImage[]
}

model NodeImage {
  nodeId      String
  imageId     String
  node        Node         @relation(fields: [nodeId], references: [id])
  image       ChapterImage @relation(fields: [imageId], references: [id])

  @@id([nodeId, imageId])
}

model FactImage {
  id          String   @id @default(cuid())
  factId      String
  url         String
  caption     String?

  fact        Fact     @relation(fields: [factId], references: [id])
}
```

## 🔌 Core Endpoints

### 1. Chapter Import
```typescript
POST /api/chapters/import
Body: {
  title: string
  source: string  // "de_lahunta_ch3"
  content: string | File  // text or PDF
}

Process:
1. Extract text, split into ~400 word chunks
2. Extract images with captions
3. Generate embeddings for all chunks/images
4. Propose initial nodes from headings
5. Return preview for user confirmation

Response: {
  chapterId: string
  chunksCreated: number
  imagesExtracted: number
  proposedNodes: Array<{
    title: string
    parentPath?: string
    matchedHeadings: string[]
  }>
}
```

### 2. Parse Facts (Core Magic)
```typescript
POST /api/facts/parse
Body: {
  notes: string[]  // max 20 lines
  topic?: string   // optional context
  imageUrls?: string[]  // attached images
}

Process:
1. For each note, retrieve top 5 chunks + top 10 nodes via embedding
2. Call parse-facts agent with context
3. Create facts + variants
4. Auto-assign to nodes if confidence > 0.85

Response: Array<{
  original: string
  cleaned: string
  factType: string
  confidence: number
  nodeMatches: Array<{id: string, title: string, confidence: number}>
  newNodeProposal?: {title: string, parentId: string, reason: string}
  variants: Array<{
    kind: "basic" | "cloze" | "explain"
    front: string
    back: string
    confidence: number
  }>
  factId: string  // created fact
  variantIds: string[]  // created cards
}>
```

### 3. Bulk Node Import
```typescript
POST /api/nodes/bulk
Body: {
  format: "csv" | "json"
  data: string | Array<{
    parent?: string
    node: string
    summary?: string
    tags?: string
  }>
  autoCreateParents?: boolean
  deduplicateStrategy: "merge" | "skip" | "create_anyway"
}

Response: {
  created: number
  skipped: number
  merged: number
  nodes: Array<{id: string, title: string, action: string}>
}
```

### 4. Node Explanation
```typescript
POST /api/nodes/:id/explain
Body: {
  includeFailures?: boolean  // include recently failed cards
}

Response: {
  explanation: string  // 3-7 paragraphs
  checkpoints: string[]  // self-test questions
  suggestedCards?: Array<{
    front: string
    back: string
    reason: string
  }>
}
```

## 🤖 Agent Prompts

### Parse-Facts Agent
```markdown
You are a veterinary neurology fact processor. Convert messy student notes into atomic facts and spaced repetition cards.

CONTEXT:
- Domain: Veterinary neuroanatomy, embryology, clinical neurology
- Source: de Lahunta's Veterinary Neuroanatomy textbook
- User: Veterinary neurology resident taking rapid notes

INPUT FORMAT:
You receive:
1. Array of raw note lines (may have typos/shorthand)
2. For each note: relevant textbook chunks for context
3. List of existing nodes (concept categories)

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

Return ONLY the JSON array. No other text.
```

### Node Explainer Agent
```markdown
You are a veterinary neurology tutor explaining difficult concepts to a resident.

INPUT:
- Node title and path
- User's existing facts/cards for this node
- Relevant textbook excerpts
- Recently failed card content (if any)

OUTPUT:
Provide a structured explanation with:

1. CONCEPT OVERVIEW (1 paragraph)
   - What this concept IS
   - Why it matters clinically

2. KEY COMPONENTS (2-3 paragraphs)
   - Break down the main elements
   - Use the textbook excerpts
   - Reference specific anatomical structures

3. COMMON CONFUSIONS (1 paragraph)
   - What students typically mix up
   - Based on the failed cards if provided

4. CLINICAL RELEVANCE (1 paragraph)
   - How this appears in practice
   - Common lesion patterns

5. CHECKPOINTS (3-5 questions)
   - Self-test questions to verify understanding
   - Format: ["Can you explain...", "What happens when...", "List the..."]

6. SUGGESTED CARDS (optional, max 3)
   - Higher-order cards that test integration
   - Format: [{"front": "...", "back": "...", "reason": "Tests integration of X with Y"}]

Write at resident level - professional but not overly complex.
Focus on UNDERSTANDING the system, not memorizing lists.
```

## 🚀 Implementation Roadmap

### Phase 1: Core MVP (Week 1-2)
```typescript
Priority: Get the note→fact→card flow working perfectly

1. Database setup
   - Add pgvector extension
   - Implement new schema with embeddings
   - Migration from existing data

2. Parse-Facts Pipeline
   - OpenAI embedding generation
   - Vector similarity search for nodes
   - Parse-facts agent integration
   - Fact/variant creation endpoints

3. Quick Notes UI
   - Keyboard-first input form
   - Preview carousel component
   - Save & Next flow (Cmd+Enter)
   - Node auto-assignment

4. Basic node management
   - Fuzzy deduplication with Fuse.js
   - Parent/child relationships
   - Node strength calculation
```

### Phase 2: Chapter Import (Week 3)
```typescript
1. Chapter chunking pipeline
   - PDF text extraction
   - Smart chunking algorithm
   - Embedding generation

2. Node seeding from chapters
   - Heading extraction
   - Initial node tree creation
   - Chunk→Node linking

3. Import UI
   - Upload/paste interface
   - Preview & edit proposed nodes
   - Progress tracking
```

### Phase 3: Visual Integration (Week 4)
```typescript
1. Image infrastructure
   - S3/MinIO setup
   - Image upload endpoints
   - Embedding from captions

2. Image attachments
   - In Quick Notes flow
   - Chapter image extraction
   - Node image gallery

3. Manual occlusion editor
   - Konva.js canvas
   - Box drawing tools
   - Occlusion card generation
```

### Phase 4: Intelligence Layer (Week 5)
```typescript
1. Node explainer
   - Confusion detection
   - Explanation generation
   - Checkpoint questions

2. Smart features
   - Bulk import with AI parsing
   - CSV/JSON from ChatGPT/Claude
   - Parent auto-creation

3. Polish
   - Keyboard shortcuts everywhere
   - Optimistic updates
   - Progress animations
```

## 🎮 Key UX Decisions

1. **Node Assignment**: Auto-assign when confidence > 0.85, else → Unsorted
2. **Deduplication**: Show inline when similarity > 0.72, strong nudge at > 0.88
3. **Preview Flow**: Clean fact → 3 tabs → node chip → Save & Next
4. **Batch Size**: Max 20 notes per parse (balance speed vs cost)
5. **Retrieval**: 5 chunks + 10 nodes per note (enough context without overload)

## 📝 User Flow Examples

### Quick Notes → Cards Flow
1. User opens Quick Notes (keyboard shortcut: `N`)
2. Pastes/types messy bullets:
   ```
   CNS from neuroectoderm
   neural plate -> groove -> tube
   neural crest -> DRG + schwann
   ```
3. Hits Generate (`Cmd+Enter`)
4. Reviews preview carousel:
   - Sees cleaned fact
   - Tabs between Basic/Cloze/Explain
   - Node auto-selected (or shows "Unsorted")
5. Hits Save & Next repeatedly
6. Done in < 30 seconds for 10 notes

### Bulk Import from ChatGPT
1. User copies prompt from app:
   ```
   Give me 20 concise concept nodes (parent,node,summary,tags CSV)
   for "spinal cord localization" for a veterinary neurology study app.
   ```
2. Pastes ChatGPT output into Import modal
3. Reviews preview table with duplicate detection
4. Clicks "Create 18 nodes" (2 merged as duplicates)
5. Gets toast: "18 nodes created! Create cards for these nodes?"

### Confusion Helper
1. User fails 3+ cards in "Neural Crest" node
2. System shows: "Struggling with this concept? Get help"
3. User clicks "Explain this node"
4. Gets tailored explanation with:
   - Why they're likely confused
   - Key concepts broken down
   - 3-5 checkpoint questions
5. Optional: Generate integration cards

## 🔧 Technical Notes

### Embedding Strategy
- Use OpenAI `text-embedding-ada-002` (1536 dimensions)
- Store in PostgreSQL with pgvector extension
- Index with GIST for fast cosine similarity search
- Compute embeddings for:
  - Each chunk of chapter text
  - Each node title + summary
  - Each fact cleaned text
  - Each image caption + context

### Fuzzy Matching (Fuse.js)
```javascript
const fuseOptions = {
  includeScore: true,
  threshold: 0.28,  // Show matches with 72%+ similarity
  keys: [
    { name: 'title', weight: 0.7 },
    { name: 'summary', weight: 0.3 }
  ]
};
```

### Performance Optimizations
- Batch embedding requests (max 100 per call)
- Cache node embeddings in Redis
- Use database connection pooling
- Implement request queuing for AI calls
- Progressive enhancement (show UI immediately, enhance with AI)

## 🎨 UI/UX Guidelines

### Neon Aesthetic Maintained
- Thick glowing progress bars (8px+ with blur)
- Pink (#ff5ecd), Purple (#a34bff), Cyan (#00eaff) gradients
- Rounded pills for all buttons (border-radius: 48px)
- Triple-layer shadows for depth
- Animate everything (but keep it fast)

### Keyboard-First Design
- `N` - Open Quick Notes
- `Cmd+Enter` - Generate/Save & Next
- `Tab` - Switch card variants
- `Esc` - Cancel/Close
- `1/2/3/4` - Review ratings in study mode
- `/` - Global search

### Low-Friction Principles
1. Never require node selection upfront
2. Auto-save everything (no save buttons)
3. Optimistic updates (show success immediately)
4. Smart defaults (auto-select most likely option)
5. Batch operations (create multiple cards at once)

This architecture prioritizes **speed of input** over perfect organization. Lauren can dump notes, hit Generate, and get studying without friction. The system handles the complexity in the background.