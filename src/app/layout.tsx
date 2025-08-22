import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { SessionProviderComponent } from "@/components/providers/session-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: 'Cyprus Jobs - Find Your Dream Job in Cyprus',
    template: '%s | Cyprus Jobs'
  },
  description: 'The leading job platform in Cyprus. Connect with top employers and discover opportunities across the island. Find full-time, part-time, and remote jobs in Nicosia, Limassol, Larnaca, and more.',
  keywords: [
    'Cyprus jobs',
    'jobs in Cyprus',
    'Cyprus careers',
    'Nicosia jobs',
    'Limassol jobs',
    'Larnaca jobs',
    'Paphos jobs',
    'Famagusta jobs',
    'remote jobs Cyprus',
    'IT jobs Cyprus',
    'finance jobs Cyprus',
    'healthcare jobs Cyprus'
  ],
  authors: [{ name: 'Cyprus Jobs Platform' }],
  creator: 'Cyprus Jobs Platform',
  publisher: 'Cyprus Jobs Platform',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.APP_URL || 'https://cyprusjobs.com'),
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/en',
      'el-GR': '/el',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.APP_URL || 'https://cyprusjobs.com',
    siteName: 'Cyprus Jobs',
    title: 'Cyprus Jobs - Find Your Dream Job in Cyprus',
    description: 'The leading job platform in Cyprus. Connect with top employers and discover opportunities across the island.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Cyprus Jobs - Find Your Dream Job in Cyprus',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cyprus Jobs - Find Your Dream Job in Cyprus',
    description: 'The leading job platform in Cyprus. Connect with top employers and discover opportunities across the island.',
    images: ['/og-image.jpg'],
    creator: '@cyprusjobs',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    yandex: process.env.YANDEX_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <SessionProviderComponent>
          {children}
          <Toaster />
        </SessionProviderComponent>
      </body>
    </html>
  );
}
