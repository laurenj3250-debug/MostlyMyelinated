# AI Integration Guide

Complete guide to adding AI-powered features to MostlyMyelinated.

---

## Overview

The AI integration adds intelligent features powered by **Anthropic Claude**:

- **Fact Extraction**: Parse lecture notes/textbooks into structured facts
- **Smart Card Generation**: AI creates better flashcards than templates
- **Fact Improvement**: Get suggestions to optimize facts for learning
- **Batch Processing**: Convert large text blocks into study materials
- **Image Analysis**: (Future) Describe anatomical structures for occlusion

---

## Setup Instructions

### 1. Get Anthropic API Key

```bash
# 1. Sign up at https://console.anthropic.com
# 2. Go to API Keys section
# 3. Create a new API key
# Copy the key (starts with sk-ant-...)
```

### 2. Add API Key to Environment

**Local Development:**
```bash
cd backend

# Edit .env file
nano .env

# Add this line:
ANTHROPIC_API_KEY=sk-ant-your-actual-key-here
```

**Railway Production:**
```bash
railway variables set ANTHROPIC_API_KEY=sk-ant-your-actual-key-here
```

### 3. Install Dependencies

```bash
cd backend
npm install

# This installs @anthropic-ai/sdk automatically from package.json
```

### 4. Restart Backend

**Local:**
```bash
npm run dev
```

**Railway:**
```bash
git add .
git commit -m "Add AI integration"
git push railway main
```

---

## AI Features

### 1. Text Extraction

**Endpoint:** `POST /api/ai/extract-facts`

Converts raw text into structured facts.

**Example:**
```bash
curl -X POST http://localhost:3000/api/ai/extract-facts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nodeId": "node_id_here",
    "text": "The neural tube forms when neural folds fuse dorsally. This occurs during neurulation around day 18-26 in dogs. Failure of fusion leads to neural tube defects like spina bifida."
  }'
```

**Response:**
```json
{
  "success": true,
  "facts": [
    {
      "statement": "Neural folds fuse dorsally → neural tube",
      "factType": "association",
      "keyTerms": ["neural folds", "neural tube", "dorsal fusion"]
    },
    {
      "statement": "Neurulation occurs day 18-26 in dogs",
      "factType": "simple",
      "keyTerms": ["neurulation", "day 18-26", "dogs"]
    },
    {
      "statement": "Neural tube defect failure → spina bifida",
      "factType": "clinical",
      "keyTerms": ["neural tube defect", "spina bifida"]
    }
  ],
  "count": 3
}
```

### 2. AI Card Generation

**Endpoint:** `POST /api/ai/generate-cards`

Generates better cards than template system.

**Example:**
```bash
curl -X POST http://localhost:3000/api/ai/generate-cards \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "factId": "fact_id_here"
  }'
```

**Response:**
```json
{
  "success": true,
  "cards": [
    {
      "front": "What structures must fuse to form the neural tube?",
      "back": "Neural folds fuse dorsally",
      "cardType": "basic"
    },
    {
      "front": "Neural folds fuse in which direction to form the neural tube?",
      "back": "Dorsally",
      "hint": "Think about the anatomical position",
      "cardType": "basic"
    },
    {
      "front": "What is the result of dorsal fusion of neural folds?",
      "back": "Formation of the neural tube",
      "cardType": "basic"
    }
  ],
  "count": 3
}
```

### 3. Fact Improvement

**Endpoint:** `POST /api/ai/improve-fact`

Get suggestions to optimize facts.

**Example:**
```bash
curl -X POST http://localhost:3000/api/ai/improve-fact \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "factId": "fact_id_here"
  }'
```

**Response:**
```json
{
  "success": true,
  "original": "Brain thing makes neurons",
  "improved": "Neural stem cells in the subventricular zone differentiate into neurons (neurogenesis)",
  "reasoning": "Original was too vague. Improved version specifies: (1) the exact cell type (neural stem cells), (2) the location (subventricular zone), (3) the process name (neurogenesis), making it more precise and memorable."
}
```

### 4. Batch Processing

**Endpoint:** `POST /api/ai/batch-process`

Extract facts AND generate cards in one step.

**Example:**
```bash
curl -X POST http://localhost:3000/api/ai/batch-process \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nodeId": "node_id_here",
    "text": "Long text with multiple facts...",
    "autoGenerateCards": true
  }'
```

**Response:**
```json
{
  "success": true,
  "factsCreated": 5,
  "cardsCreated": 17,
  "facts": [...]
}
```

### 5. Generate Node Summary

**Endpoint:** `POST /api/ai/generate-summary`

Create concise summaries from facts.

**Example:**
```bash
curl -X POST http://localhost:3000/api/ai/generate-summary \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nodeId": "node_id_here"
  }'
```

**Response:**
```json
{
  "success": true,
  "summary": "Neural tube development occurs through dorsal fusion of neural folds during neurulation (days 18-26 in dogs). Proper closure is essential; failure leads to neural tube defects including spina bifida and anencephaly."
}
```

---

## Using AI in the Frontend

### 1. AI Text Extractor Component

The `AITextExtractor` component is now available on every Node Detail page.

**Features:**
- Paste lecture notes or textbook content
- AI extracts structured facts automatically
- Optionally generates cards from all facts
- Shows progress and results

**Usage:**
1. Navigate to any node
2. Find the "AI Text Extractor" section
3. Paste your text
4. Click "Extract Facts with AI"
5. Wait 10-30 seconds
6. Facts and cards appear automatically

### 2. AI Fact Improver Component

Get AI suggestions for better facts.

**Integration example:**
```tsx
import AIFactImprover from '../components/AIFactImprover';

// In your fact display:
<AIFactImprover
  factId={fact.id}
  currentStatement={fact.statement}
  onImproved={(improved) => {
    // Update fact with improved statement
  }}
/>
```

