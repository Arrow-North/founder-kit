# Convex Setup Guide

This application uses Convex as a backend to store form submissions.

## What's Been Set Up

1. **Convex Schema** (`convex/schema.ts`)
   - Defines the data structure for storing submissions
   - Includes user info (firstName, lastName, email)
   - Stores all 7 question answers
   - Indexes for efficient querying by email and submission time

2. **Convex Functions** (`convex/submissions.ts`)
   - `createSubmission`: Mutation to save a new submission
   - `getAllSubmissions`: Query to retrieve all submissions
   - `getSubmissionsByEmail`: Query to get submissions by email

3. **React Integration**
   - ConvexProvider wraps the app in `src/index.tsx`
   - App.tsx uses the `createSubmission` mutation
   - Submissions are automatically saved when users complete the form

## Running the Application

### Option 1: Run Both Servers Separately

**Terminal 1 - Convex Dev Server:**
```bash
npx convex dev
```

**Terminal 2 - Vite Dev Server:**
```bash
npm run dev
```

### Option 2: Use the Combined Script

Add this script to your `package.json`:
```json
{
  "scripts": {
    "dev:full": "concurrently \"npx convex dev\" \"npm run dev\""
  }
}
```

Then install concurrently:
```bash
npm install -D concurrently
```

And run:
```bash
npm run dev:full
```

## Accessing the Convex Dashboard

When you run `npx convex dev`, you'll see a dashboard URL in the terminal, typically:
- Local: `http://127.0.0.1:6790`

From the dashboard, you can:
- View all submissions in real-time
- Query data using the Data tab
- Monitor function calls
- Export data

## Deploying to Production

1. Create a Convex account at https://convex.dev
2. Run `npx convex deploy` to deploy your functions
3. Update your `.env.local` or production environment variables with the production Convex URL

## Data Structure

Each submission contains:
```typescript
{
  firstName: string,
  lastName: string,
  email: string,
  answers: {
    q1: string,  // What's your idea?
    q2: string,  // Who specifically has this problem?
    q3: string,  // What's the pain point?
    q4: string,  // What's their current workaround?
    q5: string,  // What does your solution do?
    q6: string,  // What changes for them?
    q7: string,  // What are you most unsure about?
  },
  submittedAt: number  // Unix timestamp
}
```

## Querying Submissions

You can add more queries in `convex/submissions.ts`. For example:

```typescript
// Get recent submissions
export const getRecentSubmissions = query({
  args: { limit: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("submissions")
      .order("desc")
      .take(args.limit);
  },
});
```

## Environment Variables

The following environment variables are set in `.env.local`:
- `CONVEX_DEPLOYMENT`: Your Convex deployment name
- `VITE_CONVEX_URL`: The Convex client URL
- `VITE_CONVEX_SITE_URL`: The Convex HTTP actions URL

These are automatically generated when you run `npx convex dev` for the first time.
