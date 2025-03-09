import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { generateContactNotificationEmail } from '@/lib/emailUtils';

export async function GET(request: NextRequest) {
  try {
    console.log('Creating Ethereal test account...');
    
    // Create a test account at Ethereal
    const testAccount = await nodemailer.createTestAccount();
    console.log('Test account created:', testAccount.user);
    
    // Create reusable transporter using the test account
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    // Test data for email
    const testData = {
      name: 'Test User',
      email: 'test@example.com',
      message: 'This is a test message sent via Ethereal Email.',
    };

    // Generate email content
    const { subject, html } = generateContactNotificationEmail(testData);
    
    // Get the notification email from environment or use a fallback for testing
    const notificationEmail = process.env.NOTIFICATION_EMAIL || 'test@example.com';

    // Send mail with defined transport object
    const info = await transporter.sendMail({
      from: '"London Dog Groomers" <test@londondoggroomers.com>',
      to: notificationEmail,
      subject: subject,
      html: html,
    });

    console.log('Message sent with ID:', info.messageId);
    
    // Get the URL to preview the email (Ethereal feature)
    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log('Preview URL:', previewUrl);

    return NextResponse.json({
      success: true,
      message: 'Test email sent via Ethereal!',
      messageId: info.messageId,
      previewUrl: previewUrl,
      recipient: notificationEmail,
      note: 'This is a test using Ethereal Email. The email is not actually delivered but can be viewed at the preview URL.'
    });
  } catch (error) {
    console.error('Ethereal test error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to send test email via Ethereal', 
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}