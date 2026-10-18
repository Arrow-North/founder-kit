# Google Gemini API Setup

This application uses Google Gemini 1.5 Flash to generate three types of documents:
1. Validation Document (User Interview Guide)
2. Vibe Coding Prompts
3. UX Playbook

## Getting Your Gemini API Key

### Step 1: Get a Google Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Sign in with your Google account
3. Click **"Get API Key"** or **"Create API Key"**
4. Copy your API key

**Note:** The Gemini 1.5 Flash model has a generous free tier, perfect for this application.

### Step 2: Add API Key to Convex

You need to add the API key as an environment variable in Convex.

#### For Local Development:

Run this command in your terminal:
```bash
npx convex env set GEMINI_API_KEY your-api-key-here
```

Replace `your-api-key-here` with your actual API key from Google AI Studio.

#### For Production:

1. Run `npx convex deploy` to deploy to production
2. Set the environment variable for production:
```bash
npx convex env set GEMINI_API_KEY your-api-key-here --prod
```

### Step 3: Verify Setup

After setting the environment variable, restart your Convex dev server:
```bash
npm run dev:full
```

## How the Document Generation Works

### 1. User Submits Form
When a user completes all 7 questions and submits their email, the app:
- Saves the submission to the database
- Triggers document generation

### 2. Template Filling
Each function takes the user's answers and fills in the templates:
- `<q1>` → User's idea
- `<q2>` → Target user
- `<q3>` → Pain point
- `<q4>` → Current workaround
- `<q5>` → Solution
- `<q6>` → Desired outcome
- `<q7>` → Biggest uncertainty

### 3. Gemini Generation
The filled templates are sent to Google Gemini 1.5 Flash with specific system prompts that instruct the AI to generate:
- **Validation Doc**: A practical user interview guide
- **Vibe Coding Prompts**: Ready-to-use prompts for AI coding tools
- **UX Playbook**: A product brief with user flows

### 4. File Storage
Generated documents are saved as markdown files in Convex storage under each user's ID:
```
user-docs/
  └── {userId}/
      ├── VALIDATION.md
      ├── VIBE_CODING.md
      └── UX_PLAYBOOK.md
```

## Available Functions

### Generate Individual Documents

```typescript
// Generate validation doc only
await convex.action(api.documentGeneration.createValidationDoc, {
  userId: "user@example.com",
  answers: {
    q1: "A platform...",
    q2: "Sustainability leads...",
    // ... etc
  }
});

// Generate vibe coding prompts only
await convex.action(api.documentGeneration.createVibeCodingPrompt, {
  userId: "user@example.com",
  answers: { ... }
});

// Generate UX playbook only
await convex.action(api.documentGeneration.createUxPlaybook, {
  userId: "user@example.com",
  answers: { ... }
});
```

### Generate All Documents at Once

```typescript
await convex.action(api.documentGeneration.generateAllDocuments, {
  userId: "user@example.com",
  answers: {
    q1: "...",
    q2: "...",
    // ... all 7 answers
  }
});
```

## Integrating with Your App

Update `App.tsx` to call the document generation after submission:

```typescript
import { useAction } from 'convex/react';
import { api } from '../convex/_generated/api';

// In your component:
const generateDocs = useAction(api.documentGeneration.generateAllDocuments);

const handleEmailSubmit = async (email: string, firstName: string, lastName: string) => {
  // Save submission first
  await createSubmission({ ... });

  // Generate documents
  await generateDocs({
    userId: email, // or use submission ID
    answers: answers
  });

  setCurrentScreen('loading');
};
```

## Costs

Google Gemini 1.5 Flash pricing (as of 2024):
- **Free tier**: 15 requests per minute, 1 million tokens per day
- **Paid tier**: $0.075 per 1 million tokens (very affordable)

For this use case with short documents, the free tier is more than sufficient for development and moderate production use.

## Troubleshooting

### "GEMINI_API_KEY environment variable is not set"
- Run: `npx convex env set GEMINI_API_KEY your-key`
- Restart your dev server

### "API key not valid"
- Verify your API key at [Google AI Studio](https://aistudio.google.com/apikey)
- Make sure you copied the full key
- Check for extra spaces in the key

### Documents not generating
- Check Convex logs in the dashboard
- Verify the API key is set correctly
- Check your Gemini API quota at Google AI Studio

## Security Notes

- **Never commit API keys to git**
- API keys are stored securely in Convex environment variables
- Keys are only accessible to serverless functions, not client code
- Each user's documents are isolated by userId
