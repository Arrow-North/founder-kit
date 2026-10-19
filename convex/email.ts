/**
 * Kit-ready email, sent once per kit from kits.generateKit via Resend.
 */

import { Resend } from "resend";

const FROM = "Arrow North Team <lpham@arrownorth.design>";
const DEFAULT_SITE_URL = "https://founder.arrownorth.design";
const FONT = "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

export type KitEmailInput = {
  firstName: string;
  productName: string;
  pitch: string;
  kitId: string;
  stepCounts: { validate: number; design: number; build: number };
  siteUrl?: string;
};

export type EmailResult =
  | { emailStatus: "sent" }
  | { emailStatus: "skipped" | "failed"; emailError: string };

export function kitUrl(kitId: string, siteUrl?: string): string {
  const base = (siteUrl || process.env.SITE_URL || DEFAULT_SITE_URL).replace(/\/+$/, "");
  return `${base}/kit/${encodeURIComponent(kitId)}`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function phaseLines(counts: KitEmailInput["stepCounts"]): Array<[string, string]> {
  return [
    ["Validate", `${counts.validate} steps to check the problem with real people`],
    ["Design", `${counts.design} steps to shape the brief, journey and key screens`],
    ["Build", `${counts.build} steps with ready-to-paste prompts for your first version`],
  ];
}

export function buildKitEmail(input: KitEmailInput): { subject: string; html: string; text: string } {
  const url = kitUrl(input.kitId, input.siteUrl);
  const firstName = input.firstName.trim() || "there";
  const subject = `Your Founder Kit for ${input.productName} is ready`;
  const phases = phaseLines(input.stepCounts);
  const footnote = "This link never expires. Open it anytime, and use Save as PDF on the page to keep a copy.";

  const phaseRows = phases
    .map(
      ([name, line]) => `
              <tr>
                <td style="padding:6px 0;font-family:${FONT};font-size:15px;line-height:22px;color:#07331E;">
                  <strong>${name}</strong> &middot; ${escapeHtml(line)}
                </td>
              </tr>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background-color:#FFEED6;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#FFEED6;">
    <tr>
      <td align="center" style="padding:24px 12px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background-color:#FFEED6;">
          <tr>
            <td style="background-color:#07331E;padding:28px 32px;font-family:${FONT};">
              <div style="font-size:13px;line-height:18px;letter-spacing:1px;text-transform:uppercase;color:#F1BF3C;font-weight:600;">Arrow North</div>
              <div style="font-size:24px;line-height:32px;color:#FFEED6;font-weight:700;padding-top:6px;">Your Founder Kit is ready</div>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;font-family:${FONT};color:#07331E;">
              <p style="margin:0 0 16px 0;font-size:16px;line-height:24px;">Hi ${escapeHtml(firstName)},</p>
              <p style="margin:0 0 20px 0;font-size:16px;line-height:24px;">${escapeHtml(input.pitch)}</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px 0;">${phaseRows}
              </table>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px 0;">
                <tr>
                  <td align="center" bgcolor="#F1BF3C" style="background-color:#F1BF3C;border-radius:6px;">
                    <a href="${escapeHtml(url)}" target="_blank" style="display:inline-block;padding:14px 28px;font-family:${FONT};font-size:16px;line-height:20px;font-weight:700;color:#07331E;text-decoration:none;border-radius:6px;">Open your kit</a>
                  </td>
                </tr>
              </table>
              <p style="margin:0;font-size:14px;line-height:21px;color:#07331E;">${footnote}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = [
    `Hi ${firstName},`,
    "",
    input.pitch,
    "",
    ...phases.map(([name, line]) => `${name}: ${line}`),
    "",
    `Open your kit: ${url}`,
    "",
    footnote,
  ].join("\n");

  return { subject, html, text };
}

/**
 * Sends the kit email. Never throws: a missing key or send error is returned
 * so the caller can record it without failing the kit.
 */
export async function sendKitEmail(to: string, input: KitEmailInput): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn(`Kit ${input.kitId}: RESEND_API_KEY not set, email skipped`);
    return { emailStatus: "skipped", emailError: "RESEND_API_KEY environment variable is not set" };
  }

  try {
    const { subject, html, text } = buildKitEmail(input);
    const { error } = await new Resend(apiKey).emails.send({ from: FROM, to, subject, html, text });
    if (error) throw new Error(error.message);
    console.log(`Kit ${input.kitId}: email sent`);
    return { emailStatus: "sent" };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Kit ${input.kitId}: email failed:`, message);
    return { emailStatus: "failed", emailError: message };
  }
}
