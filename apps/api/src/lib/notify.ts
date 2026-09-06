/**
 * Best-effort new-brief email notification via Resend (https://resend.com).
 * Silently disabled when RESEND_API_KEY / NOTIFY_EMAIL are not configured,
 * so the API works identically with or without the integration.
 */
import type { Env } from '../env.js';

export async function notifyNewSubmission(
  env: Env,
  submission: { id: string; brandName: string; contactName: string; contactEmail: string },
): Promise<void> {
  if (!env.RESEND_API_KEY || !env.NOTIFY_EMAIL) return;

  const dashboardUrl = `${env.PUBLIC_BASE_URL.replace(/\/$/, '')}/admin`;
  const html = `
    <h2>New brand brief received</h2>
    <p><strong>Brand:</strong> ${escapeHtml(submission.brandName)}</p>
    <p><strong>Contact:</strong> ${escapeHtml(submission.contactName)}
       &lt;${escapeHtml(submission.contactEmail)}&gt;</p>
    <p><a href="${dashboardUrl}">Review in the dashboard →</a></p>
  `;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Brand Brief <noreply@resend.dev>',
        to: [env.NOTIFY_EMAIL],
        subject: `New brand brief: ${submission.brandName}`,
        html,
      }),
    });
    if (!res.ok) {
      console.error('notification failed', res.status, await res.text().catch(() => ''));
    }
  } catch (err) {
    console.error('notification error', err);
  }
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string,
  );
}
