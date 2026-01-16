'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

interface ReportButtonProps {
  entityType: 'pub' | 'price' | 'deal' | 'review';
  entityId: string;
  entityName?: string;
}

const REPORT_TYPES = [
  { value: 'price_wrong', label: 'Price is wrong', description: 'The listed price is incorrect' },
  { value: 'deal_expired', label: 'Deal expired', description: 'This deal is no longer available' },
  { value: 'pub_closed', label: 'Pub closed', description: 'This pub has closed down' },
  { value: 'inappropriate', label: 'Inappropriate content', description: 'Contains offensive or spam content' },
  { value: 'other', label: 'Other issue', description: 'Something else is wrong' },
] as const;

export default function ReportButton({ entityType, entityId, entityName }: ReportButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('');
  const supabase = createClient();

  const handleSubmit = async () => {
    if (!selectedType) return;

    setIsSubmitting(true);

    const { data: { user } } = await supabase.auth.getUser();

    const reportData = {
      entity_type: entityType,
      entity_id: entityId,
      user_id: user?.id || null,
      report_type: selectedType,
      status: 'pending',
    };

    const { error } = await supabase
      .from('reports')
      .insert(reportData);

    if (!error) {
      setSubmitted(true);
      setTimeout(() => {
        setIsOpen(false);
        setSubmitted(false);
        setSelectedType('');
      }, 2000);
    }

    setIsSubmitting(false);
  };

  // Filter report types based on entity type
  const availableTypes = REPORT_TYPES.filter(type => {
    if (entityType === 'pub') {
      return ['pub_closed', 'inappropriate', 'other'].includes(type.value);
    }
    if (entityType === 'price') {
      return ['price_wrong', 'other'].includes(type.value);
    }
    if (entityType === 'deal') {
      return ['deal_expired', 'price_wrong', 'other'].includes(type.value);
    }
    if (entityType === 'review') {
      return ['inappropriate', 'other'].includes(type.value);
    }
    return true;
  });

  if (submitted) {
    return (
      <div className="flex items-center gap-2 text-irish-green-400 text-sm">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        Report submitted
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 text-xs text-stout-400 hover:text-red-400 transition-colors"
        title="Report an issue"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        Report
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal */}
          <div className="absolute right-0 z-50 mt-2 p-4 bg-stout-800 border border-stout-600 rounded-lg shadow-xl min-w-[300px]">
            <h4 className="text-sm font-medium text-cream-100 mb-1">
              Report an Issue
            </h4>
            {entityName && (
              <p className="text-xs text-stout-400 mb-3">
                {entityName}
              </p>
            )}

            <div className="space-y-2 mb-4">
              {availableTypes.map((type) => (
                <label
                  key={type.value}
                  className={`flex items-start gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                    selectedType === type.value
                      ? 'bg-red-500/10 border border-red-500/50'
                      : 'hover:bg-stout-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="reportType"
                    value={type.value}
                    checked={selectedType === type.value}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="mt-1 accent-red-500"
                  />
                  <div>
                    <span className="text-sm text-cream-100 block">{type.label}</span>
                    <span className="text-xs text-stout-400">{type.description}</span>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !selectedType}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setSelectedType('');
                }}
                className="px-4 py-2 bg-stout-700 text-stout-300 text-sm rounded-lg hover:bg-stout-600 transition-colors"
              >
                Cancel
              </button>
            </div>

            <p className="mt-3 text-xs text-stout-500">
              Reports are reviewed by our team within 24 hours.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
