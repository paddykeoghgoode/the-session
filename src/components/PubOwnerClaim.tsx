'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import type { PubOwnershipClaim, PubOwner } from '@/types';

interface PubOwnerClaimProps {
  pubId: string;
  pubName: string;
  pubEmail?: string | null;
  userId?: string;
}

export default function PubOwnerClaim({ pubId, pubName, pubEmail, userId }: PubOwnerClaimProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [existingClaim, setExistingClaim] = useState<PubOwnershipClaim | null>(null);
  const [existingOwner, setExistingOwner] = useState<PubOwner | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [businessEmail, setBusinessEmail] = useState(pubEmail || '');
  const [businessName, setBusinessName] = useState('');
  const [role, setRole] = useState<'owner' | 'manager' | 'staff'>('owner');
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState<'form' | 'verify'>('form');

  const supabase = createClient();

  // Check for existing claims/ownership
  useEffect(() => {
    if (!userId || !isOpen) return;

    async function checkExisting() {
      // Check if user already has a claim
      const { data: claim } = await supabase
        .from('pub_ownership_claims')
        .select('*')
        .eq('pub_id', pubId)
        .eq('user_id', userId)
        .single();

      if (claim) {
        setExistingClaim(claim);
        if (claim.status === 'email_sent') {
          setStep('verify');
        }
      }

      // Check if pub already has an owner
      const { data: owner } = await supabase
        .from('pub_owners')
        .select('*')
        .eq('pub_id', pubId)
        .eq('is_active', true)
        .single();

      if (owner) {
        setExistingOwner(owner);
      }
    }

    checkExisting();
  }, [pubId, userId, isOpen, supabase]);

  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      // Generate verification code
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();

      const { data, error: insertError } = await supabase
        .from('pub_ownership_claims')
        .upsert({
          pub_id: pubId,
          user_id: userId,
          business_email: businessEmail,
          business_name: businessName || null,
          role,
          verification_code: code,
          verification_sent_at: new Date().toISOString(),
          status: 'email_sent',
        })
        .select()
        .single();

      if (insertError) throw insertError;

      setExistingClaim(data);
      setStep('verify');

      // In production, you'd send an email here via an API route
      // For now, show the code (in production, this would be sent to the email)
      setSuccess(`Verification code sent to ${businessEmail}. Code: ${code}`);
    } catch (err) {
      console.error('Failed to submit claim:', err);
      setError('Failed to submit claim. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!existingClaim) return;

    setLoading(true);
    setError(null);

    try {
      if (verificationCode.toUpperCase() !== existingClaim.verification_code) {
        setError('Invalid verification code. Please check and try again.');
        setLoading(false);
        return;
      }

      // Update claim status
      const { error: updateError } = await supabase
        .from('pub_ownership_claims')
        .update({
          status: 'verified',
          verified_at: new Date().toISOString(),
        })
        .eq('id', existingClaim.id);

      if (updateError) throw updateError;

      setSuccess('Email verified! Your claim is now pending admin approval. We\'ll notify you once approved.');
      setExistingClaim({ ...existingClaim, status: 'verified' });
    } catch (err) {
      console.error('Verification failed:', err);
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!userId) {
    return (
      <div className="bg-stout-800 rounded-lg border border-stout-700 p-4">
        <p className="text-sm text-stout-400 text-center">
          <a href="/auth/login" className="text-irish-green-500 hover:underline">Sign in</a> to claim this pub
        </p>
      </div>
    );
  }

  // If already owned by this user
  if (existingOwner && existingOwner.user_id === userId) {
    return (
      <div className="bg-green-900/30 border border-green-700 rounded-lg p-4">
        <div className="flex items-center gap-2 text-green-400">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">You manage this pub</span>
        </div>
        <p className="text-sm text-green-400/80 mt-1">
          Role: {existingOwner.role.charAt(0).toUpperCase() + existingOwner.role.slice(1)}
        </p>
      </div>
    );
  }

  // If owned by someone else
  if (existingOwner) {
    return (
      <div className="bg-stout-800 rounded-lg border border-stout-700 p-4">
        <div className="flex items-center gap-2 text-cream-100">
          <svg className="w-5 h-5 text-irish-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">Verified Pub</span>
        </div>
        <p className="text-sm text-stout-400 mt-1">
          This pub is managed by a verified owner
        </p>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full bg-stout-700 hover:bg-stout-600 text-cream-100 py-2 px-4 rounded-lg transition-colors text-sm"
      >
        Own this pub? Claim it
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-stout-800 rounded-lg border border-stout-700 w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-stout-700">
              <h2 className="text-lg font-semibold text-cream-100">Claim {pubName}</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-stout-400 hover:text-cream-100"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4">
              {/* Pending claim notice */}
              {existingClaim && existingClaim.status === 'verified' && (
                <div className="bg-amber-900/30 border border-amber-700 rounded-lg p-3 mb-4">
                  <p className="text-sm text-amber-400">
                    Your claim is pending admin approval. We'll email you when it's approved.
                  </p>
                </div>
              )}

              {existingClaim && existingClaim.status === 'approved' && (
                <div className="bg-green-900/30 border border-green-700 rounded-lg p-3 mb-4">
                  <p className="text-sm text-green-400">
                    Your claim has been approved! You can now manage this pub.
                  </p>
                </div>
              )}

              {existingClaim && existingClaim.status === 'rejected' && (
                <div className="bg-red-900/30 border border-red-700 rounded-lg p-3 mb-4">
                  <p className="text-sm text-red-400">
                    Your claim was rejected: {existingClaim.rejection_reason || 'No reason provided'}
                  </p>
                </div>
              )}

              {step === 'form' && !existingClaim?.status?.match(/verified|approved/) && (
                <form onSubmit={handleSubmitClaim} className="space-y-4">
                  <p className="text-sm text-stout-400">
                    Verify you own or manage this pub to update prices, deals, and information directly.
                  </p>

                  <div>
                    <label className="block text-sm text-stout-300 mb-1">Business Email *</label>
                    <input
                      type="email"
                      value={businessEmail}
                      onChange={(e) => setBusinessEmail(e.target.value)}
                      required
                      placeholder="info@yourpub.ie"
                      className="w-full bg-stout-700 border border-stout-600 rounded-lg px-3 py-2 text-cream-100 placeholder-stout-500 focus:border-irish-green-500 focus:outline-none"
                    />
                    <p className="text-xs text-stout-500 mt-1">We'll send a verification code to this email</p>
                  </div>

                  <div>
                    <label className="block text-sm text-stout-300 mb-1">Business Name</label>
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="Your Pub Ltd"
                      className="w-full bg-stout-700 border border-stout-600 rounded-lg px-3 py-2 text-cream-100 placeholder-stout-500 focus:border-irish-green-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-stout-300 mb-1">Your Role *</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as 'owner' | 'manager' | 'staff')}
                      className="w-full bg-stout-700 border border-stout-600 rounded-lg px-3 py-2 text-cream-100 focus:border-irish-green-500 focus:outline-none"
                    >
                      <option value="owner">Owner</option>
                      <option value="manager">Manager</option>
                      <option value="staff">Staff</option>
                    </select>
                  </div>

                  {error && <p className="text-sm text-red-400">{error}</p>}
                  {success && <p className="text-sm text-green-400">{success}</p>}

                  <button
                    type="submit"
                    disabled={loading || !businessEmail}
                    className="w-full bg-irish-green-600 hover:bg-irish-green-700 disabled:bg-stout-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    {loading ? 'Sending...' : 'Send Verification Email'}
                  </button>
                </form>
              )}

              {step === 'verify' && existingClaim?.status === 'email_sent' && (
                <form onSubmit={handleVerify} className="space-y-4">
                  <p className="text-sm text-stout-400">
                    Enter the verification code sent to <strong className="text-cream-100">{existingClaim.business_email}</strong>
                  </p>

                  <div>
                    <label className="block text-sm text-stout-300 mb-1">Verification Code</label>
                    <input
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                      required
                      placeholder="XXXXXX"
                      maxLength={6}
                      className="w-full bg-stout-700 border border-stout-600 rounded-lg px-3 py-2 text-cream-100 placeholder-stout-500 focus:border-irish-green-500 focus:outline-none text-center text-2xl tracking-widest"
                    />
                  </div>

                  {error && <p className="text-sm text-red-400">{error}</p>}
                  {success && <p className="text-sm text-green-400">{success}</p>}

                  <button
                    type="submit"
                    disabled={loading || verificationCode.length < 6}
                    className="w-full bg-irish-green-600 hover:bg-irish-green-700 disabled:bg-stout-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    {loading ? 'Verifying...' : 'Verify'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep('form')}
                    className="w-full text-sm text-stout-400 hover:text-cream-100"
                  >
                    Use a different email
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
