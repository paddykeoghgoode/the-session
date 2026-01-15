export interface Pub {
  id: string;
  slug: string;
  name: string;
  address: string;
  eircode: string | null;
  latitude: number | null;
  longitude: number | null;
  google_place_id: string | null;
  phone: string | null;
  website: string | null;
  has_food: boolean;
  has_outdoor_seating: boolean;
  shows_sports: boolean;
  has_live_music: boolean;
  has_pool: boolean;
  has_darts: boolean;
  has_board_games: boolean;
  is_speakeasy: boolean;
  is_permanently_closed: boolean;
  // Opening hours (per day)
  hours_monday_open: string | null;
  hours_monday_close: string | null;
  hours_tuesday_open: string | null;
  hours_tuesday_close: string | null;
  hours_wednesday_open: string | null;
  hours_wednesday_close: string | null;
  hours_thursday_open: string | null;
  hours_thursday_close: string | null;
  hours_friday_open: string | null;
  hours_friday_close: string | null;
  hours_saturday_open: string | null;
  hours_saturday_close: string | null;
  hours_sunday_open: string | null;
  hours_sunday_close: string | null;
  created_at: string;
  updated_at: string;
  // Computed fields from joins
  avg_rating?: number;
  review_count?: number;
  cheapest_guinness?: number;
  cheapest_lager?: number;
  cheapest_cider?: number;
}

export interface Drink {
  id: number;
  name: string;
  category: 'beer' | 'cider';
}

export interface Price {
  id: string;
  pub_id: string;
  drink_id: number;
  price: number;
  is_deal: boolean;
  deal_description: string | null;
  deal_type: 'drink_only' | 'food_combo';
  food_item: string | null;
  submitted_by: string;
  verified: boolean;
  upvotes: number;
  downvotes: number;
  created_at: string;
  // Joined fields
  drink?: Drink;
  pub?: Pub;
  submitter?: Profile;
}

export interface FoodItem {
  id: number;
  name: string;
  category: 'sandwich' | 'hot_meal' | 'snack' | 'other';
}

export interface Review {
  id: string;
  pub_id: string;
  user_id: string;
  pint_quality: number | null;
  ambience: number | null;
  food_quality: number | null;
  staff_friendliness: number | null;
  safety: number | null;
  value_for_money: number | null;
  comment: string | null;
  is_approved: boolean;
  moderation_note: string | null;
  created_at: string;
  // Joined fields
  pub?: Pub;
  profile?: Profile;
}

export interface Profile {
  id: string;
  username: string | null;
  display_name: string | null;
  is_verified_local: boolean;
  is_trusted: boolean;
  is_admin: boolean;
  total_contributions: number;
  uploads_today: number;
  created_at: string;
}

export interface PubPhoto {
  id: string;
  pub_id: string;
  user_id: string;
  storage_path: string;
  thumbnail_path: string | null;
  original_filename: string | null;
  file_size: number;
  width: number | null;
  height: number | null;
  caption: string | null;
  is_approved: boolean;
  is_primary: boolean;
  moderation_note: string | null;
  created_at: string;
  approved_at: string | null;
  // Joined fields
  pub?: Pub;
  profile?: Profile;
}

export interface PubWithPrices extends Pub {
  prices: Price[];
  reviews: Review[];
}

// Form types
export interface PriceSubmission {
  pub_id: string;
  drink_id: number;
  price: number;
  is_deal: boolean;
  deal_description?: string;
}

export interface ReviewSubmission {
  pub_id: string;
  pint_quality?: number;
  ambience?: number;
  food_quality?: number;
  staff_friendliness?: number;
  safety?: number;
  value_for_money?: number;
  comment?: string;
}

// Leaderboard types
export interface CheapestPrice {
  pub: Pub;
  drink: Drink;
  price: number;
  submitted_at: string;
}

export interface TopRatedPub {
  pub: Pub;
  avg_rating: number;
  review_count: number;
}

// Constants - IDs match database order, do NOT reorder existing drinks
export const DRINKS: Omit<Drink, 'id'>[] = [
  // Original drinks (1-7) - keep order for backward compatibility
  { name: 'Guinness', category: 'beer' },      // 1 - Stout
  { name: 'Heineken', category: 'beer' },      // 2 - Lager
  { name: 'Coors Light', category: 'beer' },   // 3 - Lager
  { name: 'Rockshore Lager', category: 'beer' }, // 4 - Lager
  { name: 'Bulmers', category: 'cider' },      // 5 - Cider
  { name: 'Orchard Thieves', category: 'cider' }, // 6 - Cider
  { name: 'Rockshore Cider', category: 'cider' }, // 7 - Cider
  // New drinks (8-18)
  { name: 'Beamish', category: 'beer' },       // 8 - Stout
  { name: 'Murphys', category: 'beer' },       // 9 - Stout
  { name: 'Carlsberg', category: 'beer' },     // 10 - Lager
  { name: 'Tuborg', category: 'beer' },        // 11 - Lager
  { name: 'Birra Moretti', category: 'beer' }, // 12 - Lager
  { name: 'San Miguel', category: 'beer' },    // 13 - Lager
  { name: 'Hop House 13', category: 'beer' },  // 14 - Lager
  { name: 'Budweiser', category: 'beer' },     // 15 - Lager
  { name: 'Madri', category: 'beer' },         // 16 - Lager
  { name: 'Asahi', category: 'beer' },         // 17 - Lager
  { name: 'Smithwicks', category: 'beer' },    // 18 - Ale
];

export const RATING_CATEGORIES = [
  { key: 'pint_quality', label: 'Pint Quality', description: 'How good is the pour?' },
  { key: 'ambience', label: 'Ambience', description: 'Atmosphere and decor' },
  { key: 'food_quality', label: 'Food Quality', description: 'If they serve food' },
  { key: 'staff_friendliness', label: 'Staff', description: 'Service and friendliness' },
  { key: 'safety', label: 'Safety', description: 'How safe do you feel?' },
  { key: 'value_for_money', label: 'Value', description: 'Bang for your buck' },
] as const;

// Amenity types
export type AmenityKey = 'has_food' | 'has_live_music' | 'shows_sports' | 'has_outdoor_seating' | 'has_pool' | 'has_darts' | 'has_board_games' | 'is_speakeasy';

export interface AmenityVote {
  id: string;
  pub_id: string;
  user_id: string;
  amenity: AmenityKey;
  vote: boolean;
  created_at: string;
}

export interface AmenityVoteSummary {
  pub_id: string;
  amenity: AmenityKey;
  total_votes: number;
  yes_votes: number;
  no_votes: number;
}

export const AMENITIES: { key: AmenityKey; label: string; icon: string }[] = [
  { key: 'has_food', label: 'Serves Food', icon: '🍴' },
  { key: 'has_live_music', label: 'Live Music', icon: '🎵' },
  { key: 'shows_sports', label: 'Shows Sports', icon: '⚽' },
  { key: 'has_outdoor_seating', label: 'Outdoor Seating', icon: '🌳' },
  { key: 'has_pool', label: 'Pool Table', icon: '🎱' },
  { key: 'has_darts', label: 'Darts', icon: '🎯' },
  { key: 'has_board_games', label: 'Board Games', icon: '🎲' },
  { key: 'is_speakeasy', label: 'Speakeasy', icon: '🕵️' },
];
