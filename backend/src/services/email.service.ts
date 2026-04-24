import nodemailer from 'nodemailer';
import { config } from '../config/env';
import { logger } from '../utils/logger';

const transporter = nodemailer.createTransport({
  host: config.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(config.SMTP_PORT || '587'),
  auth: {
    user: config.SMTP_USER,
    pass: config.SMTP_PASS,
  },
});

const from = config.SMTP_FROM || 'TaskFlow <noreply@taskflow.app>';

export const sendInviteEmail = async (to: string, orgName: string, token: string) => {
  const link = `${config.CLIENT_URL}/invite/${token}`;
  try {
    await transporter.sendMail({
      from,
      to,
      subject: `You've been invited to ${orgName} on TaskFlow`,
      html: `
        <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto;">
          <h2>You're invited!</h2>
          <p>You've been invited to join <strong>${orgName}</strong> on TaskFlow.</p>
          <a href="${link}" style="display:inline-block;padding:12px 24px;background:#6366f1;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">
            Accept Invitation
          </a>
          <p style="color:#888;font-size:12px;margin-top:24px;">This link expires in 7 days.</p>
        </div>
      `,
    });
  } catch (err) {
    logger.error('Failed to send invite email', err);
  }
};

export const sendTaskAssignedEmail = async (to: string, taskTitle: string, assignerName: string) => {
  try {
    await transporter.sendMail({
      from,
      to,
      subject: `You've been assigned: ${taskTitle}`,
      html: `
        <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto;">
          <h2>New task assigned</h2>
          <p><strong>${assignerName}</strong> assigned you a task:</p>
          <div style="border-left:4px solid #6366f1;padding:12px 16px;margin:16px 0;background:#f8f8ff;">
            <strong>${taskTitle}</strong>
          </div>
          <a href="${config.CLIENT_URL}" style="display:inline-block;padding:12px 24px;background:#6366f1;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">
            View Task
          </a>
        </div>
      `,
    });
  } catch (err) {
    logger.error('Failed to send task assigned email', err);
  }
};
