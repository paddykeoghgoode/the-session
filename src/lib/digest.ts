import { getDistanceKm, formatPrice } from './utils';
import type { Price, Pub, Drink } from '@/types';

export interface DigestData {
  generated_at: string;
  deals_near_you: DealSummary[];
  price_drops: PriceDropSummary[];
  top_verified_pubs: VerifiedPubSummary[];
  weekly_stats: WeeklyStats;
  personalized_recommendations: RecommendationSummary[];
}

interface DealSummary {
  pub_name: string;
  pub_slug: string;
  deal_title: string | null;
  deal_description: string | null;
  price: number;
  drink_name: string | null;
  distance_km: number | null;
}

interface PriceDropSummary {
  pub_name: string;
  pub_slug: string;
  drink_name: string;
  new_price: number;
  distance_km: number | null;
}

interface VerifiedPubSummary {
  pub_name: string;
  pub_slug: string;
  verification_count: number;
  cheapest_guinness: number | null;
}

interface WeeklyStats {
  new_deals_count: number;
  new_prices_count: number;
  active_users_count: number;
  cheapest_guinness_this_week: {
    pub_name: string;
    pub_slug: string;
    price: number;
  } | null;
}

interface RecommendationSummary {
  pub_name: string;
  pub_slug: string;
  reason: string;
  distance_km: number | null;
}

interface TopPubData {
  id: string;
  name: string;
  slug: string;
  address?: string;
  cheapest_guinness?: number | null;
  verificationCount: number;
}

interface GenerateDigestParams {
  userId: string;
  userLocation: { lat: number; lng: number } | null;
  radiusKm: number;
  favoriteDrinks: number[];
  newDeals: (Price & { pub?: Pub; drink?: Drink })[];
  recentPrices: (Price & { pub?: Pub; drink?: Drink })[];
  topPubs: TopPubData[];
}

export function generateDigestContent(params: GenerateDigestParams): DigestData {
  const {
    userLocation,
    radiusKm,
    favoriteDrinks,
    newDeals,
    recentPrices,
    topPubs,
  } = params;

  // Filter and sort deals by distance if location available
  let dealsNearYou: DealSummary[] = newDeals
    .filter(deal => deal.pub)
    .map(deal => {
      let distanceKm: number | null = null;
      if (userLocation && deal.pub?.latitude && deal.pub?.longitude) {
        distanceKm = getDistanceKm(
          userLocation.lat,
          userLocation.lng,
          deal.pub.latitude,
          deal.pub.longitude
        );
      }
      return {
        pub_name: deal.pub!.name,
        pub_slug: deal.pub!.slug || deal.pub!.id,
        deal_title: deal.deal_title,
        deal_description: deal.deal_description,
        price: deal.price,
        drink_name: deal.drink?.name || null,
        distance_km: distanceKm,
      };
    });

  // Filter by radius if location available
  if (userLocation) {
    dealsNearYou = dealsNearYou
      .filter(d => d.distance_km === null || d.distance_km <= radiusKm)
      .sort((a, b) => (a.distance_km || 999) - (b.distance_km || 999));
  }

  // Limit to top 5
  dealsNearYou = dealsNearYou.slice(0, 5);

  // Filter price drops for favorite drinks
  let priceDrops: PriceDropSummary[] = recentPrices
    .filter(price => {
      // Include if it's a favorite drink or if user has no favorites (show all)
      return favoriteDrinks.length === 0 ||
        (price.drink_id && favoriteDrinks.includes(price.drink_id));
    })
    .filter(price => price.pub && price.drink)
    .map(price => {
      let distanceKm: number | null = null;
      if (userLocation && price.pub?.latitude && price.pub?.longitude) {
        distanceKm = getDistanceKm(
          userLocation.lat,
          userLocation.lng,
          price.pub.latitude,
          price.pub.longitude
        );
      }
      return {
        pub_name: price.pub!.name,
        pub_slug: price.pub!.slug || price.pub!.id,
        drink_name: price.drink!.name,
        new_price: price.price,
        distance_km: distanceKm,
      };
    });

  // Sort by price ascending
  priceDrops = priceDrops.sort((a, b) => a.new_price - b.new_price).slice(0, 5);

  // Top verified pubs
  const topVerifiedPubs: VerifiedPubSummary[] = topPubs.map(pub => ({
    pub_name: pub.name,
    pub_slug: pub.slug || pub.id,
    verification_count: pub.verificationCount,
    cheapest_guinness: pub.cheapest_guinness || null,
  }));

  // Find cheapest Guinness this week
  const guinnessPrice = recentPrices.find(p =>
    p.drink?.name?.toLowerCase().includes('guinness')
  );
  const cheapestGuinnessThisWeek = guinnessPrice && guinnessPrice.pub
    ? {
        pub_name: guinnessPrice.pub.name,
        pub_slug: guinnessPrice.pub.slug || guinnessPrice.pub.id,
        price: guinnessPrice.price,
      }
    : null;

  // Weekly stats
  const weeklyStats: WeeklyStats = {
    new_deals_count: newDeals.length,
    new_prices_count: recentPrices.length,
    active_users_count: new Set(recentPrices.map(p => p.submitted_by)).size,
    cheapest_guinness_this_week: cheapestGuinnessThisWeek,
  };

  // Personalized recommendations (based on favorite drinks)
  const recommendations: RecommendationSummary[] = [];

  // Find pubs with good prices on favorite drinks
  if (favoriteDrinks.length > 0) {
    const favoritePrices = recentPrices.filter(p =>
      p.drink_id && favoriteDrinks.includes(p.drink_id) && p.pub
    );

    const pubPrices: Record<string, { pub: Pub; total: number; count: number }> = {};
    favoritePrices.forEach(p => {
      if (!p.pub) return;
      if (!pubPrices[p.pub.id]) {
        pubPrices[p.pub.id] = { pub: p.pub, total: 0, count: 0 };
      }
      pubPrices[p.pub.id].total += p.price;
      pubPrices[p.pub.id].count += 1;
    });

    // Sort by average price
    const sortedPubs = Object.values(pubPrices)
      .map(p => ({ ...p, avgPrice: p.total / p.count }))
      .sort((a, b) => a.avgPrice - b.avgPrice)
      .slice(0, 3);

    sortedPubs.forEach(p => {
      let distanceKm: number | null = null;
      if (userLocation && p.pub.latitude && p.pub.longitude) {
        distanceKm = getDistanceKm(
          userLocation.lat,
          userLocation.lng,
          p.pub.latitude,
          p.pub.longitude
        );
      }
      recommendations.push({
        pub_name: p.pub.name,
        pub_slug: p.pub.slug || p.pub.id,
        reason: `Great prices on your favorite drinks (avg ${formatPrice(p.avgPrice)})`,
        distance_km: distanceKm,
      });
    });
  }

  return {
    generated_at: new Date().toISOString(),
    deals_near_you: dealsNearYou,
    price_drops: priceDrops,
    top_verified_pubs: topVerifiedPubs,
    weekly_stats: weeklyStats,
    personalized_recommendations: recommendations,
  };
}

