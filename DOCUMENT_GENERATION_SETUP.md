# Document Generation System - Complete Setup

Your Convex backend now includes a complete document generation system that creates three types of professional documents using Google Gemini AI.

## 🎯 What Was Created

### 1. **File Storage System**
- `convex/storage.ts` - Helper functions for managing user documents
- Documents are stored in Convex's built-in file storage
- Each user gets their own folder structure

### 2. **AI Integration**
- `convex/gemini.ts` - Google Gemini API integration
- Includes all templates (TEMPLATE_A, TEMPLATE_B, TEMPLATE_C)
- Includes all system prompts (SYSTEM_A, SYSTEM_B, SYSTEM_C)
- Template filling logic to replace `<q1>` through `<q7>` with user answers

### 3. **Serverless Functions** (`convex/documentGeneration.ts`)

#### Three Individual Generation Functions:
1. **`createValidationDoc`** - Generates a User Interview Guide
   - Uses TEMPLATE_A + SYSTEM_A
   - Output: VALIDATION.md

2. **`createVibeCodingPrompt`** - Generates AI Coding Prompts
   - Uses TEMPLATE_B + SYSTEM_B
   - Output: VIBE_CODING.md

3. **`createUxPlaybook`** - Generates a UX Product Brief
   - Uses TEMPLATE_C + SYSTEM_C
   - Output: UX_PLAYBOOK.md

#### One Combined Function:
- **`generateAllDocuments`** - Generates all three documents in parallel (faster!)

### 4. **Query Functions** (`convex/documents.ts`)
- `getUserDocuments` - Get all documents for a user
- `getUserDocumentByType` - Get a specific document
- `getUserDocumentUrls` - Get download URLs for all documents
- `checkDocumentsComplete` - Check if all documents are ready

### 5. **Database Schema Updates** (`convex/schema.ts`)
- Added `userDocuments` table to track generated files
- Indexes for efficient querying by user and document type

## 🔧 Setup Required

