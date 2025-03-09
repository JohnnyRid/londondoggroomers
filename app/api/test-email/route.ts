import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, generateContactNotificationEmail } from '@/lib/emailUtils';

export async function GET(request: NextRequest) {
  try {
    // Log environment variables (with sensitive data masked)
    console.log('Email Environment Configuration:');
    console.log('EMAIL_SERVER_HOST:', process.env.EMAIL_SERVER_HOST);
    console.log('EMAIL_SERVER_PORT:', process.env.EMAIL_SERVER_PORT);
    console.log('EMAIL_SERVER_SECURE:', process.env.EMAIL_SERVER_SECURE);
    console.log('EMAIL_SERVER_USER:', process.env.EMAIL_SERVER_USER);
    console.log('EMAIL_SERVER_PASSWORD:', process.env.EMAIL_SERVER_PASSWORD ? '[PASSWORD SET]' : '[PASSWORD NOT SET]');
    console.log('EMAIL_FROM:', process.env.EMAIL_FROM);
    console.log('NOTIFICATION_EMAIL:', process.env.NOTIFICATION_EMAIL);
    
    // Create test data
    const testData = {
      name: 'Test User',
      email: 'test@example.com',
      message: 'This is a test message to verify that email notifications are working correctly.',
    };
    
    // Generate email content
    const { subject, html } = generateContactNotificationEmail(testData);
    
    // Get notification email from environment variables
    const notificationEmail = process.env.NOTIFICATION_EMAIL;
    
    if (!notificationEmail) {
      return NextResponse.json(
        { error: 'NOTIFICATION_EMAIL not configured in environment variables' },
        { status: 500 }
      );
    }
    
    // Send the test email
    console.log(`Attempting to send test email to ${notificationEmail}`);
    const sendResult = await sendEmail({
      to: notificationEmail,
      subject,
      html,
    });
    
    if (!sendResult.success) {
      console.error('Email test failed:', sendResult.error);
      let errorDetails = 'Unknown error';
      
      if (sendResult.error instanceof Error) {
        errorDetails = sendResult.error.message;
        
        // Handle Gmail-specific auth errors
        if (process.env.EMAIL_SERVER_HOST?.includes('gmail')) {
          if (errorDetails.includes('535')) {
            errorDetails = 'Authentication failed. If using Gmail, make sure you are using an App Password and not your regular password. You may need to set up 2-Step Verification and then create an App Password.';
          } else if (errorDetails.includes('534')) {
            errorDetails = 'Gmail security prevented the login. Please allow less secure apps in your Gmail settings or use an App Password.';
          }
        }
      }
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to send test email.',
          details: errorDetails
        },
        { status: 500 }
      );
    }
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully!',
      recipient: notificationEmail,
      messageId: sendResult.messageId
    });
    
  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}