// Generate HTML email content from digest data
export function generateDigestEmailHtml(data: DigestData): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://thesession.ie';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Your Weekly Session</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #121212; color: #e5e5e5; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #1a1a1a; border-radius: 12px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #169b62, #0f7a4b); padding: 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 28px; }
    .header p { color: rgba(255,255,255,0.8); margin: 10px 0 0; }
    .content { padding: 24px; }
    .section { margin-bottom: 30px; }
    .section-title { font-size: 18px; font-weight: 600; color: #f5f5dc; margin-bottom: 16px; border-bottom: 1px solid #333; padding-bottom: 8px; }
    .card { background: #252525; border-radius: 8px; padding: 16px; margin-bottom: 12px; }
    .card-title { font-weight: 600; color: #f5f5dc; margin-bottom: 4px; }
    .card-subtitle { font-size: 14px; color: #888; }
    .card-price { font-size: 20px; font-weight: 700; color: #169b62; }
    .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
    .stat-card { background: #252525; border-radius: 8px; padding: 16px; text-align: center; }
    .stat-value { font-size: 24px; font-weight: 700; color: #169b62; }
    .stat-label { font-size: 12px; color: #888; margin-top: 4px; }
    .cta-button { display: inline-block; background: #169b62; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; }
    .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
    a { color: #169b62; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Your Weekly Session</h1>
      <p>This week's best deals and discoveries</p>
    </div>

    <div class="content">
      ${data.weekly_stats.cheapest_guinness_this_week ? `
      <div class="section">
        <div class="card" style="text-align: center; background: linear-gradient(135deg, #1a3320, #0f1f14);">
          <div style="font-size: 14px; color: #888;">Cheapest Guinness This Week</div>
          <div class="card-price" style="font-size: 32px; margin: 8px 0;">${formatPrice(data.weekly_stats.cheapest_guinness_this_week.price)}</div>
          <div class="card-title"><a href="${baseUrl}/pubs/${data.weekly_stats.cheapest_guinness_this_week.pub_slug}">${data.weekly_stats.cheapest_guinness_this_week.pub_name}</a></div>
        </div>
      </div>
      ` : ''}

      ${data.deals_near_you.length > 0 ? `
      <div class="section">
        <div class="section-title">Deals Near You</div>
        ${data.deals_near_you.map(deal => `
        <div class="card">
          <div style="display: flex; justify-content: space-between; align-items: start;">
            <div>
              <div class="card-title"><a href="${baseUrl}/pubs/${deal.pub_slug}">${deal.pub_name}</a></div>
              <div class="card-subtitle">${deal.deal_title || deal.drink_name || 'Special Deal'}${deal.distance_km ? ` • ${deal.distance_km.toFixed(1)}km away` : ''}</div>
            </div>
            <div class="card-price">${formatPrice(deal.price)}</div>
          </div>
        </div>
        `).join('')}
      </div>
      ` : ''}

      ${data.price_drops.length > 0 ? `
      <div class="section">
        <div class="section-title">Best Prices on Your Drinks</div>
        ${data.price_drops.map(drop => `
        <div class="card">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div class="card-title"><a href="${baseUrl}/pubs/${drop.pub_slug}">${drop.pub_name}</a></div>
              <div class="card-subtitle">${drop.drink_name}</div>
            </div>
            <div class="card-price">${formatPrice(drop.new_price)}</div>
          </div>
        </div>
        `).join('')}
      </div>
      ` : ''}

      <div class="section">
        <div class="section-title">This Week's Stats</div>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">${data.weekly_stats.new_deals_count}</div>
            <div class="stat-label">New Deals</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${data.weekly_stats.new_prices_count}</div>
            <div class="stat-label">Price Updates</div>
          </div>
        </div>
      </div>

      <div style="text-align: center; margin-top: 30px;">
        <a href="${baseUrl}/pubs" class="cta-button">Find Your Next Pint</a>
      </div>
    </div>

    <div class="footer">
      <p>You're receiving this because you subscribed to weekly digests.</p>
      <p><a href="${baseUrl}/profile/preferences">Manage preferences</a> | <a href="${baseUrl}/auth/signout">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>
  `;
}
