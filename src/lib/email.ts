import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  if (!process.env.SMTP_USER) {
    console.warn('SMTP not configured, skipping email send');
    return { success: false, error: 'SMTP not configured' };
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.FROM_EMAIL || process.env.SMTP_USER,
      to,
      subject,
      html,
      text,
    });

    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email send failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Email templates
export const emailTemplates = {
  jobAlert: (jobTitle: string, companyName: string, jobUrl: string) => ({
    subject: `New Job Alert: ${jobTitle} at ${companyName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New Job Opportunity</h2>
        <p>A new job matching your alert criteria has been posted:</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #1f2937;">${jobTitle}</h3>
          <p style="margin: 0; color: #6b7280;">${companyName}</p>
        </div>
        <a href="${jobUrl}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Job</a>
        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
          This email was sent because you have an active job alert. 
          You can manage your alerts in your <a href="${process.env.APP_URL}/job-alerts">dashboard</a>.
        </p>
      </div>
    `
  }),

  applicationReceived: (applicantName: string, jobTitle: string, applicationUrl: string) => ({
    subject: `New Application: ${jobTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New Job Application</h2>
        <p>You have received a new application for your job posting:</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #1f2937;">${jobTitle}</h3>
          <p style="margin: 0; color: #6b7280;">Applicant: ${applicantName}</p>
        </div>
        <a href="${applicationUrl}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Review Application</a>
      </div>
    `
  }),

  welcomeJobSeeker: (name: string) => ({
    subject: 'Welcome to Cyprus Jobs!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Welcome to Cyprus Jobs, ${name}!</h2>
        <p>Thank you for joining Cyprus's leading job platform. Here's how to get started:</p>
        <ul style="line-height: 1.6;">
          <li><a href="${process.env.APP_URL}/jobs">Browse available jobs</a></li>
          <li><a href="${process.env.APP_URL}/job-alerts">Set up job alerts</a></li>
          <li><a href="${process.env.APP_URL}/dashboard/job-seeker">Complete your profile</a></li>
        </ul>
        <p>Good luck with your job search!</p>
      </div>
    `
  }),

  welcomeEmployer: (companyName: string) => ({
    subject: 'Welcome to Cyprus Jobs - Start Hiring Today!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Welcome to Cyprus Jobs, ${companyName}!</h2>
        <p>Thank you for choosing Cyprus Jobs to find your next great hire. Here's how to get started:</p>
        <ul style="line-height: 1.6;">
          <li><a href="${process.env.APP_URL}/jobs/post">Post your first job</a></li>
          <li><a href="${process.env.APP_URL}/dashboard/employer">Set up your company profile</a></li>
          <li><a href="${process.env.APP_URL}/pricing">View our pricing plans</a></li>
        </ul>
        <p>Start attracting top talent today!</p>
      </div>
    `
  })
};
