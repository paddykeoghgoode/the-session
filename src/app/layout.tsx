import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'The Session - Find the Best Pint Prices in Dublin',
  description: 'Crowdsourced pint prices, pub reviews, and deals across Dublin. Find the cheapest Guinness, Heineken, and ciders near you.',
  keywords: ['Dublin pubs', 'pint prices', 'Guinness', 'pub reviews', 'Dublin nightlife', 'cheap pints'],
  openGraph: {
    title: 'The Session - Find the Best Pint Prices in Dublin',
    description: 'Crowdsourced pint prices, pub reviews, and deals across Dublin.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-stout-950 text-cream-100`}>
        <GoogleAnalytics measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || ''} />
        {/* Skip to main content link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-irish-green-600 focus:text-white focus:rounded-lg focus:outline-none"
        >
          Skip to main content
        </a>
        <Navbar />
        <main id="main-content" className="min-h-screen" role="main">
          {children}
        </main>
        <footer className="bg-stout-900 border-t border-stout-700 py-8 mt-12" role="contentinfo">
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
      </body>
    </html>
  );
}