---

## Cost Management

### Anthropic Pricing (as of 2024)

**Claude 3.5 Sonnet:**
- Input: $3 per million tokens (~750k words)
- Output: $15 per million tokens (~750k words)

### Estimated Costs

**Typical operations:**
- Extract facts from 1 page of text: ~$0.01-0.02
- Generate 5 cards: ~$0.005-0.01
- Improve 1 fact: ~$0.002-0.005
- Batch process 10 pages: ~$0.10-0.20

**Monthly estimate for active user:**
- 50 extractions/month: ~$0.50-1.00
- 200 card generations: ~$1.00-2.00
- 100 improvements: ~$0.20-0.50
- **Total: ~$2-4/month per user**

### Cost Optimization Tips

1. **Cache results**: Store AI-generated content
2. **Rate limiting**: Add user quotas if needed
3. **Batch operations**: Process multiple items together
4. **Use templates first**: Fall back to AI for complex cases
5. **Monitor usage**: Set up Anthropic usage alerts

---

## Testing AI Features

### 1. Test Fact Extraction

```bash
# Create a test node first
NODE_ID="your-node-id"
TOKEN="your-auth-token"

# Test extraction
curl -X POST http://localhost:3000/api/ai/extract-facts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"nodeId\": \"$NODE_ID\",
    \"text\": \"Test text: The cerebellum coordinates motor movements. Damage causes ataxia.\"
  }"

# Should return extracted facts
```

### 2. Test in UI

1. **Create account** (if not already)
2. **Create a test node**: "Test AI Features"
3. **Scroll to AI Text Extractor**
4. **Paste this text**:
```
The spinal cord has three meninges: dura mater (outermost), arachnoid mater (middle), and pia mater (innermost). Cerebrospinal fluid flows in the subarachnoid space between the arachnoid and pia mater. Meningitis is inflammation of the meninges.
```
5. **Check "Auto-generate cards"**
6. **Click "Extract Facts with AI"**
7. **Wait for results**
8. **Verify**: Should extract 2-3 facts and generate 6-12 cards

---

## Troubleshooting

### Error: "Failed to extract facts"

**Possible causes:**
1. Missing API key
2. Invalid API key
3. Rate limiting
4. Network issues

**Solutions:**
```bash
# Check if API key is set
railway variables | grep ANTHROPIC

# Test API key directly
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{
    "model": "claude-3-5-sonnet-20241022",
    "max_tokens": 1024,
    "messages": [{"role": "user", "content": "Hello"}]
  }'

# Should return a response (not 401 or 403)
```

### Error: "Rate limit exceeded"

**Solution:**
```bash
# Wait a few minutes
# Or upgrade Anthropic plan
# Or implement request queuing
```

### Slow responses

**Expected:**
- Simple extractions: 5-15 seconds
- Complex batch operations: 20-60 seconds

**If slower:**
- Check network connection
- Verify API endpoint is responding
- Check Anthropic status page

---

## Advanced: Custom AI Prompts

### Customize Extraction Prompt

Edit `backend/src/services/aiService.ts`:

```typescript
export async function extractFactsFromText(text: string) {
  const prompt = `Extract VETERINARY neurology facts...

Focus on:
- Clinical presentations
- Neuroanatomical locations
- Diagnostic criteria
- Treatment options

${text}`;

  // ... rest of function
}
```

### Add New AI Features

Example: AI-powered quiz generation

```typescript
// backend/src/services/aiService.ts
export async function generateQuiz(nodeId: string) {
  const facts = await prisma.fact.findMany({ where: { nodeId } });

  const prompt = `Create a 10-question quiz from these facts:
  ${facts.map(f => f.statement).join('\n')}

  Format: Multiple choice, 4 options each.`;

  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }],
  });

  // Parse and return quiz
}
```

---

## Security Best Practices

### 1. Protect API Key

**Never commit API keys:**
```bash
# Check .gitignore includes:
.env
*.env
```

**Use environment variables only:**
```typescript
// ❌ Bad
const apiKey = 'sk-ant-...';

// ✅ Good
const apiKey = process.env.ANTHROPIC_API_KEY;
```

### 2. Rate Limiting

Add rate limits to prevent abuse:

```typescript
// backend/src/middleware/rateLimiter.ts
import rateLimit from 'express-rate-limit';

export const aiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per window
  message: 'Too many AI requests, please try again later',
});

// Apply to AI routes:
app.use('/api/ai', aiRateLimiter);
```

### 3. Input Validation

Sanitize user input before sending to AI:

```typescript
import { z } from 'zod';

const extractSchema = z.object({
  text: z.string().min(10).max(50000),
  nodeId: z.string().cuid(),
});

// Validate in route:
const validated = extractSchema.parse(req.body);
```

---

## Next Steps

### Upcoming AI Features

1. **Image occlusion**: AI identifies structures to hide
2. **Spaced repetition tuning**: AI suggests optimal intervals
3. **Performance prediction**: AI predicts exam readiness
4. **Content recommendations**: AI suggests what to study next
5. **Voice input**: Speak facts, AI structures them

### Contributing

To add new AI features:

1. Add function to `backend/src/services/aiService.ts`
2. Create route in `backend/src/routes/ai.ts`
3. Create frontend component in `frontend/src/components/`
4. Update this guide with examples

---

## Support

**Issues:**
- Check Anthropic status: https://status.anthropic.com
- Review API docs: https://docs.anthropic.com
- Open GitHub issue with error logs

**Cost concerns:**
- Monitor usage in Anthropic Console
- Set up budget alerts
- Consider caching frequently used results

---

Built with Claude 3.5 Sonnet - the AI that powers itself.
