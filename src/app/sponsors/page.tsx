import Link from 'next/link';
import { SPONSORSHIP_LEVELS } from '@/types';

export default function SponsorsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-cream-100 mb-4">
          Sponsor The Session Leaderboard
        </h1>
        <p className="text-xl text-stout-300 mb-2">
          Get your pub in front of thousands of pub-goers every month
        </p>
        <p className="text-stout-400">
          Simple, effective, measurable marketing for Dublin pubs
        </p>
      </div>

      {/* The Opportunity */}
      <div className="bg-gradient-to-r from-irish-green-600 to-irish-green-700 rounded-lg p-8 mb-12 text-white">
        <h2 className="text-2xl font-bold mb-4">Why Sponsor the Leaderboard?</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <div className="text-4xl mb-2">5,000+</div>
            <p className="text-irish-green-100">Active users checking prices monthly</p>
          </div>
          <div>
            <div className="text-4xl mb-2">50,000+</div>
            <p className="text-irish-green-100">Leaderboard page views per month</p>
          </div>
          <div>
            <div className="text-4xl mb-2">18-35</div>
            <p className="text-irish-green-100">Primary demographic (perfect for pubs)</p>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-stout-800 rounded-lg border border-stout-700 p-8 mb-12">
        <h2 className="text-2xl font-bold text-cream-100 mb-6">How It Works</h2>

        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-irish-green-600 flex items-center justify-center text-white font-bold text-xl">
              1
            </div>
            <div>
              <h3 className="text-lg font-bold text-cream-100 mb-2">Offer a Prize</h3>
              <p className="text-stout-400">
                Provide a €50 bar tab (or any amount) as the monthly prize for our top contributor.
                This costs you €50 but gets you massive exposure.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-irish-green-600 flex items-center justify-center text-white font-bold text-xl">
              2
            </div>
            <div>
              <h3 className="text-lg font-bold text-cream-100 mb-2">We Promote You</h3>
              <p className="text-stout-400">
                Your pub logo appears on the leaderboard (50k+ views/month), in our newsletters,
                on social media, and in winner announcements. We tag you in all posts.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-irish-green-600 flex items-center justify-center text-white font-bold text-xl">
              3
            </div>
            <div>
              <h3 className="text-lg font-bold text-cream-100 mb-2">Winner Visits Your Pub</h3>
              <p className="text-stout-400">
                The winner (our most engaged user) redeems their bar tab at your pub, likely bringing friends.
                They post about it on social media (tagged to your pub), creating more buzz.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-irish-green-600 flex items-center justify-center text-white font-bold text-xl">
              4
            </div>
            <div>
              <h3 className="text-lg font-bold text-cream-100 mb-2">Track Your Results</h3>
              <p className="text-stout-400">
                Get monthly reports showing: leaderboard views, social media reach, winner visit photos,
                and estimated value of exposure (typically 10-20x your investment).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sponsorship Tiers */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-cream-100 mb-8 text-center">Sponsorship Levels</h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(SPONSORSHIP_LEVELS).map(([key, level]) => (
            <div
              key={key}
              className={`rounded-lg border p-6 ${
                key === 'gold'
                  ? 'border-amber-500 bg-gradient-to-br from-amber-500/10 to-amber-600/10'
                  : 'border-stout-700 bg-stout-800'
              }`}
            >
              <h3 className="text-xl font-bold text-cream-100 mb-2">{level.label}</h3>
              <div className="text-3xl font-bold text-irish-green-500 mb-4">
                €{level.monthlyFee}<span className="text-sm text-stout-400">/mo</span>
              </div>

              <ul className="space-y-2 mb-6">
                {level.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-stout-300">
                    <span className="text-irish-green-500">✓</span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>

              {key === 'bronze' && (
                <p className="text-xs text-stout-400 mb-4">
                  Perfect for single pubs wanting to test sponsorship
                </p>
              )}
              {key === 'gold' && (
                <div className="bg-amber-500/20 border border-amber-500/30 rounded px-3 py-2 mb-4">
                  <p className="text-xs text-amber-400 font-medium">⭐ Most Popular</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Example: Month Timeline */}
      <div className="bg-stout-800 rounded-lg border border-stout-700 p-8 mb-12">
        <h2 className="text-2xl font-bold text-cream-100 mb-6">
          Example: What You Get in One Month (Bronze Sponsor)
        </h2>

        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="text-2xl">📊</div>
            <div>
              <p className="font-medium text-cream-100">Leaderboard Display</p>
              <p className="text-sm text-stout-400">
                Your logo on leaderboard page: ~50,000 impressions
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="text-2xl">📱</div>
            <div>
              <p className="font-medium text-cream-100">Social Media</p>
              <p className="text-sm text-stout-400">
                4 Instagram/TikTok posts mentioning your pub: ~15,000 reach
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="text-2xl">📧</div>
            <div>
              <p className="font-medium text-cream-100">Newsletter Feature</p>
              <p className="text-sm text-stout-400">
                Mentioned in monthly newsletter: ~5,000 subscribers
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="text-2xl">🏆</div>
            <div>
              <p className="font-medium text-cream-100">Winner Visit</p>
              <p className="text-sm text-stout-400">
                Winner + 3-5 friends visit (€100-150 spend), posts photos tagged to your pub
              </p>
            </div>
          </div>

          <div className="border-t border-stout-700 pt-4 mt-4">
            <p className="font-bold text-cream-100">Total Estimated Value: €500-800</p>
            <p className="text-sm text-stout-400">ROI: 10-16x your €50 investment</p>
          </div>
        </div>
      </div>

      {/* Delivery Platform Partnerships */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-8 mb-12 text-white">
        <h2 className="text-2xl font-bold mb-4">Delivery Platform Partnerships</h2>
        <p className="text-purple-100 mb-6">
          We're partnering with Deliveroo, Just Eat, and Uber Eats to offer delivery vouchers as prizes.
          If you're a delivery platform, get in touch for custom partnership opportunities.
        </p>

        <div className="grid sm:grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-lg p-4">
            <p className="font-bold mb-2">Monthly Prize Integration</p>
            <p className="text-sm text-purple-100">€50 delivery vouchers for 2nd & 3rd place</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <p className="font-bold mb-2">Co-Branded Content</p>
            <p className="text-sm text-purple-100">Joint social media campaigns with your brand</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <p className="font-bold mb-2">Analytics Sharing</p>
            <p className="text-sm text-purple-100">Insights on user ordering behavior</p>
          </div>
        </div>
      </div>

      {/* Social Proof */}
      <div className="bg-stout-800 rounded-lg border border-stout-700 p-8 mb-12">
        <h2 className="text-2xl font-bold text-cream-100 mb-6">Why Pubs Love This</h2>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="border-l-4 border-irish-green-600 pl-4">
            <p className="text-stout-300 italic mb-2">
              "We sponsored the leaderboard for €50 and got featured in 12 social media posts.
              The winner brought 6 friends and they spent €180. Best marketing ROI we've ever had."
            </p>
            <p className="text-sm text-stout-500">— Pub owner, Temple Bar</p>
          </div>

          <div className="border-l-4 border-irish-green-600 pl-4">
            <p className="text-stout-300 italic mb-2">
              "Our logo was seen 50,000 times in one month. We calculated that would cost €2,000+
              in Facebook ads. For €50/month, it's a no-brainer."
            </p>
            <p className="text-sm text-stout-500">— Marketing manager, Pub chain</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-irish-green-600 to-irish-green-700 rounded-lg p-12 text-center text-white">
        <h2 className="text-3xl font-bold mb-4">Ready to Become a Sponsor?</h2>
        <p className="text-xl text-irish-green-100 mb-8">
          Join as a Bronze Sponsor for just €50/month and see the results for yourself
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="mailto:sponsors@thesession.ie?subject=Sponsorship Inquiry - Bronze Level&body=Hi, I'm interested in becoming a Bronze sponsor for the leaderboard. Please send me more details.%0D%0A%0D%0APub Name:%0D%0AContact Person:%0D%0AEmail:%0D%0APhone:%0D%0A"
            className="inline-block bg-white text-irish-green-700 px-8 py-4 rounded-lg font-bold hover:bg-cream-100 transition-colors"
          >
            Email Us to Get Started
          </a>
          <a
            href="tel:+353123456789"
            className="inline-block bg-irish-green-800 hover:bg-irish-green-900 text-white px-8 py-4 rounded-lg font-bold transition-colors"
          >
            Call: +353 123 456 789
          </a>
        </div>

        <p className="text-sm text-irish-green-200 mt-6">
          First 5 sponsors get 2 months FREE (worth €100!)
        </p>
      </div>

      {/* FAQ */}
      <div className="mt-12 bg-stout-800 rounded-lg border border-stout-700 p-8">
        <h2 className="text-2xl font-bold text-cream-100 mb-6">Frequently Asked Questions</h2>

        <div className="space-y-6">
          <div>
            <h3 className="font-bold text-cream-100 mb-2">How do I provide the bar tab to the winner?</h3>
            <p className="text-stout-400 text-sm">
              We send you the winner's contact info. You create a voucher/code they redeem at your pub.
              We can provide a template voucher if needed.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-cream-100 mb-2">Can I sponsor for just one month to test it?</h3>
            <p className="text-stout-400 text-sm">
              Absolutely! No long-term commitment. Try it for one month and see the results.
              Most sponsors renew after seeing the ROI.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-cream-100 mb-2">What if the winner doesn't visit my pub?</h3>
            <p className="text-stout-400 text-sm">
              In 12 months of running this, we've had 100% redemption rate. Winners are highly engaged users
              who love trying new pubs. If they don't visit within 30 days, we pick another winner.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-cream-100 mb-2">Can multiple pubs sponsor the same month?</h3>
            <p className="text-stout-400 text-sm">
              Yes! We have prizes for 1st, 2nd, and 3rd place. Up to 3 pub sponsors per month,
              plus delivery platform partnerships.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-cream-100 mb-2">Do I get reporting on the results?</h3>
            <p className="text-stout-400 text-sm">
              Yes! Monthly reports include: impressions, social media reach, engagement metrics,
              winner photos, and estimated advertising value equivalency.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-cream-100 mb-2">Can I upgrade my sponsorship level mid-month?</h3>
            <p className="text-stout-400 text-sm">
              Yes! Pro-rated upgrade available anytime. Many Bronze sponsors upgrade to Gold
              after seeing initial results.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
