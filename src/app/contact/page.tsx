import Link from 'next/link';

export const metadata = {
  title: 'Contact - The Session',
  description: 'Get in touch with The Session team. Report issues, suggest features, or say hello.',
};

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-title text-cream-100 mb-4">Get in Touch</h1>
        <p className="text-xl text-stout-400">
          We&apos;d love to hear from you
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Contact Info */}
        <div className="space-y-6">
          <section className="bg-stout-800 rounded-lg border border-stout-700 p-6">
            <h2 className="text-xl font-bold text-cream-100 mb-4">Report a Problem</h2>
            <p className="text-stout-300 mb-4">
              Found incorrect information about a pub? A price that&apos;s way off? Let us know
              and we&apos;ll sort it out.
            </p>
            <p className="text-stout-400 text-sm">
              The best way to report issues is to sign in and use the voting system on prices,
              or leave a review with updated information.
            </p>
          </section>

          <section className="bg-stout-800 rounded-lg border border-stout-700 p-6">
            <h2 className="text-xl font-bold text-cream-100 mb-4">Suggest a Pub</h2>
            <p className="text-stout-300 mb-4">
              Know a pub that&apos;s missing from our list? We&apos;re always looking to expand
              our coverage across Dublin and beyond.
            </p>
            <Link
              href="/auth/register"
              className="inline-block bg-irish-green-600 hover:bg-irish-green-700 text-white font-medium px-4 py-2 rounded-lg transition-colors text-sm"
            >
              Sign Up to Add Pubs
            </Link>
          </section>

          <section className="bg-stout-800 rounded-lg border border-stout-700 p-6">
            <h2 className="text-xl font-bold text-cream-100 mb-4">General Enquiries</h2>
            <p className="text-stout-300 mb-4">
              For partnerships, press enquiries, or just to say hello:
            </p>
            <a
              href="mailto:hello@thesession.ie"
              className="text-irish-green-500 hover:text-irish-green-400 font-medium"
            >
              hello@thesession.ie
            </a>
          </section>
        </div>

        {/* Feedback Section */}
        <div className="space-y-6">
          <section className="bg-stout-800 rounded-lg border border-stout-700 p-6">
            <h2 className="text-xl font-bold text-cream-100 mb-4">Feature Requests</h2>
            <p className="text-stout-300 mb-4">
              Got an idea that would make The Session even better? We&apos;re always looking
              for ways to improve.
            </p>
            <ul className="text-stout-400 text-sm space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-irish-green-500">•</span>
                <span>New drink types or categories</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-irish-green-500">•</span>
                <span>Better search and filtering</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-irish-green-500">•</span>
                <span>Mobile app ideas</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-irish-green-500">•</span>
                <span>Anything else you can think of!</span>
              </li>
            </ul>
          </section>

          <section className="bg-stout-800 rounded-lg border border-stout-700 p-6">
            <h2 className="text-xl font-bold text-cream-100 mb-4">For Pub Owners</h2>
            <p className="text-stout-300 mb-4">
              We don&apos;t accept payments for listings or reviews—The Session is for
              the community, by the community.
            </p>
            <p className="text-stout-400 text-sm">
              If your pub&apos;s information is incorrect (wrong address, phone number,
              amenities), please get in touch and we&apos;ll update it promptly.
            </p>
          </section>

          <section className="bg-stout-800 rounded-lg border border-stout-700 p-6">
            <h2 className="text-xl font-bold text-cream-100 mb-4">Follow Us</h2>
            <p className="text-stout-300 mb-4">
              Stay up to date with the latest deals and new pub additions:
            </p>
            <div className="flex gap-4">
              <span className="text-stout-500 text-sm">Coming soon: Twitter/X, Instagram</span>
            </div>
          </section>
        </div>
      </div>

      {/* Response Time Note */}
      <div className="mt-12 text-center">
        <p className="text-stout-500 text-sm">
          We typically respond within 2-3 business days. Thanks for your patience!
        </p>
      </div>
    </div>
  );
}
