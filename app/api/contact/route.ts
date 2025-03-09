import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendEmail, generateContactNotificationEmail } from '@/lib/emailUtils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, message } = body;
    
    // Basic validation
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }
    
    // Insert data into Supabase
    const { error: supabaseError } = await supabase.from('contact_messages').insert([
      {
        name,
        email,
        message,
        created_at: new Date().toISOString(),
      },
    ]);
    
    if (supabaseError) {
      console.error('Supabase error:', supabaseError);
      return NextResponse.json(
        { error: 'Failed to store contact message' },
        { status: 500 }
      );
    }
    
    // Send notification email
    const notificationEmail = process.env.NOTIFICATION_EMAIL;
    
    if (notificationEmail) {
      const { subject, html } = generateContactNotificationEmail({ name, email, message });
      
      const { success, error: emailError } = await sendEmail({
        to: notificationEmail,
        subject,
        html,
      });
      
      if (!success) {
        console.error('Email sending error:', emailError);
        // We don't want to fail the whole request if just the email fails
        // The form submission was still recorded in the database
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}