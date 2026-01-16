'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

interface VerifyPriceButtonProps {
  priceId: string;
  currentPrice: number;
  verificationCount: number;
  confidenceLevel: 'low' | 'medium' | 'high';
  lastVerifiedAt?: string | null;
}

export default function VerifyPriceButton({
  priceId,
  currentPrice,
  verificationCount,
  confidenceLevel,
  lastVerifiedAt,
}: VerifyPriceButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newPrice, setNewPrice] = useState<string>('');
  const [hasVerified, setHasVerified] = useState(false);
  const supabase = createClient();

  const handleVerify = async (isAccurate: boolean) => {
    setIsSubmitting(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/auth/login');
      return;
    }

    const verificationData: {
      price_id: string;
      user_id: string;
      is_accurate: boolean;
      new_price?: number;
    } = {
      price_id: priceId,
      user_id: user.id,
      is_accurate: isAccurate,
    };

    if (!isAccurate && newPrice) {
      verificationData.new_price = parseFloat(newPrice);
    }

    const { error } = await supabase
      .from('price_verifications')
      .upsert(verificationData, {
        onConflict: 'price_id,user_id',
      });

    if (!error) {
      setHasVerified(true);
      setIsOpen(false);
      router.refresh();
    }

    setIsSubmitting(false);
  };

  const confidenceColors = {
    low: 'text-red-400 bg-red-500/10',
    medium: 'text-amber-400 bg-amber-500/10',
    high: 'text-irish-green-400 bg-irish-green-500/10',
  };

  const confidenceLabels = {
    low: 'Unverified',
    medium: 'Verified',
    high: 'Highly Verified',
  };

  if (hasVerified) {
    return (
      <div className="flex items-center gap-2 text-irish-green-400 text-sm">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        Thanks for verifying!
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Confidence Badge */}
      <div className="flex items-center gap-2">
        <span className={`text-xs px-2 py-0.5 rounded-full ${confidenceColors[confidenceLevel]}`}>
          {confidenceLabels[confidenceLevel]}
          {verificationCount > 0 && ` (${verificationCount})`}
        </span>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-xs text-stout-400 hover:text-cream-100 underline transition-colors"
        >
          Verify this price
        </button>
      </div>

      {/* Verification Modal */}
      {isOpen && (
        <div className="absolute z-10 mt-2 p-4 bg-stout-800 border border-stout-600 rounded-lg shadow-lg min-w-[280px]">
          <h4 className="text-sm font-medium text-cream-100 mb-3">
            Is this price still accurate?
          </h4>
          <p className="text-lg font-bold text-irish-green-500 mb-4">
            &euro;{currentPrice.toFixed(2)}
          </p>

          <div className="flex gap-2 mb-3">
            <button
              onClick={() => handleVerify(true)}
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-irish-green-600 hover:bg-irish-green-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Yes, correct
            </button>
            <button
              onClick={() => setNewPrice(currentPrice.toFixed(2))}
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-stout-700 hover:bg-stout-600 text-cream-100 text-sm rounded-lg transition-colors disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              No, wrong
            </button>
          </div>

          {newPrice && (
            <div className="space-y-2">
              <label className="block text-xs text-stout-400">
                What&apos;s the correct price?
              </label>
              <div className="flex items-center gap-2">
                <span className="text-stout-400">&euro;</span>
                <input
                  type="number"
                  step="0.10"
                  min="0"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="flex-1 px-3 py-2 bg-stout-700 border border-stout-600 rounded text-cream-100 focus:outline-none focus:border-irish-green-500"
                />
              </div>
              <button
                onClick={() => handleVerify(false)}
                disabled={isSubmitting || !newPrice}
                className="w-full px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Correction'}
              </button>
            </div>
          )}

          <button
            onClick={() => {
              setIsOpen(false);
              setNewPrice('');
            }}
            className="mt-3 text-xs text-stout-400 hover:text-cream-100"
          >
            Cancel
          </button>

          {lastVerifiedAt && (
            <p className="mt-2 text-xs text-stout-500">
              Last verified {new Date(lastVerifiedAt).toLocaleDateString('en-IE')}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
