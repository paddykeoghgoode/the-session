import type { Pub, PubIntent, IntentWeights } from '@/types';
import { PUB_INTENTS } from '@/types';
import { getDistanceKm } from './utils';

interface ScoringContext {
  userLatitude?: number;
  userLongitude?: number;
  vibes?: Record<string, number>; // vibe -> vote count
}

export function scorePubForIntent(
  pub: Pub,
  intent: PubIntent,
  context: ScoringContext = {}
): number {
  const weights = PUB_INTENTS[intent].weights;
  let totalScore = 0;
  let totalWeight = 0;

  // Amenity scores
  if (weights.food && pub.has_food) {
    totalScore += weights.food * 100;
    totalWeight += weights.food;
  }

  if (weights.outdoor && (pub.has_outdoor_seating || pub.has_beer_garden)) {
    totalScore += weights.outdoor * 100;
    totalWeight += weights.outdoor;
  }

  if (weights.sports && pub.shows_sports) {
    totalScore += weights.sports * 100;
    totalWeight += weights.sports;
  }

  if (weights.liveMusic && pub.has_live_music) {
    totalScore += weights.liveMusic * 100;
    totalWeight += weights.liveMusic;
  }

  if (weights.tradMusic && pub.has_traditional_music) {
    totalScore += weights.tradMusic * 100;
    totalWeight += weights.tradMusic;
  }

  if (weights.beerGarden && pub.has_beer_garden) {
    totalScore += weights.beerGarden * 100;
    totalWeight += weights.beerGarden;
  }

  if (weights.craftBeer && pub.is_craft_beer_focused) {
    totalScore += weights.craftBeer * 100;
    totalWeight += weights.craftBeer;
  }

  if (weights.latebar && pub.is_late_bar) {
    totalScore += weights.latebar * 100;
    totalWeight += weights.latebar;
  }

  // Vibe scores (if we have vibe data)
  if (context.vibes) {
    const vibeWeights = {
      romantic: weights.romantic,
      quiet: weights.quiet,
      lively: weights.lively,
      cozy: weights.cozy,
      upscale: weights.upscale,
      traditional: weights.traditional,
      casual: weights.casual,
    };

    Object.entries(vibeWeights).forEach(([vibe, weight]) => {
      if (weight && context.vibes?.[vibe]) {
        // Score based on how many people voted for this vibe
        const vibeVotes = context.vibes[vibe];
        totalScore += weight * vibeVotes * 10; // Each vote = 10 points
        totalWeight += weight;
      }
    });
  }

  // Price score (lower is better for price-sensitive intents)
  if (weights.price && pub.cheapest_guinness) {
    const priceScore = Math.max(0, 100 - (pub.cheapest_guinness - 5) * 20); // €5 = 100pts, €10 = 0pts
    totalScore += weights.price * priceScore;
    totalWeight += weights.price;
  }

  // Distance score (closer is better)
  if (weights.distance && context.userLatitude && context.userLongitude && pub.latitude && pub.longitude) {
    const distanceKm = getDistanceKm(
      context.userLatitude,
      context.userLongitude,
      pub.latitude,
      pub.longitude
    );
    const distanceScore = Math.max(0, 100 - distanceKm * 20); // 0km = 100pts, 5km = 0pts
    totalScore += weights.distance * distanceScore;
    totalWeight += weights.distance;
  }

  // Rating score
  if (weights.rating && pub.avg_rating) {
    const ratingScore = (pub.avg_rating / 5) * 100; // 5 stars = 100pts
    totalScore += weights.rating * ratingScore;
    totalWeight += weights.rating;
  }

  // Return normalized score (0-100)
  return totalWeight > 0 ? totalScore / totalWeight : 0;
}

export function rankPubsByIntent(
  pubs: Pub[],
  intent: PubIntent,
  context: ScoringContext = {}
): Pub[] {
  return pubs
    .map((pub) => ({
      pub,
      score: scorePubForIntent(pub, intent, context),
    }))
    .filter(({ score }) => score > 20) // Only show pubs with decent match
    .sort((a, b) => b.score - a.score)
    .map(({ pub }) => pub);
}
