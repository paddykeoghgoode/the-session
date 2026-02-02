'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';

interface AdvertisingBannerProps {
  placement?: 'deals_page' | 'homepage' | 'search_results' | 'leaderboard';
}

export default function AdvertisingBanner({ placement = 'deals_page' }: AdvertisingBannerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [businessName, setBusinessName] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [adType, setAdType] = useState<string>('featured_deal');
  const [message, setMessage] = useState('');

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: insertError } = await supabase
        .from('ad_inquiries')
        .insert({
          business_name: businessName.trim(),
          contact_name: contactName.trim(),
          contact_email: contactEmail.trim(),
          contact_phone: contactPhone.trim() || null,
          ad_type: adType,
          message: message.trim() || null,
          status: 'new',
        });

      if (insertError) throw insertError;

      setSuccess(true);
      // Reset form
      setBusinessName('');
      setContactName('');
      setContactEmail('');
      setContactPhone('');
      setMessage('');
    } catch (err) {
      console.error('Failed to submit inquiry:', err);
      setError('Failed to submit inquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Banner */}
      <div className="bg-gradient-to-r from-amber-900/50 to-amber-800/30 border border-amber-700/50 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="text-3xl">📣</div>
            <div>
              <h3 className="font-semibold text-amber-400">Want to Advertise Here?</h3>
              <p className="text-sm text-amber-400/70">
                Get your deals & promos featured to thousands of pub-goers
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-amber-600 hover:bg-amber-700 text-white font-medium px-6 py-2 rounded-lg transition-colors whitespace-nowrap"
          >
            Contact Us
          </button>
        </div>
      </div>

      {/* Inquiry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-stout-800 rounded-lg border border-stout-700 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-stout-700">
              <h2 className="text-lg font-semibold text-cream-100">Advertising Inquiry</h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSuccess(false);
                }}
                className="text-stout-400 hover:text-cream-100"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {success ? (
              <div className="p-8 text-center">
                <div className="text-4xl mb-4">🎉</div>
                <h3 className="text-lg font-semibold text-cream-100 mb-2">Thanks for your interest!</h3>
                <p className="text-stout-400 mb-4">
                  We'll be in touch within 24-48 hours to discuss your advertising needs.
                </p>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setSuccess(false);
                  }}
                  className="bg-irish-green-600 hover:bg-irish-green-700 text-white font-medium px-6 py-2 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-4 space-y-4">
                <div className="bg-stout-700/50 rounded-lg p-3 text-sm text-stout-300">
                  <p className="font-medium text-cream-100 mb-2">Why advertise with us?</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Reach 10,000+ pub-goers in Dublin</li>
                    <li>• Featured placement on deals page</li>
                    <li>• Weekly email digest inclusion</li>
                    <li>• Social media promotion</li>
                  </ul>
                </div>

                <div>
                  <label className="block text-sm text-stout-300 mb-1">Business/Pub Name *</label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    required
                    placeholder="Your Pub Name"
                    className="w-full bg-stout-700 border border-stout-600 rounded-lg px-3 py-2 text-cream-100 placeholder-stout-500 focus:border-irish-green-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-stout-300 mb-1">Contact Name *</label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      required
                      placeholder="Your name"
                      className="w-full bg-stout-700 border border-stout-600 rounded-lg px-3 py-2 text-cream-100 placeholder-stout-500 focus:border-irish-green-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-stout-300 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="08X XXX XXXX"
                      className="w-full bg-stout-700 border border-stout-600 rounded-lg px-3 py-2 text-cream-100 placeholder-stout-500 focus:border-irish-green-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-stout-300 mb-1">Email *</label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    required
                    placeholder="you@yourpub.ie"
                    className="w-full bg-stout-700 border border-stout-600 rounded-lg px-3 py-2 text-cream-100 placeholder-stout-500 focus:border-irish-green-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-stout-300 mb-1">What are you interested in? *</label>
                  <select
                    value={adType}
                    onChange={(e) => setAdType(e.target.value)}
                    className="w-full bg-stout-700 border border-stout-600 rounded-lg px-3 py-2 text-cream-100 focus:border-irish-green-500 focus:outline-none"
                  >
                    <option value="featured_deal">Featured Deal (on Deals page)</option>
                    <option value="sponsored_listing">Sponsored Listing (search results)</option>
                    <option value="banner_ad">Banner Advertisement</option>
                    <option value="pub_promotion">Full Pub Promotion Package</option>
                    <option value="event_promotion">Event Promotion</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-stout-300 mb-1">Tell us more (optional)</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="What would you like to promote? Any specific dates or requirements?"
                    rows={3}
                    className="w-full bg-stout-700 border border-stout-600 rounded-lg px-3 py-2 text-cream-100 placeholder-stout-500 focus:border-irish-green-500 focus:outline-none resize-none"
                  />
                </div>

                {error && <p className="text-sm text-red-400">{error}</p>}

                <button
                  type="submit"
                  disabled={loading || !businessName.trim() || !contactName.trim() || !contactEmail.trim()}
                  className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-stout-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  {loading ? 'Sending...' : 'Send Inquiry'}
                </button>

                <p className="text-xs text-stout-500 text-center">
                  We'll respond within 24-48 business hours
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// Smaller CTA for inline use
export function AdvertiseCTA() {
  return (
    <a
      href="#advertise"
      onClick={(e) => {
        e.preventDefault();
        // Could trigger modal or scroll to section
      }}
      className="inline-flex items-center gap-2 text-sm text-amber-500 hover:text-amber-400"
    >
      <span>📣</span>
      <span>Promote your pub here</span>
    </a>
  );
}
