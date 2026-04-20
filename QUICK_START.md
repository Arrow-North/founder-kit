# 🚀 Quick Start Guide - Document Generation

Your app is now fully integrated with AI-powered document generation! Here's what to do next:

## ✅ What's Integrated

When a user submits the form, the app automatically:
1. ✅ Saves their submission to the database
2. ✅ Generates a **Validation Document** (User Interview Guide)
3. ✅ Generates **Vibe Coding Prompts** (AI coding instructions)
4. ✅ Generates a **UX Playbook** (Product brief)
5. ✅ Shows download links on the results screen

## 🔑 Required: Set Your Gemini API Key

### Step 1: Get Your Free API Key

1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the key

### Step 2: Set the Environment Variable

```bash
npx convex env set GEMINI_API_KEY your-api-key-here
```

Replace `your-api-key-here` with your actual key.

### Step 3: Start Your App

```bash
npm run dev:full
```

This runs both Convex and Vite servers.

## 🧪 Test It Out

### Option 1: Test Through the App

1. Open http://localhost:5173 (or the port shown)
2. Fill out all 7 questions
3. Enter your email
4. Wait ~30 seconds on the loading screen
5. See your generated documents with download links!

### Option 2: Test in Convex Dashboard

1. Open http://127.0.0.1:6790 (Convex dashboard)
2. Go to **Functions** → `documentGeneration:generateAllDocuments`
3. Click **Run** and paste:

```json
{
  "userId": "test@example.com",
  "answers": {
    "q1": "A platform that helps companies track carbon emissions",
    "q2": "Sustainability leads at large enterprises",
    "q3": "Can't track emissions across complex supply chains",
    "q4": "Manual spreadsheets and vendor emails",
    "q5": "Centralizes emissions data with automated tracking",
    "q6": "Make confident sustainability decisions with real data",
    "q7": "Whether we can differentiate from competitors"
  }
}
```

4. Wait ~30 seconds
5. Check **Storage** tab to see the generated markdown files!

## 📋 What Happens When Users Submit

### Timeline:

```
User submits form
  ↓
Submission saved to database (instant)
  ↓
Loading screen appears
  ↓
Document 1: Validation Doc generates (10s)
  ↓
Document 2: Vibe Coding Prompts generates (10s)
  ↓
Document 3: UX Playbook generates (10s)
  ↓
Total: ~30 seconds
  ↓
Results screen with download links appears
```

### User Experience:

1. **Question Screens**: User answers 7 questions
2. **Email Screen**: User enters name and email
3. **Loading Screen**: Shows "Generating your personalized documents with AI..." (35 seconds)
4. **Results Screen**:
   - Shows 3 download buttons for the generated documents
   - Each button downloads a markdown file
   - Also shows a preview of the documents

## 🎯 Features Implemented

### In App.tsx:
- ✅ Imports document generation actions
- ✅ Calls `createValidationDoc` after submission
- ✅ Calls `createVibeCodingPrompt` after validation doc
- ✅ Calls `createUxPlaybook` after coding prompts
- ✅ Passes userId (email) to ResultsScreen
- ✅ Error handling with console logs and alerts

### In LoadingScreen.tsx:
- ✅ Extended wait time to 35 seconds
- ✅ Updated messaging about AI generation

### In ResultsScreen.tsx:
- ✅ Fetches user's generated documents
- ✅ Shows download buttons for all 3 documents
- ✅ Beautiful UI with icons
- ✅ Loading state while documents are being fetched

## 📂 Generated Files

Each user gets 3 markdown files:
- **VALIDATION.md** - User interview guide with research questions
- **VIBE_CODING.md** - Ready-to-paste prompts for AI coding tools
- **UX_PLAYBOOK.md** - Product brief with user flows

Files are stored in Convex storage at:
```
user-docs/{userId}/VALIDATION.md
user-docs/{userId}/VIBE_CODING.md
user-docs/{userId}/UX_PLAYBOOK.md
```

## 🔍 Monitoring & Debugging

### Check Console Logs:

The app logs each step:
```
Saving submission...
✓ Submission saved successfully!
Generating validation document...
✓ Validation document generated!
Generating vibe coding prompts...
✓ Vibe coding prompts generated!
Generating UX playbook...
✓ UX playbook generated!
🎉 All documents generated successfully!
```

### Check Convex Dashboard:

1. **Data Tab** → `submissions` - See all form submissions
2. **Data Tab** → `userDocuments` - See metadata for generated docs
3. **Storage Tab** - See the actual markdown files
4. **Logs Tab** - See function execution logs

### Common Issues:

**"GEMINI_API_KEY environment variable is not set"**
- Solution: Run `npx convex env set GEMINI_API_KEY your-key`

**Alert appears: "There was an error generating your documents"**
- Check the console for detailed error messages
- Verify API key is set correctly
- Check you have quota remaining at [Google AI Studio](https://aistudio.google.com)

**Documents don't appear on results screen**
- Wait the full 35 seconds on loading screen
- Check browser console for errors
- Verify documents were created in Convex dashboard

## 💡 Tips

1. **Free Tier is Generous**: Google Gemini 1.5 Flash has 15 requests/min and 1M tokens/day free
2. **Sequential Generation**: Documents generate one at a time to stay within rate limits
3. **User ID**: We use email as the user ID, but you could use submission ID instead
4. **Error Handling**: Errors show an alert but still proceed to results (adjust as needed)

## 🎨 Customization Ideas

Want to customize? Here are some ideas:

- **Send Email**: Add email delivery using a service like Resend or SendGrid
- **Progress Indicator**: Show which document is currently generating
- **Preview**: Show document previews instead of just downloads
- **Regenerate**: Add a button to regenerate individual documents
- **History**: Show all past submissions and their documents

## 📚 More Documentation

- **Complete Setup**: `DOCUMENT_GENERATION_SETUP.md`
- **Gemini API**: `GEMINI_SETUP.md`
- **Convex Setup**: `CONVEX_SETUP.md`

## ✨ You're Ready!

Your app now automatically generates professional, personalized documents for every user submission. Just set your API key and start testing! 🚀
