'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import PriceForm from '@/components/PriceForm';
import type { Pub } from '@/types';

export default function AddPricePage() {
  const [pubs, setPubs] = useState<Pub[]>([]);
  const [selectedPubId, setSelectedPubId] = useState<string | null>(null);
  const [selectedPub, setSelectedPub] = useState<Pub | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        router.push('/auth/login?redirect=/prices/add');
        return;
      }
      setUser(currentUser);
    };

    const fetchPubs = async () => {
      const { data } = await supabase
        .from('pubs')
        .select('*')
        .order('name');

      if (data) {
        setPubs(data);
      }
      setLoading(false);
    };

    checkAuth();
    fetchPubs();

    // Check if pub is pre-selected via query param
    const pubId = searchParams.get('pub');
    if (pubId) {
      setSelectedPubId(pubId);
    }
  }, [router, searchParams, supabase]);

  useEffect(() => {
    if (selectedPubId && pubs.length > 0) {
      const pub = pubs.find(p => p.id === selectedPubId);
      setSelectedPub(pub || null);
    }
  }, [selectedPubId, pubs]);

  const handlePubSelect = (pubId: string) => {
    setSelectedPubId(pubId);
    const pub = pubs.find(p => p.id === pubId);
    setSelectedPub(pub || null);
  };

  const handleSuccess = () => {
    // Redirect to the pub page after successful submission
    if (selectedPub) {
      router.push(`/pubs/${selectedPub.slug || selectedPub.id}`);
    }
  };

  const filteredPubs = pubs.filter(pub =>
    pub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pub.address?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-10 bg-stout-800 rounded w-64 mb-4" />
          <div className="h-20 bg-stout-800 rounded" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-cream-100 mb-2">Submit a Price</h1>
        <p className="text-stout-400">
          Help the community by sharing current pint prices. Earn 5 points for each price you submit!
        </p>
      </div>

      <div className="bg-stout-800 p-6 rounded-lg border border-stout-700 mb-6">
        <h2 className="text-lg font-semibold text-cream-100 mb-4">
          {selectedPub ? 'Selected Pub' : 'Select a Pub'}
        </h2>

        {selectedPub ? (
          <div className="bg-stout-700 p-4 rounded-lg mb-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-cream-100 font-medium">{selectedPub.name}</h3>
                <p className="text-stout-400 text-sm">{selectedPub.address}</p>
              </div>
              <button
                onClick={() => {
                  setSelectedPubId(null);
                  setSelectedPub(null);
                }}
                className="text-stout-400 hover:text-cream-100 text-sm"
              >
                Change
              </button>
            </div>
          </div>
        ) : (
          <>
            <input
              type="text"
              placeholder="Search pubs by name or area..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-stout-700 border border-stout-600 rounded-lg text-cream-100 placeholder-stout-400 focus:outline-none focus:border-irish-green-500 mb-4"
            />

            <div className="max-h-80 overflow-y-auto space-y-2">
              {filteredPubs.length > 0 ? (
                filteredPubs.map((pub) => (
                  <button
                    key={pub.id}
                    onClick={() => handlePubSelect(pub.id)}
                    className="w-full text-left p-3 bg-stout-700 hover:bg-stout-600 rounded-lg transition-colors"
                  >
                    <div className="font-medium text-cream-100">{pub.name}</div>
                    <div className="text-sm text-stout-400">{pub.address}</div>
                  </button>
                ))
              ) : (
                <p className="text-stout-400 text-center py-4">
                  No pubs found matching &quot;{searchQuery}&quot;
                </p>
              )}
            </div>
          </>
        )}
      </div>

      {selectedPubId && (
        <div className="bg-stout-800 p-6 rounded-lg border border-stout-700">
          <h2 className="text-lg font-semibold text-cream-100 mb-4">Price Details</h2>
          <PriceForm pubId={selectedPubId} onSuccess={handleSuccess} />
        </div>
      )}
    </div>
  );
}
