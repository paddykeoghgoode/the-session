import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
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
        <Navbar />
        <main className="min-h-screen">
          {children}
        </main>
        <footer className="bg-stout-900 border-t border-stout-700 py-8 mt-12">
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
