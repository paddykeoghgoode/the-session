import type { Pub, UserPreferences, PersonalizedRecommendation } from '@/types';
import { getDistanceKm } from './utils';

interface UserBehavior {
  visitedPubIds: string[];
  likedPubIds: string[];
  favoriteDrinks: number[];
  averageSpend?: number;
  preferredVibes: string[];
}

export function generatePersonalizedScore(
  pub: Pub,
  preferences: UserPreferences,
  behavior: UserBehavior,
  userLocation?: { latitude: number; longitude: number }
): { score: number; reasons: string[]; matchedPreferences: string[] } {
  let score = 0;
  const reasons: string[] = [];
  const matchedPreferences: string[] = [];

  // Base score from ratings
  if (pub.avg_rating) {
    score += (pub.avg_rating / 5) * 20; // Max 20 points from rating
  }

  // Distance score (if we have user location)
  if (userLocation && pub.latitude && pub.longitude) {
    const distance = getDistanceKm(
      userLocation.latitude,
      userLocation.longitude,
      pub.latitude,
      pub.longitude
    );

    if (distance <= 1) {
      score += 30;
      reasons.push(`Only ${distance.toFixed(1)}km from you`);
      matchedPreferences.push('nearby');
    } else if (distance <= 2) {
      score += 20;
    } else if (distance <= 5) {
      score += 10;
    }
  }

  // Price match for favorite drinks
  if (behavior.favoriteDrinks.length > 0) {
    const guinness = behavior.favoriteDrinks.includes(1);
    const lager = behavior.favoriteDrinks.some((id) => [2, 3, 4].includes(id));
    const cider = behavior.favoriteDrinks.some((id) => [5, 6, 7].includes(id));

    if (guinness && pub.cheapest_guinness) {
      if (pub.cheapest_guinness < 6.0) {
        score += 25;
        reasons.push(`Great Guinness price (€${pub.cheapest_guinness.toFixed(2)})`);
        matchedPreferences.push('price');
      } else if (pub.cheapest_guinness < 6.5) {
        score += 15;
      }
    }

    if (lager && pub.cheapest_lager) {
      if (pub.cheapest_lager < 6.0) {
        score += 20;
        reasons.push(`Cheap lager (€${pub.cheapest_lager.toFixed(2)})`);
        matchedPreferences.push('price');
      }
    }

    if (cider && pub.cheapest_cider) {
      if (pub.cheapest_cider < 6.0) {
        score += 20;
        reasons.push(`Affordable cider (€${pub.cheapest_cider.toFixed(2)})`);
        matchedPreferences.push('price');
      }
    }
  }

  // Vibe matching
  if (preferences.preferred_vibes && preferences.preferred_vibes.length > 0) {
    // This would require fetching vibe data, for now we'll use amenities as a proxy
    const matchedVibes: string[] = [];

    if (preferences.preferred_vibes.includes('cozy')) {
      if (pub.has_snug || pub.has_board_games) {
        score += 15;
        matchedVibes.push('cozy');
      }
    }

    if (preferences.preferred_vibes.includes('lively')) {
      if (pub.has_live_music || pub.shows_sports) {
        score += 15;
        matchedVibes.push('lively');
      }
    }

    if (preferences.preferred_vibes.includes('traditional')) {
      if (pub.has_traditional_music) {
        score += 20;
        matchedVibes.push('traditional');
      }
    }

    if (matchedVibes.length > 0) {
      reasons.push(`Matches your vibes: ${matchedVibes.join(', ')}`);
      matchedPreferences.push('vibes');
    }
  }

  // Amenity preferences (infer from behavior)
  const amenityMatches: string[] = [];

  if (pub.has_food && behavior.visitedPubIds.length > 0) {
    // If user often visits pubs with food
    score += 10;
    amenityMatches.push('food');
  }

  if (pub.has_beer_garden) {
    score += 10;
    amenityMatches.push('beer garden');
  }

  if (pub.is_dog_friendly) {
    score += 5;
    amenityMatches.push('dog friendly');
  }

  if (amenityMatches.length > 0 && amenityMatches.length <= 2) {
    reasons.push(`Has ${amenityMatches.join(' and ')}`);
    matchedPreferences.push('amenities');
  }

  // Social proof - if friends liked this pub
  if (behavior.likedPubIds.includes(pub.id)) {
    score += 30;
    reasons.push('You liked this pub');
    matchedPreferences.push('previous-like');
  }

  // Popularity boost
  if (pub.review_count && pub.review_count > 10) {
    score += 10;
    if (pub.review_count > 50) {
      score += 10;
    }
  }

  // Cream rating for Guinness lovers
  if (behavior.favoriteDrinks.includes(1) && pub.avg_cream_score && pub.avg_cream_score > 4) {
    score += 15;
    reasons.push(`Excellent Guinness (${pub.avg_cream_score.toFixed(1)}/5 cream rating)`);
    matchedPreferences.push('quality');
  }

  return {
    score: Math.round(score),
    reasons,
    matchedPreferences,
  };
}

export function getPersonalizedRecommendations(
  pubs: Pub[],
  preferences: UserPreferences,
  behavior: UserBehavior,
  userLocation?: { latitude: number; longitude: number },
  limit: number = 10
): PersonalizedRecommendation[] {
  const scored = pubs.map((pub) => {
    const { score, reasons, matchedPreferences } = generatePersonalizedScore(
      pub,
      preferences,
      behavior,
      userLocation
    );

    return {
      pub,
      score,
      reasons,
      matchedPreferences,
    };
  });

  return scored
    .filter((rec) => rec.score > 30) // Only show decent matches
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
