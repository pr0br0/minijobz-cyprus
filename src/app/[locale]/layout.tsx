import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { Toaster } from "@/components/ui/toaster";
import { SessionProviderComponent } from "@/components/providers/session-provider";
import CookieConsent from "@/components/ui/CookieConsent";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cyprus Jobs - Find Your Dream Job in Cyprus",
  description: "GDPR-compliant job board connecting job seekers with employers in Cyprus. Free for job seekers, affordable for employers.",
  keywords: ["Cyprus jobs", "job board", "employment", "careers", "GDPR compliant", "Nicosia jobs", "Limassol jobs", "Larnaca jobs"],
  authors: [{ name: "Cyprus Jobs Team" }],
  openGraph: {
    title: "Cyprus Jobs - Find Your Dream Job in Cyprus",
    description: "GDPR-compliant job board connecting job seekers with employers in Cyprus",
    url: "https://cyprusjobs.com",
    siteName: "Cyprus Jobs",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cyprus Jobs - Find Your Dream Job in Cyprus",
    description: "GDPR-compliant job board connecting job seekers with employers in Cyprus",
  },
};

const locales = ['en', 'el'];

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  // Validate that the incoming `locale` parameter is valid
  const { locale } = await params;
  if (!locales.includes(locale as any)) notFound();

  // Providing all messages to the client
  const messages = await getMessages();

  const handleCookieAccept = (preferences: any) => {
    // Handle cookie acceptance - you can integrate with your analytics here
    console.log('Cookie preferences accepted:', preferences);
  };

  const handleCookieDecline = () => {
    // Handle cookie decline
    console.log('Cookie preferences declined');
  };

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <NextIntlClientProvider messages={messages}>
          <SessionProviderComponent>
            {children}
            <CookieConsent 
              onAccept={handleCookieAccept}
              onDecline={handleCookieDecline}
            />
            <Toaster />
          </SessionProviderComponent>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}