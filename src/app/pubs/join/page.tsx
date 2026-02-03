import Link from 'next/link';

export default function PubJoinPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-cream-100 mb-4">
          Get Your Pub on The Session
        </h1>
        <p className="text-xl text-stout-300 mb-2">
          Join Dublin&apos;s fastest-growing pub discovery platform
        </p>
        <p className="text-stout-400">
          Free to list • Easy to manage • Thousands of potential customers
        </p>
      </div>

      {/* Benefits Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="bg-stout-800 rounded-lg border border-stout-700 p-6 text-center">
          <div className="text-5xl mb-3">👀</div>
          <h3 className="text-xl font-bold text-cream-100 mb-2">Get Discovered</h3>
          <p className="text-stout-400 text-sm">
            Thousands of people search for pubs on The Session every week. Make sure they find yours!
          </p>
        </div>

        <div className="bg-stout-800 rounded-lg border border-stout-700 p-6 text-center">
          <div className="text-5xl mb-3">📊</div>
          <h3 className="text-xl font-bold text-cream-100 mb-2">Track Analytics</h3>
          <p className="text-stout-400 text-sm">
            See how many people view your pub, where they come from, and what they&apos;re searching for.
          </p>
        </div>

        <div className="bg-stout-800 rounded-lg border border-stout-700 p-6 text-center">
          <div className="text-5xl mb-3">🎉</div>
          <h3 className="text-xl font-bold text-cream-100 mb-2">Promote Deals</h3>
          <p className="text-stout-400 text-sm">
            Post happy hours, events, and special offers. Push notifications to nearby customers.
          </p>
        </div>
      </div>

      {/* Two Options */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Option 1: Self-Service */}
        <div className="bg-gradient-to-br from-irish-green-600 to-irish-green-700 rounded-lg p-8 text-white">
          <div className="text-4xl mb-4">⚡</div>
          <h2 className="text-2xl font-bold mb-3">Option 1: Do It Yourself</h2>
          <p className="text-irish-green-100 mb-6">
            Create an account, claim your pub, and add your prices directly. Takes 5 minutes!
          </p>

          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-2">
              <span className="text-xl">✓</span>
              <span>Immediate access to dashboard</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-xl">✓</span>
              <span>Control your own pricing</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-xl">✓</span>
              <span>Update anytime you want</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-xl">✓</span>
              <span>Post events and deals</span>
            </div>
          </div>

          <Link
            href="/auth/register?type=pub_owner"
            className="block bg-white text-irish-green-700 text-center px-6 py-3 rounded-lg font-bold hover:bg-cream-100 transition-colors"
          >
            Sign Up & Claim Your Pub
          </Link>
        </div>

        {/* Option 2: Email Prices */}
        <div className="bg-stout-800 rounded-lg border-2 border-stout-600 p-8">
          <div className="text-4xl mb-4">📧</div>
          <h2 className="text-2xl font-bold text-cream-100 mb-3">Option 2: Email Us Your Prices</h2>
          <p className="text-stout-300 mb-6">
            Send us your price list and we&apos;ll add it to the platform for you. No account needed!
          </p>

          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-2 text-stout-300">
              <span className="text-xl">✓</span>
              <span>No setup required</span>
            </div>
            <div className="flex items-start gap-2 text-stout-300">
              <span className="text-xl">✓</span>
              <span>We handle everything</span>
            </div>
            <div className="flex items-start gap-2 text-stout-300">
              <span className="text-xl">✓</span>
              <span>Quick & easy</span>
            </div>
            <div className="flex items-start gap-2 text-stout-300">
              <span className="text-xl">✓</span>
              <span>Free service</span>
            </div>
          </div>

          <a
            href="mailto:pubs@thesession.ie?subject=Price List for [Your Pub Name]&body=Hi, I'd like to add my pub to The Session. Here are our prices:%0D%0A%0D%0APub Name:%0D%0AAddress:%0D%0A%0D%0AGUINNESS: €%0D%0AHEINEKEN: €%0D%0ACOORS LIGHT: €%0D%0ABULMERS: €%0D%0A%0D%0APlease add any other drinks, deals, or events below:%0D%0A"
            className="block bg-irish-green-600 hover:bg-irish-green-700 text-white text-center px-6 py-3 rounded-lg font-bold transition-colors"
          >
            Email Your Prices
          </a>
        </div>
      </div>

      {/* Why Join Now */}
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg p-8 mb-12 text-white">
        <h2 className="text-2xl font-bold mb-4">🎁 Join Now & Get:</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🆓</span>
            <div>
              <p className="font-bold">3 Months FREE Pro</p>
              <p className="text-sm text-amber-100">Worth €147 - for early adopters</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">📍</span>
            <div>
              <p className="font-bold">Featured Placement</p>
              <p className="text-sm text-amber-100">Top of search results for 30 days</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">🎯</span>
            <div>
              <p className="font-bold">Priority Support</p>
              <p className="text-sm text-amber-100">Direct help getting set up</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">📱</span>
            <div>
              <p className="font-bold">Push to Locals</p>
              <p className="text-sm text-amber-100">Notify nearby users about your deals</p>
            </div>
          </div>
        </div>
        <p className="text-sm text-amber-100 mt-4">
          ⏰ Limited time offer - First 50 pubs only!
        </p>
      </div>

      {/* FAQs */}
      <div className="bg-stout-800 rounded-lg border border-stout-700 p-8 mb-12">
        <h2 className="text-2xl font-bold text-cream-100 mb-6">Common Questions</h2>
        <div className="space-y-6">
          <div>
            <h3 className="font-bold text-cream-100 mb-2">Is it really free?</h3>
            <p className="text-stout-400 text-sm">
              Yes! Listing your pub and adding prices is completely free. We offer optional Pro features (€49/month) for analytics and promotion, but the basic listing is always free.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-cream-100 mb-2">What if someone posts wrong prices?</h3>
            <p className="text-stout-400 text-sm">
              When you claim your pub, you can update prices yourself and mark incorrect submissions. You have full control over your listing.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-cream-100 mb-2">Can I remove my pub from the site?</h3>
            <p className="text-stout-400 text-sm">
              While we aim to provide comprehensive pub information, verified owners can mark their pub as temporarily closed or contact us to discuss removal.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-cream-100 mb-2">We&apos;re part of a pub group - can we manage multiple locations?</h3>
            <p className="text-stout-400 text-sm">
              Absolutely! One account can manage multiple pub locations. Contact us at <a href="mailto:pubs@thesession.ie" className="text-irish-green-500 hover:text-irish-green-400">pubs@thesession.ie</a> and we&apos;ll set up group management for you.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-cream-100 mb-2">How do I post deals and events?</h3>
            <p className="text-stout-400 text-sm">
              Once you claim your pub, you get access to a dashboard where you can create events (trad sessions, quiz nights, match days) and post deals (happy hours, specials). These appear in our &quot;Tonight&quot; feed and push notifications.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-cream-100 mb-2">What&apos;s included in the Pro plan?</h3>
            <p className="text-stout-400 text-sm">
              Pro (€49/month) includes: detailed analytics, featured placement in search results, push notifications to nearby customers, competitor pricing insights, and priority support. First 50 pubs get 3 months FREE.
            </p>
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="text-center bg-stout-800 rounded-lg border border-stout-700 p-8">
        <h2 className="text-2xl font-bold text-cream-100 mb-3">Questions?</h2>
        <p className="text-stout-400 mb-6">
          We&apos;re here to help. Email us or give us a call.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="mailto:pubs@thesession.ie"
            className="bg-irish-green-600 hover:bg-irish-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            📧 pubs@thesession.ie
          </a>
          <a
            href="tel:+353123456789"
            className="bg-stout-700 hover:bg-stout-600 text-cream-100 px-6 py-3 rounded-lg font-medium transition-colors"
          >
            📞 Call Us
          </a>
        </div>
      </div>

      {/* Social Proof */}
      <div className="mt-12 text-center">
        <p className="text-stout-400 mb-4">Trusted by Dublin&apos;s best pubs</p>
        <div className="flex flex-wrap justify-center gap-8 text-stout-500">
          <span>O&apos;Neills</span>
          <span>The Temple Bar</span>
          <span>Bruxelles</span>
          <span>The Stag&apos;s Head</span>
          <span>& 200+ more</span>
        </div>
      </div>
    </div>
  );
}
