'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';

declare global {
  interface Window {
    gtag?: (command: string, ...args: any[]) => void;
  }
}

interface GoogleAnalyticsProps {
  measurementId: string;
}

function PageViewTracker({ measurementId }: { measurementId: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!measurementId || !window.gtag) return;

    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');

    // Track pageview
    window.gtag('config', measurementId, {
      page_path: url,
    });
  }, [pathname, searchParams, measurementId]);

  return null;
}

export default function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  if (!measurementId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
      <Suspense fallback={null}>
        <PageViewTracker measurementId={measurementId} />
      </Suspense>
    </>
  );
}

// Helper functions for custom event tracking
export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, parameters);
  }
};

export const trackPubView = (pubId: string, pubName: string) => {
  trackEvent('view_pub', {
    pub_id: pubId,
    pub_name: pubName,
  });
};

export const trackPriceSubmission = (pubId: string, drinkId: number, price: number) => {
  trackEvent('submit_price', {
    pub_id: pubId,
    drink_id: drinkId,
    price: price,
  });
};

export const trackCheckIn = (pubId: string) => {
  trackEvent('check_in', {
    pub_id: pubId,
  });
};

export const trackDealClick = (pubId: string, dealId: string) => {
  trackEvent('click_deal', {
    pub_id: pubId,
    deal_id: dealId,
  });
};

export const trackDirectionsClick = (pubId: string, pubName: string) => {
  trackEvent('get_directions', {
    pub_id: pubId,
    pub_name: pubName,
  });
};

export const trackIntentSearch = (intent: string) => {
  trackEvent('search_intent', {
    intent: intent,
  });
};

export const trackReferralCopy = (referralCode: string) => {
  trackEvent('copy_referral', {
    referral_code: referralCode,
  });
};

export const trackPremiumUpgrade = (plan: 'monthly' | 'yearly') => {
  trackEvent('upgrade_premium', {
    plan: plan,
  });
};
