import { db } from "@/lib/db";

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

interface SMSMessage {
  content: string;
}

interface NotificationData {
  userId: string;
  email: string;
  phone?: string;
  name: string;
  preferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
}

export class NotificationService {
  // Email Templates
  static getEmailTemplate(type: string, data: any): EmailTemplate {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    switch (type) {
      case 'JOB_ALERT':
        return {
          subject: `New Job Matches: ${data.alertTitle}`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <title>New Job Matches</title>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
                .job-card { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #2563eb; }
                .job-title { font-size: 18px; font-weight: bold; color: #1e40af; margin-bottom: 8px; }
                .company { color: #6b7280; font-size: 14px; margin-bottom: 10px; }
                .details { display: flex; gap: 15px; font-size: 14px; color: #4b5563; }
                .cta-button { background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 20px; }
                .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>New Job Matches</h1>
                  <p>Cyprus Jobs Platform</p>
                </div>
                <div class="content">
                  <p>Hi ${data.userName},</p>
                  <p>We found <strong>${data.jobs.length} new job${data.jobs.length > 1 ? 's' : ''}</strong> that match your alert "<strong>${data.alertTitle}</strong>":</p>
                  
                  ${data.jobs.map((job: any, index: number) => `
                    <div class="job-card">
                      <div class="job-title">${job.title}</div>
                      <div class="company">${job.employer.companyName}</div>
                      <div class="details">
                        <span>📍 ${job.location}</span>
                        <span>💼 ${job.type}</span>
                        <span>💰 ${job.salaryMin && job.salaryMax ? `€${job.salaryMin.toLocaleString()} - €${job.salaryMax.toLocaleString()}` : job.salaryMin ? `€${job.salaryMin.toLocaleString()}+` : 'Competitive'}</span>
                      </div>
                      <a href="${baseUrl}/jobs/${job.id}" class="cta-button" style="margin-top: 15px;">View Job</a>
                    </div>
                  `).join('')}
                  
                  <div style="text-align: center; margin-top: 30px;">
                    <a href="${baseUrl}/job-alerts" class="cta-button">Manage Your Alerts</a>
                  </div>
                  
                  <div class="footer">
                    <p>This email was sent to ${data.userEmail} because you subscribed to job alerts on Cyprus Jobs.</p>
                    <p>To unsubscribe, <a href="${baseUrl}/job-alerts">click here</a> to manage your preferences.</p>
                    <p>&copy; 2024 Cyprus Jobs. All rights reserved.</p>
                  </div>
                </div>
              </div>
            </body>
            </html>
          `,
          text: `
Hi ${data.userName},

We found ${data.jobs.length} new job${data.jobs.length > 1 ? 's' : ''} that match your alert "${data.alertTitle}":

${data.jobs.map((job: any, index: number) => `
${index + 1}. ${job.title} at ${job.employer.companyName}
   Location: ${job.location}
   Type: ${job.type}
   Salary: ${job.salaryMin && job.salaryMax ? `€${job.salaryMin.toLocaleString()} - €${job.salaryMax.toLocaleString()}` : job.salaryMin ? `€${job.salaryMin.toLocaleString()}+` : 'Competitive'}
   View: ${baseUrl}/jobs/${job.id}
`).join('\n')}

You can view all matching jobs and manage your alerts here: ${baseUrl}/job-alerts

To unsubscribe from these alerts, please visit your job alerts settings.

Best regards,
Cyprus Jobs Team
          `
        };

      case 'APPLICATION_UPDATE':
        return {
          subject: `Application Status Update: ${data.jobTitle}`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <title>Application Status Update</title>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #059669; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
                .status-badge { display: inline-block; padding: 6px 12px; border-radius: 20px; font-size: 14px; font-weight: bold; 
                  ${data.status === 'SHORTLISTED' ? 'background: #10b981; color: white;' : ''}
                  ${data.status === 'REJECTED' ? 'background: #ef4444; color: white;' : ''}
                  ${data.status === 'HIRED' ? 'background: #059669; color: white;' : ''}
                  ${data.status === 'PENDING' ? 'background: #f59e0b; color: white;' : ''}
                }
                .job-info { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #059669; }
                .cta-button { background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 20px; }
                .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Application Status Update</h1>
                  <p>Cyprus Jobs Platform</p>
                </div>
                <div class="content">
                  <p>Hi ${data.userName},</p>
                  <p>Good news! Your application status has been updated:</p>
                  
                  <div class="job-info">
                    <h3>${data.jobTitle}</h3>
                    <p><strong>Company:</strong> ${data.companyName}</p>
                    <p><strong>Status:</strong> <span class="status-badge">${data.status}</span></p>
                    ${data.message ? `<p><strong>Message:</strong> ${data.message}</p>` : ''}
                  </div>
                  
                  <div style="text-align: center;">
                    <a href="${baseUrl}/applications/${data.applicationId}" class="cta-button">View Application</a>
                  </div>
                  
                  <div class="footer">
                    <p>This email was sent to ${data.userEmail} regarding your job application on Cyprus Jobs.</p>
                    <p>&copy; 2024 Cyprus Jobs. All rights reserved.</p>
                  </div>
                </div>
              </div>
            </body>
            </html>
          `,
          text: `
Hi ${data.userName},

Good news! Your application status has been updated:

Job: ${data.jobTitle}
Company: ${data.companyName}
Status: ${data.status}
${data.message ? `Message: ${data.message}` : ''}

View your application here: ${baseUrl}/applications/${data.applicationId}

Best regards,
Cyprus Jobs Team
          `
        };

      case 'NEW_APPLICATION':
        return {
          subject: `New Application Received: ${data.jobTitle}`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <title>New Application Received</title>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #7c3aed; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
                .applicant-info { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #7c3aed; }
                .cta-button { background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 20px; }
                .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>New Application Received</h1>
                  <p>Cyprus Jobs Platform</p>
                </div>
                <div class="content">
                  <p>Hi ${data.userName},</p>
                  <p>You have received a new application for your job posting:</p>
                  
                  <div class="applicant-info">
                    <h3>${data.jobTitle}</h3>
                    <p><strong>Applicant:</strong> ${data.applicantName}</p>
                    <p><strong>Applied:</strong> ${new Date(data.appliedAt).toLocaleDateString()}</p>
                    ${data.applicantBio ? `<p><strong>Bio:</strong> ${data.applicantBio.substring(0, 150)}...</p>` : ''}
                  </div>
                  
                  <div style="text-align: center;">
                    <a href="${baseUrl}/dashboard/employer/applications" class="cta-button">Review Application</a>
                  </div>
                  
                  <div class="footer">
                    <p>This email was sent to ${data.userEmail} regarding your job posting on Cyprus Jobs.</p>
                    <p>&copy; 2024 Cyprus Jobs. All rights reserved.</p>
                  </div>
                </div>
              </div>
            </body>
            </html>
          `,
          text: `
Hi ${data.userName},

You have received a new application for your job posting:

Job: ${data.jobTitle}
Applicant: ${data.applicantName}
Applied: ${new Date(data.appliedAt).toLocaleDateString()}
${data.applicantBio ? `Bio: ${data.applicantBio.substring(0, 150)}...` : ''}

Review the application here: ${baseUrl}/dashboard/employer/applications

Best regards,
Cyprus Jobs Team
          `
        };

      default:
        return {
          subject: 'Notification from Cyprus Jobs',
          html: '<p>You have a new notification from Cyprus Jobs.</p>',
          text: 'You have a new notification from Cyprus Jobs.'
        };
    }
  }

  // SMS Templates
  static getSMSTemplate(type: string, data: any): SMSMessage {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    switch (type) {
      case 'JOB_ALERT':
        return {
          content: `Cyprus Jobs: ${data.jobs.length} new job${data.jobs.length > 1 ? 's' : ''} match "${data.alertTitle}". View: ${baseUrl}/job-alerts`
        };
      
      case 'APPLICATION_UPDATE':
        return {
          content: `Cyprus Jobs: Your application for ${data.jobTitle} is now ${data.status}. View: ${baseUrl}/applications/${data.applicationId}`
        };
      
      case 'NEW_APPLICATION':
        return {
          content: `Cyprus Jobs: New application for ${data.jobTitle} from ${data.applicantName}. Review: ${baseUrl}/dashboard/employer/applications`
        };
      
      default:
        return {
          content: 'You have a new notification from Cyprus Jobs.'
        };
    }
  }

  // Send Email Notification
  static async sendEmail(
    userEmail: string, 
    template: EmailTemplate
  ): Promise<boolean> {
    try {
      // In a real implementation, you would use an email service like:
      // - SendGrid
      // - AWS SES
      // - Nodemailer
      // - Mailgun
      
      // For now, we'll simulate the email sending
      console.log(`Email sent to ${userEmail}`);
      console.log(`Subject: ${template.subject}`);
      console.log(`Content: ${template.text}`);
      
      // Simulate email sending delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  // Send SMS Notification
  static async sendSMS(
    phoneNumber: string, 
    message: SMSMessage
  ): Promise<boolean> {
    try {
      // In a real implementation, you would use an SMS service like:
      // - Twilio
      // - AWS SNS
      // - Vonage
      // - Plivo
      
      // Validate phone number format
      if (!phoneNumber || !phoneNumber.match(/^\+?[\d\s\-\(\)]+$/)) {
        console.log(`Invalid phone number: ${phoneNumber}`);
        return false;
      }
      
      // For now, we'll simulate the SMS sending
      console.log(`SMS sent to ${phoneNumber}`);
      console.log(`Message: ${message.content}`);
      
      // Simulate SMS sending delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return true;
    } catch (error) {
      console.error('Error sending SMS:', error);
      return false;
    }
  }

  // Send Push Notification (for mobile apps)
  static async sendPushNotification(
    userId: string, 
    title: string, 
    message: string,
    data?: any
  ): Promise<boolean> {
    try {
      // In a real implementation, you would use a push notification service like:
      // - Firebase Cloud Messaging (FCM)
      // - Apple Push Notification Service (APNS)
      // - OneSignal
      // - Pusher Beams
      
      // For now, we'll simulate the push notification
      console.log(`Push notification sent to user ${userId}`);
      console.log(`Title: ${title}`);
      console.log(`Message: ${message}`);
      
      // Persist via audit log (no dedicated Notification model yet)
      await db.auditLog.create({
        data: {
          userId,
            action: 'PUSH_NOTIFICATION',
            entityType: 'NOTIFICATION',
            changes: JSON.stringify({ title, message, data }),
        },
      });
      
      return true;
    } catch (error) {
      console.error('Error sending push notification:', error);
      return false;
    }
  }

  // Send Multi-channel Notification
  static async sendNotification(
    notificationData: NotificationData,
    type: string,
    templateData: any
  ): Promise<{ email: boolean; sms: boolean; push: boolean }> {
    const results = { email: false, sms: false, push: false };
    
    try {
      // Send Email
      if (notificationData.preferences.email && notificationData.email) {
        const emailTemplate = this.getEmailTemplate(type, {
          ...templateData,
          userEmail: notificationData.email,
          userName: notificationData.name,
        });
        
        results.email = await this.sendEmail(notificationData.email, emailTemplate);
      }
      
      // Send SMS
      if (notificationData.preferences.sms && notificationData.phone) {
        const smsTemplate = this.getSMSTemplate(type, templateData);
        results.sms = await this.sendSMS(notificationData.phone, smsTemplate);
      }
      
      // Send Push Notification
      if (notificationData.preferences.push) {
        results.push = await this.sendPushNotification(
          notificationData.userId,
          templateData.title || 'New Notification',
          templateData.message || 'You have a new notification',
          templateData
        );
      }
      
      // Log the notification
      await db.auditLog.create({
        data: {
          userId: notificationData.userId,
          action: "NOTIFICATION_SENT",
          entityType: "NOTIFICATION",
          changes: JSON.stringify({
            type,
            channels: results,
            templateData,
          }),
          ipAddress: 'notification-service',
          userAgent: 'notification-service',
        },
      });
      
      return results;
    } catch (error) {
      console.error('Error sending notification:', error);
      return results;
    }
  }
}