import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Check if email-related environment variables are set
  const envCheck = {
    EMAIL_SERVER_HOST: !!process.env.EMAIL_SERVER_HOST,
    EMAIL_SERVER_PORT: !!process.env.EMAIL_SERVER_PORT,
    EMAIL_SERVER_SECURE: !!process.env.EMAIL_SERVER_SECURE,
    EMAIL_SERVER_USER: !!process.env.EMAIL_SERVER_USER,
    EMAIL_SERVER_PASSWORD: !!process.env.EMAIL_SERVER_PASSWORD,
    EMAIL_FROM: !!process.env.EMAIL_FROM,
    NOTIFICATION_EMAIL: !!process.env.NOTIFICATION_EMAIL,
  };

  // Check if all required variables are set
  const allEnvVarsSet = Object.values(envCheck).every(Boolean);

  return NextResponse.json({
    environmentVariablesConfigured: allEnvVarsSet,
    details: envCheck,
    userValue: process.env.EMAIL_SERVER_USER ? process.env.EMAIL_SERVER_USER : 'Not set',
    notificationValue: process.env.NOTIFICATION_EMAIL ? process.env.NOTIFICATION_EMAIL : 'Not set',
  });
}