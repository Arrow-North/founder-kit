# Resend Email Setup

This guide will help you set up email delivery for the Founder's Idea Kit using Resend.

## 🔑 Step 1: Get Your Resend API Key

1. **Go to:** https://resend.com
2. **Sign up** for a free account
3. **Go to API Keys** in the dashboard
4. **Create API Key**
5. **Copy your API key** - it looks like: `re_xxxxxxxxx`

## 🔧 Step 2: Set the API Key in Convex

Run this command in your terminal:

```bash
npx convex env set RESEND_API_KEY re_xxxxxxxxx
```

**Replace `re_xxxxxxxxx` with your actual API key!**

## 📧 Step 3: Configure Your Sending Domain (Optional)

By default, emails are sent from `onboarding@resend.dev`. To use your own domain:

1. **Add your domain** in Resend dashboard
2. **Verify DNS records** (Resend provides the records)
3. **Update the `from` address** in `convex/email.ts`:

```typescript
from: 'Founder\'s Idea Kit <hello@yourdomain.com>',
```

## 🧪 Step 4: Test the Email Function

You can test the email function in the Convex dashboard:

1. Open: http://127.0.0.1:6790
2. Go to **Functions** → `email:sendEmail`
3. Run with test data:

```json
{
  "to": "your-email@example.com",
  "subject": "Test Email",
  "html": "<p>This is a test email!</p>"
}
```

## 🚀 Step 5: Integrate with Form Submission

The email is automatically sent after documents are generated. The flow:

1. User submits form
2. Documents generate (30-60 seconds)
3. Email is sent with download links
4. User sees results screen

## 📋 What's Included

### Two Email Functions:

**1. `sendEmail` (Generic)**
```typescript
await sendEmail({
  to: "user@example.com",
  subject: "Hello!",
  html: "<p>Your content here</p>",
  from: "optional@yourdomain.com"
});
```

**2. `sendFounderKitEmail` (Specialized)**
```typescript
await sendFounderKitEmail({
  to: "user@example.com",
  firstName: "John",
  lastName: "Doe",
  documentUrls: {
    validation: "https://...",
    vibeCoding: "https://...",
    uxPlaybook: "https://..."
  }
});
```

## 🎨 Email Template Features

The Founder Kit email includes:
- ✅ Beautiful branded design
- ✅ Personalized greeting
- ✅ Three download buttons
- ✅ Description of each document
- ✅ Mobile-responsive
- ✅ Professional styling

## 💰 Pricing

**Resend Free Tier:**
- 3,000 emails/month
- 100 emails/day
- Perfect for getting started!

**Paid Plans:**
- Start at $20/month
- 50,000 emails included
- More at: https://resend.com/pricing

## 🐛 Troubleshooting

### "RESEND_API_KEY environment variable is not set"
**Solution:** Run `npx convex env set RESEND_API_KEY your-key`

### "Domain not verified"
**Solution:**
- Use default `onboarding@resend.dev` for testing
- Or verify your domain in Resend dashboard

### Emails not arriving
**Check:**
1. Spam folder
2. API key is correct
3. Recipient email is valid
4. Check Resend dashboard logs

### Rate limit exceeded
**Solution:**
- Free tier: 100 emails/day
- Upgrade plan if needed
- Check usage in Resend dashboard

## 📊 Monitoring

**View email logs:**
1. Go to https://resend.com/dashboard
2. Click **Emails** in sidebar
3. See all sent emails with status
4. View opens, clicks, bounces

## 🔒 Security Best Practices

- ✅ Never commit API keys to git
- ✅ API key is stored securely in Convex environment
- ✅ Only serverless functions can access it
- ✅ Not exposed to client code

## 🎯 Next Steps

Once set up:
1. Test the email function
2. Customize the email template
3. Update the "from" address
4. Monitor delivery in Resend dashboard

Your email system is ready to go! 🚀
