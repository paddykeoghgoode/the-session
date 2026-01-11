import Image from 'next/image';
import Link from 'next/link';

export const metadata = {
  title: 'About - The Session',
  description: 'Learn about The Session, Dublin\'s community-driven platform for finding the best pint prices.',
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex justify-center mb-4">
          <Image
            src="/pint.svg"
            alt="The Session"
            width={64}
            height={64}
            className="w-16 h-16"
          />
        </div>
        <h1 className="text-4xl font-title text-cream-100 mb-4">About The Session</h1>
        <p className="text-xl text-stout-400">
          Your guide to finding the best pint in Dublin
        </p>
      </div>

      {/* Story Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-cream-100 mb-4">Our Story</h2>
        <div className="bg-stout-800 rounded-lg border border-stout-700 p-6 space-y-4 text-stout-300">
          <p>
            Anyone who&apos;s spent an evening in Dublin knows the struggle: you&apos;re looking
            for a quality pint at a fair price, but with hundreds of pubs to choose from,
            how do you know where to go?
          </p>
          <p>
            The Session was born from late nights wandering Baggot Street, Temple Bar, and
            every corner of the city in search of the perfect Guinness. We realised that
            the best pub recommendations come from locals who know their neighbourhood&apos;s
            hidden gems—not tourist guides or outdated reviews.
          </p>
          <p>
            So we built a platform where Dubliners can share their knowledge. Whether
            you&apos;re after a €5 pint in a cosy snug or the best-poured stout in the
            city, The Session has you covered.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-cream-100 mb-4">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-stout-800 rounded-lg border border-stout-700 p-6 text-center">
            <div className="text-3xl mb-3">🍺</div>
            <h3 className="text-lg font-semibold text-cream-100 mb-2">Find a Pub</h3>
            <p className="text-sm text-stout-400">
              Search by name, area, or filter by amenities like live music, food, or outdoor seating.
            </p>
          </div>
          <div className="bg-stout-800 rounded-lg border border-stout-700 p-6 text-center">
            <div className="text-3xl mb-3">💶</div>
            <h3 className="text-lg font-semibold text-cream-100 mb-2">Check Prices</h3>
            <p className="text-sm text-stout-400">
              See the latest pint prices submitted by locals. No more surprises at the bar.
            </p>
          </div>
          <div className="bg-stout-800 rounded-lg border border-stout-700 p-6 text-center">
            <div className="text-3xl mb-3">⭐</div>
            <h3 className="text-lg font-semibold text-cream-100 mb-2">Share Your Experience</h3>
            <p className="text-sm text-stout-400">
              Submit prices and reviews to help fellow pub-goers find their next local.
            </p>
          </div>
        </div>
      </section>

      {/* Community Powered */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-cream-100 mb-4">Community Powered</h2>
        <div className="bg-stout-800 rounded-lg border border-stout-700 p-6 space-y-4 text-stout-300">
          <p>
            The Session is built on the generosity of the Dublin pub community. Every price
            submission, every review, and every vote helps keep the information accurate
            and useful.
          </p>
          <p>
            We don&apos;t accept payments from pubs and never will. Our loyalty is to the
            people looking for a good pint, not the establishments serving them. This means
            you can trust that the information here is genuine and unbiased.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center">
        <h2 className="text-2xl font-bold text-cream-100 mb-4">Ready to Find Your Next Pint?</h2>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/pubs"
            className="bg-irish-green-600 hover:bg-irish-green-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
          >
            Browse Pubs
          </Link>
          <Link
            href="/auth/register"
            className="bg-stout-700 hover:bg-stout-600 text-cream-100 font-medium px-6 py-3 rounded-lg transition-colors"
          >
            Join the Community
          </Link>
        </div>
      </section>
    </div>
  );
}
