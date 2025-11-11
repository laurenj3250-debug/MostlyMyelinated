# Feature Idea: PDF Highlighter + Fact Extraction

## Concept

Allow users to upload PDFs, read and highlight important passages directly in the app, then extract those highlights into facts and flashcards with one click.

## Workflow

1. **Upload PDF** → View full textbook chapter in app
2. **Read & Highlight** → Select/highlight text while reading
3. **Extract Facts** → Click "Extract Facts from Highlights" button
4. **AI Processing** → Highlighted text cleaned into atomic facts
5. **Review & Generate** → Review facts, generate flashcards
6. **Auto-Link** → Facts/cards automatically linked to relevant nodes

## Benefits

- **Natural workflow** - Highlight while reading, just like physical textbooks
- **User control** - YOU decide what's important, not AI extracting everything
- **Visual context** - See highlights in original text layout
- **Less overwhelming** - Process one section at a time
- **Better retention** - Active reading + highlighting engages learning

## Use Cases

- Reading through textbook chapters methodically
- Capturing specific details during focused study
- Extracting key points from lecture slides
- Processing research papers or journal articles
- Building facts from only relevant sections (not entire chapters)

## Technical Requirements

### Frontend Components
1. **PDF Viewer**
   - Library: `react-pdf` or `pdf.js`
   - Display PDF with proper pagination
   - Zoom, scroll, navigation controls

2. **Annotation Layer**
   - Library: `react-pdf-highlighter`
   - Select text with mouse/touch
   - Save highlight positions (page, coordinates, text)
   - Visual highlight overlay (yellow, persistent)

3. **Highlight Manager**
   - Sidebar showing all highlights
   - Edit/delete highlights
   - Group by page/node
   - Export highlights

4. **Quick Extract Button**
   - "Send Highlights to AI" action
   - Progress indicator during processing
   - Review extracted facts before finalizing

### Backend Endpoints

```typescript
// Upload and store PDF
POST /api/pdfs/upload
- multipart/form-data
- Store in S3/local storage
- Return PDF ID

// Save highlights
POST /api/pdfs/:id/highlights
- Body: { page, position, text, color, nodeId? }
- Persist highlight metadata

// Extract facts from highlights
POST /api/pdfs/:id/extract-facts
- Body: { highlightIds: string[] }
- Send highlighted text to /facts/parse
- Return parsed facts
```

### Integration Points

- **Existing `/facts/parse` endpoint** - Already handles text → facts → cards
- **Node linking** - Associate PDF with node (e.g., "Chapter 8" node)
- **Fact assignment** - Extracted facts inherit node association
- **Quick Notes** - Similar UX to Quick Notes but with PDF context

## Implementation Options

### Option A: Full PDF Highlighter (Robust)
**Estimated Time:** 2-3 hours

**Features:**
- In-app PDF viewer with highlighting
- Persistent highlight storage
- Visual highlight management UI
- Seamless fact extraction workflow

**Pros:**
- Best user experience
- Professional feature
- No copy/paste needed

**Cons:**
- More complex implementation
- PDF rendering performance considerations
- Additional dependencies

### Option B: Quick Notes Enhancement (Quick Win)
**Estimated Time:** 15 minutes

**Features:**
- Enhance Quick Notes with "Paste from PDF" guidance
- Better handling of pasted text (clean formatting)
- Optional node preselection

**Pros:**
- Works with existing infrastructure
- Fast to implement
- No new dependencies

**Cons:**
- Manual copy/paste required
- No visual highlight persistence
- Less elegant workflow

### Option C: Hybrid Approach
**Estimated Time:** 1 hour

**Features:**
- Simple PDF viewer (read-only)
- Copy text with "Extract Facts" button
- Auto-send to Quick Notes workflow

**Pros:**
- Balanced implementation time
- Better than pure copy/paste
- Leverages existing code

**Cons:**
- Still requires manual selection
- Highlights not persistent

## Future Enhancements

- **OCR Support** - Extract text from image-based PDFs
- **Annotation Types** - Notes, comments, bookmarks
- **Collaborative Highlights** - Share highlights with study groups
- **Smart Suggestions** - AI suggests passages to highlight
- **Spaced Repetition** - Review highlights over time
- **Export Options** - Export highlights to Notion, Anki, etc.

## Related Features

- **Image Occlusion** - Already have image annotation system
- **Quick Notes** - Similar AI-powered fact extraction
- **Node Structure** - PDF chapters link to node hierarchy

## Priority

**Status:** Future Enhancement / Phase 3

**Dependencies:**
- Phase 1: ✅ Basic node/card system
- Phase 2: ✅ Textbook import, Quick Notes
- Phase 3: 🔄 PDF highlighter (this feature)

**User Need:** High - More natural than whole-chapter extraction

**Implementation Complexity:** Medium-High

## Notes

- Consider mobile support (touch-based highlighting)
- PDF storage costs (compress, or stream from external storage)
- Privacy: User-uploaded PDFs may be copyrighted material
- Performance: Large PDFs (100+ pages) need pagination/lazy loading