### Step 1: Get Your Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/apikey)
2. Sign in and create an API key (it's free!)
3. Copy your API key

### Step 2: Add API Key to Convex

Run this command in your terminal:
```bash
npx convex env set GEMINI_API_KEY your-actual-api-key-here
```

Replace `your-actual-api-key-here` with the key you copied.

### Step 3: Restart Your Dev Server

```bash
npm run dev:full
```

## 🚀 How to Use

### Option 1: Generate All Documents (Recommended)

```typescript
import { useAction } from 'convex/react';
import { api } from '../convex/_generated/api';

function YourComponent() {
  const generateAllDocs = useAction(api.documentGeneration.generateAllDocuments);

  const handleGenerate = async () => {
    const result = await generateAllDocs({
      userId: "user@example.com", // or submission ID
      answers: {
        q1: "User's idea...",
        q2: "Target user...",
        q3: "Pain point...",
        q4: "Current workaround...",
        q5: "Solution...",
        q6: "Desired outcome...",
        q7: "Biggest uncertainty...",
      }
    });

    console.log("All documents generated!", result);
  };
}
```

### Option 2: Generate Individual Documents

```typescript
// Just validation doc
const createValidation = useAction(api.documentGeneration.createValidationDoc);
await createValidation({ userId, answers });

// Just vibe coding prompts
const createVibeCoding = useAction(api.documentGeneration.createVibeCodingPrompt);
await createVibeCoding({ userId, answers });

// Just UX playbook
const createUxPlaybook = useAction(api.documentGeneration.createUxPlaybook);
await createUxPlaybook({ userId, answers });
```

### Retrieve Generated Documents

```typescript
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';

function DocumentsList() {
  const documents = useQuery(api.documents.getUserDocumentUrls, {
    userId: "user@example.com"
  });

  return (
    <div>
      {documents?.map(doc => (
        <a key={doc._id} href={doc.fileUrl} download={doc.fileName}>
          Download {doc.fileName}
        </a>
      ))}
    </div>
  );
}
```

## 📝 Testing in Convex Dashboard

1. **Open Dashboard**: http://127.0.0.1:6790 (when running `npm run dev:full`)

2. **Navigate to Functions** tab

3. **Find and run**: `documentGeneration:generateAllDocuments`

4. **Paste this test data**:
```json
{
  "userId": "test@example.com",
  "answers": {
    "q1": "A platform that helps companies see their carbon emissions across their entire supply chain.",
    "q2": "Sustainability leads and ESG directors at large companies with complex, multi-input supply chains.",
    "q3": "They want to be more sustainable but can't track emissions due to the volume of data involved.",
    "q4": "They seek vendor support or make manual assumptions based on incomplete data.",
    "q5": "Centralizes all supply chain data, collects emissions across every input, and cross-references with historical benchmark data.",
    "q6": "Better decisions on sustainability, efficiency, supply chain predictability, and cost reduction.",
    "q7": "There are a lot of competitors. Differentiation will be key to standing out."
  }
}
```

5. **Click "Run function"** and wait 10-30 seconds

6. **Check results**:
   - Go to **Data** → **userDocuments** to see metadata
   - Go to **Storage** to see the actual markdown files
   - Run **documents:getUserDocumentUrls** to get download links

## 📂 File Structure

After generation, each user's documents are stored like this:

```
Convex Storage
└── user-docs/
    └── {userId}/
        ├── VALIDATION.md       (User Interview Guide)
        ├── VIBE_CODING.md      (AI Coding Prompts)
        └── UX_PLAYBOOK.md      (UX Product Brief)
```

## 🔄 Integration with Your App

Update `App.tsx` to generate documents after form submission:

```typescript
import { useAction } from 'convex/react';
import { api } from '../convex/_generated/api';

export function App() {
  const createSubmission = useMutation(api.submissions.createSubmission);
  const generateDocs = useAction(api.documentGeneration.generateAllDocuments);

  const handleEmailSubmit = async (email: string, firstName: string, lastName: string) => {
    try {
      // 1. Save the submission
      const submissionId = await createSubmission({
        firstName,
        lastName,
        email,
        answers: {
          q1: answers.q1 || '',
          q2: answers.q2 || '',
          // ... etc
        },
      });

      // 2. Generate documents (use email as userId)
      await generateDocs({
        userId: email, // or use submissionId
        answers: {
          q1: answers.q1 || '',
          q2: answers.q2 || '',
          // ... all 7 answers
        },
      });

      // 3. Move to loading screen
      setCurrentScreen('loading');
    } catch (error) {
      console.error('Error:', error);
      // Handle error
    }
  };

  // Rest of your app...
}
```

## 🎨 Displaying Results

Update `ResultsScreen.tsx` to show download links:

```typescript
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';

function ResultsScreen({ userId }: { userId: string }) {
  const documents = useQuery(api.documents.getUserDocumentUrls, { userId });

  return (
    <div>
      <h2>Your Documents Are Ready!</h2>
      {documents?.map(doc => (
        <a
          key={doc._id}
          href={doc.fileUrl}
          download={doc.fileName}
          className="btn-download"
        >
          📄 Download {doc.fileName}
        </a>
      ))}
    </div>
  );
}
```

## ⚡ Performance Notes

- **Generation time**: 10-30 seconds for all three documents
- **Free tier**: 15 requests/minute, 1M tokens/day (more than enough!)
- **Parallel generation**: All three docs generate simultaneously
- **Storage**: Unlimited file storage in Convex

## 🔒 Security

- ✅ API keys stored securely in Convex (never exposed to client)
- ✅ Documents isolated by userId
- ✅ File storage is private by default
- ✅ URLs expire after a period for security

## 📚 Additional Resources

- **Gemini Setup Guide**: See `GEMINI_SETUP.md`
- **Test Examples**: See `convex/testDocGeneration.ts`
- **Convex Setup**: See `CONVEX_SETUP.md`

## 🐛 Troubleshooting

### Error: "GEMINI_API_KEY environment variable is not set"
**Solution**: Run `npx convex env set GEMINI_API_KEY your-key`

### Documents not generating
**Check**:
1. Is the API key set correctly?
2. Check Convex logs in the dashboard
3. Verify your Gemini API quota at Google AI Studio

### Files not appearing
**Check**:
1. Query `documents:checkDocumentsComplete` to see status
2. Check the Storage tab in Convex dashboard
3. Verify the function completed without errors

## 🎉 You're All Set!

The document generation system is fully configured and ready to use. Just:
1. ✅ Set your Gemini API key
2. ✅ Test in the dashboard
3. ✅ Integrate into your app
4. ✅ Generate amazing documents for your users!
