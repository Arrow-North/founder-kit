# Fix Gemini API Issue

## ❌ Current Problem

The API key is not working with the Gemini models. This is likely because:

1. The API key is from the wrong source
2. The Generative AI API is not enabled
3. The API key has restricted permissions

## ✅ Solution: Get a New API Key

### Step 1: Go to Google AI Studio

**IMPORTANT:** Do NOT use Google Cloud Console. Use Google AI Studio instead.

👉 **Go to: https://aistudio.google.com/app/apikey**

### Step 2: Create a New API Key

1. Click **"Create API key"**
2. Choose **"Create API key in new project"** or select an existing project
3. **Copy the entire API key**

### Step 3: Set the New API Key in Convex

```bash
npx convex env set GEMINI_API_KEY your-new-api-key-here
```

Make sure to replace `your-new-api-key-here` with the FULL API key you just copied.

### Step 4: Restart Everything

```bash
# Stop any running servers (Ctrl+C)
# Then restart:
npm run dev:full
```

## 🧪 Test the New Key

Run this command to verify:

```bash
node test-gemini-simple.js
```

If you see "✅ Success!", you're all set!

## Common Issues

### Issue: "API key not found for API version v1beta"

**Solution:** You're using an API key from Google Cloud Console instead of Google AI Studio.
- ✅ Use: https://aistudio.google.com/app/apikey
- ❌ Don't use: Google Cloud Console API keys

### Issue: "Permission denied" or "403 Forbidden"

**Solution:** The API needs to be enabled.
1. Go to https://aistudio.google.com
2. Make sure you're signed in
3. Try generating content in the studio first
4. Then create a new API key

### Issue: "Quota exceeded"

**Solution:**
1. Check your quota at: https://aistudio.google.com
2. You get 15 requests/min and 1M tokens/day for free
3. Wait a bit or upgrade if needed

## 🆕 Alternative: Use a Different Model

If Gemini models aren't available, you could also use:
- OpenAI GPT-4 or GPT-3.5
- Anthropic Claude
- Cohere

Let me know if you need help switching to a different model!

## Need Help?

If you're still stuck:
1. Go to https://aistudio.google.com/app/apikey
2. Delete the old API key
3. Create a brand new one
4. Copy it completely
5. Set it in Convex: `npx convex env set GEMINI_API_KEY your-new-key`
6. Restart: `npm run dev:full`
