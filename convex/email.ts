/**
 * Email sending with Resend API
 */

import { v } from "convex/values";
import { action } from "./_generated/server";
import { Resend } from "resend";
import { api } from "./_generated/api";

/**
 * Send email with Resend
 */
export const sendEmail = action({
  args: {
    to: v.string(),
    subject: v.string(),
    html: v.string(),
    from: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY environment variable is not set");
    }

    try {
      const resend = new Resend(apiKey);

      const result = await resend.emails.send({
        from: args.from || 'lpham@arrownorth.design',
        to: args.to,
        subject: args.subject,
        html: args.html,
      });

      console.log("Email sent successfully:", result);
      return {
        success: true,
        data: result,
      };
    } catch (error: any) {
      console.error("Error sending email:", error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  },
});

/**
 * Send Founder's Idea Kit email with all three documents
 */
export const sendFounderKitEmail = action({
  args: {
    to: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    documentUrls: v.object({
      validation: v.string(),
      vibeCoding: v.string(),
      uxPlaybook: v.string(),
    }),
  },
  handler: async (_ctx, args) => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY environment variable is not set");
    }

    try {
      const resend = new Resend(apiKey);

      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              line-height: 1.6;
              color: #07331E;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: #07331E;
              color: #FFEED6;
              padding: 30px 20px;
              border-radius: 8px 8px 0 0;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
            }
            .content {
              background: #FFEED6;
              padding: 30px 20px;
              border-radius: 0 0 8px 8px;
            }
            .greeting {
              font-size: 18px;
              margin-bottom: 20px;
            }
            .document-section {
              background: white;
              border: 2px solid #3B9B6D;
              border-radius: 8px;
              padding: 20px;
              margin: 15px 0;
            }
            .document-title {
              color: #3B9B6D;
              font-size: 16px;
              font-weight: bold;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 10px;
            }
            .document-description {
              color: #07331E;
              margin-bottom: 15px;
              font-size: 14px;
            }
            .download-btn {
              display: inline-block;
              background: #F1BF3C;
              color: #07331E;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 6px;
              font-weight: bold;
              font-size: 14px;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #3B9B6D;
              color: #07331E;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🎉 Your Founder's Idea Kit is Ready!</h1>
          </div>

          <div class="content">
            <p class="greeting">Hi ${args.firstName},</p>

            <p>Thank you for completing the Founder's Idea Kit workshop! Your personalized documents have been generated and are ready to download.</p>

            <p>Here are your three outputs:</p>

            <div class="document-section">
              <div class="document-title">📄 Output 1: Validation Document</div>
              <p class="document-description">
                A practical user interview guide with research questions tailored to your idea. Use this to validate your assumptions with real users.
              </p>
              <a href="${args.documentUrls.validation}" class="download-btn">Download Validation Doc</a>
            </div>

            <div class="document-section">
              <div class="document-title">💻 Output 2: Vibe Coding Prompts</div>
              <p class="document-description">
                Ready-to-use prompts for AI coding tools (Bolt, v0, Replit). Paste these to build your first demo quickly.
              </p>
              <a href="${args.documentUrls.vibeCoding}" class="download-btn">Download Coding Prompts</a>
            </div>

            <div class="document-section">
              <div class="document-title">🎨 Output 3: UX Playbook</div>
              <p class="document-description">
                A product brief with user flows and design priorities. Use this to guide your first design decisions.
              </p>
              <a href="${args.documentUrls.uxPlaybook}" class="download-btn">Download UX Playbook</a>
            </div>

            <p style="margin-top: 30px;">
              <strong>What's next?</strong><br>
              These documents are your starting point. Use them to talk to users, build a prototype, or plan your next steps.
            </p>

            <p>This framework is reusable—same seven questions, any idea. Come back anytime!</p>

            <div class="footer">
              <p>Built with the Founder's Idea Kit<br>
              Questions? Just reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const result = await resend.emails.send({
        from: 'Arrow North Team <lpham@arrownorth.design>',
        to: args.to,
        subject: `${args.firstName}, Your Founder's Idea Kit is Ready! 🎉`,
        html: emailHtml,
      });

      console.log("Founder Kit email sent successfully:", result);
      return {
        success: true,
        data: result,
      };
    } catch (error: any) {
      console.error("Error sending Founder Kit email:", error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  },
});

/**
 * Fetch document URLs and send Founder's Idea Kit email
 * This combines fetching the URLs from the database and sending the email
 */
export const sendFounderKitEmailWithDocs = action({
  args: {
    userId: v.string(),
    firstName: v.string(),
    lastName: v.string(),
  },
  handler: async (ctx, args): Promise<{ success: boolean; data: any }> => {
    console.log(`📧 Fetching document URLs for ${args.userId}...`);

    // Query the documents for this user
    const documents = await ctx.runQuery(api.documents.getUserDocumentUrls, {
      userId: args.userId,
    });

    if (!documents || documents.length === 0) {
      throw new Error("No documents found for this user");
    }

    // Build document URLs object
    const documentUrls: Record<string, string> = {};
    for (const doc of documents) {
      if (doc.docType === 'VALIDATION' && doc.fileUrl) {
        documentUrls.validation = doc.fileUrl;
      } else if (doc.docType === 'VIBE_CODING' && doc.fileUrl) {
        documentUrls.vibeCoding = doc.fileUrl;
      } else if (doc.docType === 'UX_PLAYBOOK' && doc.fileUrl) {
        documentUrls.uxPlaybook = doc.fileUrl;
      }
    }

    // Verify all documents are available
    if (!documentUrls.validation || !documentUrls.vibeCoding || !documentUrls.uxPlaybook) {
      const missing = [];
      if (!documentUrls.validation) missing.push('Validation Document');
      if (!documentUrls.vibeCoding) missing.push('Vibe Coding Prompts');
      if (!documentUrls.uxPlaybook) missing.push('UX Playbook');
      throw new Error(`Missing documents: ${missing.join(', ')}`);
    }

    console.log(`✓ Found all 3 documents, sending email to ${args.userId}...`);

    // Send the email using the existing sendFounderKitEmail action
    const result = await ctx.runAction(api.email.sendFounderKitEmail, {
      to: args.userId,
      firstName: args.firstName,
      lastName: args.lastName,
      documentUrls: {
        validation: documentUrls.validation,
        vibeCoding: documentUrls.vibeCoding,
        uxPlaybook: documentUrls.uxPlaybook,
      },
    });

    return result;
  },
});
