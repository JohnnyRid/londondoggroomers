import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";
import ClientLayout from "./ClientLayout";
import { Analytics } from '@vercel/analytics/react';

const interFont = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "London Dog Groomers | Professional Dog Grooming Services",
    template: "%s | London Dog Groomers"
  },
  description: "Find the best professional dog grooming services across London. Trusted local groomers, specialized services for all breeds, and convenient booking options.",
  keywords: ["dog grooming London", "professional dog groomers", "pet grooming services", "London pet care", "dog spa", "dog haircut", "mobile dog grooming"],
  authors: [{ name: "London Dog Groomers" }],
  creator: "London Dog Groomers",
  publisher: "London Dog Groomers",
  formatDetection: {
    email: false,
    telephone: false,
  },
  metadataBase: new URL('https://london-dog-groomers.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "London Dog Groomers | Professional Dog Grooming Services",
    description: "Find the best professional dog grooming services across London. Trusted local groomers for all dog breeds.",
    url: 'https://london-dog-groomers.vercel.app',
    siteName: 'London Dog Groomers',
    locale: 'en_GB',
    type: 'website',
    images: [
      {
        url: '/images/dog-grooming.jpg',
        width: 1200,
        height: 630,
        alt: 'London Dog Groomers - Professional Dog Grooming Services',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "London Dog Groomers | Professional Dog Grooming Services",
    description: "Find the best professional dog grooming services across London",
    images: ['/images/dog-grooming.jpg'],
  },
  icons: {
    icon: '/Site Icon Black Dog.svg',
    shortcut: '/Site Icon Black Dog.svg',
    apple: '/Site Icon Black Dog.svg',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  category: 'pet services',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/Site Icon Black Dog.svg" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Structured data for local business */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "London Dog Groomers",
              "url": "https://london-dog-groomers.vercel.app",
              "logo": "https://london-dog-groomers.vercel.app/images/Black-London-Logo.svg",
              "description": "Find the best professional dog grooming services across London. Trusted local groomers for all dog breeds.",
              "address": {
                "@type": "PostalAddress",
                "addressRegion": "London",
                "addressCountry": "UK"
              },
              "sameAs": [
                "https://www.facebook.com/londondoggroomers",
                "https://www.instagram.com/londondoggroomers"
              ]
            })
          }}
        />
      </head>
      <body
        className={`${interFont.variable} ${robotoMono.variable} antialiased flex flex-col min-h-screen`}
        suppressHydrationWarning={true}
      >
        <ClientLayout>
          {children}
        </ClientLayout>
        <Analytics />
      </body>
    </html>
  );
}
