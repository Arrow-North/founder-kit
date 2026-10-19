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
3. **Update the `FROM` constant** in `convex/email.ts`:

```typescript
const FROM = "Founder's Idea Kit <hello@yourdomain.com>";
```

## 🔗 Step 4: Set the Site URL (Optional)

The email button links to `<SITE_URL>/kit/<kitId>`. It defaults to `https://founder.arrownorth.design`:

```bash
npx convex env set SITE_URL https://founder.arrownorth.design
```

## 🚀 Step 5: How It Works

One email is sent per kit, from `kits.generateKit`, once the kit is ready:

1. User submits form (`kits.startKit`)
2. Kit generates in the background
3. Email is sent with one "Open your kit" button to `/kit/<kitId>` (no attachments)
4. The result is saved on the kit as `emailStatus` (`sent`, `skipped` or `failed`) plus `emailError`

If `RESEND_API_KEY` is missing the email is `skipped`; if Resend errors it is `failed`. Neither marks the kit failed.

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
