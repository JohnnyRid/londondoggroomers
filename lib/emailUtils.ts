import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';

interface EmailData {
  to: string;
  subject: string;
  html: string;
}

// Configure SendGrid if API key is available
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export async function sendEmail({ to, subject, html }: EmailData) {
  console.log('Attempting to send email to:', to);
  
  // Check if SendGrid API key is configured
  if (process.env.SENDGRID_API_KEY) {
    try {
      console.log('Using SendGrid for email delivery');
      
      const msg = {
        to,
        from: process.env.EMAIL_FROM || 'no-reply@londondoggroomers.com',
        subject,
        html,
        replyTo: process.env.NOTIFICATION_EMAIL,
      };
      
      await sgMail.send(msg);
      console.log('Email sent successfully via SendGrid');
      return { success: true };
    } catch (error) {
      console.error('SendGrid email error:', error);
      
      // If SendGrid fails, try nodemailer as fallback
      console.log('Falling back to nodemailer...');
      return sendWithNodemailer({ to, subject, html });
    }
  } else {
    // No SendGrid API key, use nodemailer
    return sendWithNodemailer({ to, subject, html });
  }
}

// Function to send email using nodemailer (Gmail or other SMTP)
async function sendWithNodemailer({ to, subject, html }: EmailData) {
  try {
    console.log('Using email server:', process.env.EMAIL_SERVER_HOST);
    
    // For Gmail, it's best to use the service option rather than host/port
    const isGmail = process.env.EMAIL_SERVER_HOST?.includes('gmail');
    
    // Create a transporter with your email service credentials
    const transporterConfig = isGmail 
      ? {
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_SERVER_USER,
            pass: process.env.EMAIL_SERVER_PASSWORD,
          },
          debug: true, // Enable debug logs
          logger: true, // Log to console
        }
      : {
          host: process.env.EMAIL_SERVER_HOST,
          port: Number(process.env.EMAIL_SERVER_PORT),
          secure: process.env.EMAIL_SERVER_SECURE === 'true',
          auth: {
            user: process.env.EMAIL_SERVER_USER,
            pass: process.env.EMAIL_SERVER_PASSWORD,
          },
        };
    
    console.log('Transporter config (redacted password):', {
      ...transporterConfig,
      auth: {
        user: transporterConfig.auth.user,
        pass: '********' // Mask password in logs
      }
    });

    const transporter = nodemailer.createTransport(transporterConfig);

    // Verify connection configuration
    try {
      console.log('Verifying email configuration...');
      await transporter.verify();
      console.log('Email configuration verified successfully!');
    } catch (verifyError) {
      console.error('Email configuration verification failed:', verifyError);
      return { success: false, error: verifyError };
    }

    // Send the email
    console.log('Sending email...');
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_SERVER_USER,
      to,
      subject,
      html,
      replyTo: process.env.NOTIFICATION_EMAIL // Allow direct replies to go to the notification email
    });

    console.log("Email sent successfully:", info.messageId);
    console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}

export function generateContactNotificationEmail(contactData: {
  name: string;
  email: string;
  message: string;
}) {
  const { name, email, message } = contactData;
  
  const subject = `New Contact Form Submission - London Dog Groomers`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
      <h2 style="color: #333;">New Contact Form Submission</h2>
      <p>You have received a new message from the London Dog Groomers contact form.</p>
      
      <div style="margin: 20px 0; padding: 15px; border-left: 4px solid #0070f3; background-color: #f5f5f5;">
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
        <p><strong>Message:</strong></p>
        <p style="white-space: pre-wrap;">${message}</p>
      </div>
      
      <p>You can reply directly to this email to respond to the sender.</p>
      <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
      <p style="color: #666; font-size: 12px;">This is an automated message from your London Dog Groomers website.</p>
    </div>
  `;
  
  return { subject, html };
}