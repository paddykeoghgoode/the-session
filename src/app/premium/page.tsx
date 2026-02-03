import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createServerSupabaseClient, getUser } from '@/lib/supabase-server';

export const revalidate = 0;

async function getUserProfile(userId: string) {
  const supabase = await createServerSupabaseClient();

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  return data;
}

async function getReferralStats(userId: string) {
  const supabase = await createServerSupabaseClient();

  // Count completed referrals
  const { count: completedReferrals } = await supabase
    .from('referrals')
    .select('*', { count: 'exact', head: true })
    .eq('referrer_id', userId)
    .eq('status', 'completed');

  return {
    completedReferrals: completedReferrals || 0,
  };
}

export default async function PremiumPage() {
  const user = await getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const profile = await getUserProfile(user.id);
  const referralStats = await getReferralStats(user.id);

  const referralCode = profile?.referral_code || user.id.slice(0, 8);
  const referralUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/register?ref=${referralCode}`;

  const referralsNeeded = Math.max(0, 10 - referralStats.completedReferrals);
  const hasEarnedFree = referralStats.completedReferrals >= 10;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-cream-100 mb-2">
          Session Plus
        </h1>
        <p className="text-stout-400">
          Get the most out of Dublin&apos;s best pub app
        </p>
      </div>

      {/* Referral Progress */}
      {!hasEarnedFree && (
        <div className="bg-gradient-to-r from-irish-green-600 to-irish-green-700 rounded-lg p-6 mb-8 text-white">
          <h2 className="text-2xl font-bold mb-2">
            🎉 Get Premium for FREE!
          </h2>
          <p className="text-irish-green-100 mb-4">
            Refer 10 friends who sign up and you&apos;ll get Session Plus for free, forever!
          </p>

          <div className="bg-white/20 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Your Progress</span>
              <span className="text-xl font-bold">
                {referralStats.completedReferrals} / 10
              </span>
            </div>
            <div className="w-full bg-white/30 rounded-full h-3">
              <div
                className="bg-white rounded-full h-3 transition-all"
                style={{ width: `${(referralStats.completedReferrals / 10) * 100}%` }}
              />
            </div>
            <p className="text-sm text-irish-green-100 mt-2">
              {referralsNeeded === 0
                ? '🎊 You did it! Premium is now free for you!'
                : `${referralsNeeded} more ${referralsNeeded === 1 ? 'referral' : 'referrals'} to unlock free premium!`}
            </p>
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-sm mb-2 font-medium">Your Referral Link:</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={referralUrl}
                readOnly
                className="flex-1 bg-white/20 border border-white/30 rounded px-3 py-2 text-sm font-mono"
                onClick={(e) => e.currentTarget.select()}
              />
              <button
                onClick={() => navigator.clipboard.writeText(referralUrl)}
                className="bg-white text-irish-green-700 px-4 py-2 rounded font-medium hover:bg-irish-green-100 transition-colors"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      )}

      {hasEarnedFree && (
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg p-6 mb-8 text-white text-center">
          <div className="text-6xl mb-3">🏆</div>
          <h2 className="text-2xl font-bold mb-2">
            Congratulations!
          </h2>
          <p className="text-amber-100 mb-4">
            You&apos;ve unlocked Session Plus for FREE by referring 10 friends!
          </p>
          <p className="text-sm text-amber-200">
            Your premium features are now active. Keep referring to earn more points!
          </p>
        </div>
      )}

      {/* Pricing Card */}
      <div className="bg-stout-800 rounded-lg border-2 border-irish-green-600 p-8 mb-8">
        <div className="text-center mb-6">
          <p className="text-stout-400 text-sm mb-2">Session Plus</p>
          <div className="flex items-end justify-center gap-2 mb-4">
            <span className="text-5xl font-bold text-cream-100">€2.99</span>
            <span className="text-stout-400 mb-2">/month</span>
          </div>
          <p className="text-sm text-stout-400">
            or €24.99/year <span className="text-irish-green-500">(save 30%)</span>
          </p>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-start gap-3">
            <span className="text-irish-green-500 text-xl">✓</span>
            <div>
              <p className="text-cream-100 font-medium">Ad-free Experience</p>
              <p className="text-sm text-stout-400">No sponsored content or banners</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="text-irish-green-500 text-xl">✓</span>
            <div>
              <p className="text-cream-100 font-medium">Price Alerts</p>
              <p className="text-sm text-stout-400">Get notified when your favorite drinks drop below your target price</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="text-irish-green-500 text-xl">✓</span>
            <div>
              <p className="text-cream-100 font-medium">Advanced Filters</p>
              <p className="text-sm text-stout-400">Combine multiple amenities and vibes for perfect pub matching</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="text-irish-green-500 text-xl">✓</span>
            <div>
              <p className="text-cream-100 font-medium">Premium Guides</p>
              <p className="text-sm text-stout-400">Access to all curated guides (Best Guinness, Hidden Gems, etc.)</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="text-irish-green-500 text-xl">✓</span>
            <div>
              <p className="text-cream-100 font-medium">Early Access</p>
              <p className="text-sm text-stout-400">Be first to see new deals and events</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="text-irish-green-500 text-xl">✓</span>
            <div>
              <p className="text-cream-100 font-medium">Unlimited Pub Crawls</p>
              <p className="text-sm text-stout-400">Create and join unlimited collaborative pub crawls</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="text-irish-green-500 text-xl">✓</span>
            <div>
              <p className="text-cream-100 font-medium">Priority Support</p>
              <p className="text-sm text-stout-400">Get faster responses to your questions</p>
            </div>
          </div>
        </div>

        {!hasEarnedFree ? (
          <>
            <button className="w-full bg-irish-green-600 hover:bg-irish-green-700 text-white py-3 rounded-lg font-semibold mb-3 transition-colors">
              Subscribe Monthly - €2.99
            </button>
            <button className="w-full bg-stout-700 hover:bg-stout-600 text-cream-100 py-3 rounded-lg font-semibold transition-colors">
              Subscribe Yearly - €24.99 <span className="text-irish-green-500">(Save 30%)</span>
            </button>
          </>
        ) : (
          <div className="bg-irish-green-600 text-white py-3 rounded-lg font-semibold text-center">
            ✓ Premium Active (Free via Referrals!)
          </div>
        )}
      </div>

      {/* Referral Benefits */}
      <div className="bg-stout-800 rounded-lg border border-stout-700 p-6">
        <h3 className="text-lg font-bold text-cream-100 mb-4">
          💎 Referral Rewards
        </h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3 pb-3 border-b border-stout-700">
            <div className="w-12 h-12 rounded-full bg-irish-green-600 flex items-center justify-center text-white font-bold">
              50
            </div>
            <div className="flex-1">
              <p className="text-cream-100 font-medium">Per Referral</p>
              <p className="text-sm text-stout-400">Earn 50 points for each friend who signs up (counts toward leaderboard!)</p>
            </div>
          </div>

          <div className="flex items-start gap-3 pb-3 border-b border-stout-700">
            <div className="w-12 h-12 rounded-full bg-amber-600 flex items-center justify-center text-white font-bold">
              10
            </div>
            <div className="flex-1">
              <p className="text-cream-100 font-medium">Free Premium</p>
              <p className="text-sm text-stout-400">Get 10 signups = Session Plus FREE forever</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white text-xl">
              🏆
            </div>
            <div className="flex-1">
              <p className="text-cream-100 font-medium">Special Badge</p>
              <p className="text-sm text-stout-400">Unlock the &quot;Community Builder&quot; badge after 5 referrals</p>
            </div>
          </div>
        </div>
      </div>

      {/* Share Section */}
      <div className="mt-8 bg-stout-800 rounded-lg border border-stout-700 p-6">
        <h3 className="text-lg font-bold text-cream-100 mb-4">
          Share with Friends
        </h3>
        <div className="flex flex-wrap gap-3">
          <a
            href={`https://wa.me/?text=Check out The Session - find the best pint prices in Dublin! ${encodeURIComponent(referralUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            📱 WhatsApp
          </a>
          <a
            href={`https://twitter.com/intent/tweet?text=Finding the best pints in Dublin just got easier! Check out The Session: ${encodeURIComponent(referralUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            🐦 Twitter
          </a>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            📘 Facebook
          </a>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'The Session - Dublin Pub Prices',
                  text: 'Check out The Session - find the best pint prices in Dublin!',
                  url: referralUrl,
                });
              }
            }}
            className="bg-stout-700 hover:bg-stout-600 text-cream-100 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            📤 Share
          </button>
        </div>
      </div>
    </div>
  );
}
