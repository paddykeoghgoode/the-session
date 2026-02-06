import type { Metadata } from 'next';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import { ToastProvider } from '@/components/Toast';
import QuickActionsFAB from '@/components/QuickActionsFAB';
import MobileBottomNav from '@/components/MobileBottomNav';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://thesession.ie'),
  title: 'The Session - Find the Best Pint Prices in Dublin',
  description: 'Crowdsourced pint prices, pub reviews, and deals across Dublin. Find the cheapest Guinness, Heineken, and ciders near you.',
  keywords: ['Dublin pubs', 'pint prices', 'Guinness', 'pub reviews', 'Dublin nightlife', 'cheap pints'],
  manifest: '/manifest.json',
  openGraph: {
    title: 'The Session - Find the Best Pint Prices in Dublin',
    description: 'Crowdsourced pint prices, pub reviews, and deals across Dublin.',
    type: 'website',
    siteName: 'The Session',
    locale: 'en_IE',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Session - Find the Best Pint Prices in Dublin',
    description: 'Crowdsourced pint prices, pub reviews, and deals across Dublin.',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'The Session',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#169b62" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="font-sans bg-stout-950 text-cream-100 overscroll-none">
        <ToastProvider>
          <GoogleAnalytics measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || ''} />
          {/* Skip to main content link for accessibility */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-irish-green-600 focus:text-white focus:rounded-lg focus:outline-none"
          >
            Skip to main content
          </a>
          <Navbar />
          <main id="main-content" className="min-h-screen pb-16 md:pb-0" role="main">
            {children}
          </main>
          <footer className="bg-stout-900 border-t border-stout-700 py-8 mt-12 mb-16 md:mb-0" role="contentinfo">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-center md:text-left flex items-center gap-3">
                <Image
                  src="/pint.svg"
                  alt="The Session"
                  width={28}
                  height={28}
                  className="w-7 h-7"
                />
                <div>
                  <p className="text-cream-100 font-title text-lg">The Session</p>
                  <p className="text-sm text-stout-400">Find the best pint prices in Dublin</p>
                </div>
              </div>
              <div className="flex gap-6 text-sm text-stout-400">
                <a href="/pubs/join" className="hover:text-cream-100 transition-colors font-medium text-irish-green-500">List Your Pub</a>
                <a href="/about" className="hover:text-cream-100 transition-colors">About</a>
                <a href="/contact" className="hover:text-cream-100 transition-colors">Contact</a>
                <a href="/privacy" className="hover:text-cream-100 transition-colors">Privacy</a>
              </div>
              <p className="text-sm text-stout-500">
                Prices are crowdsourced and may not be accurate. Drink responsibly.
              </p>
            </div>
          </div>
        </footer>

          {/* Quick Actions FAB */}
          <QuickActionsFAB />

          {/* Mobile Bottom Navigation */}
          <MobileBottomNav />
        </ToastProvider>
      </body>
    </html>
  );
}
