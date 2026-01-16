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
  email: string | null;
  facebook: string | null;
  instagram: string | null;
  twitter: string | null;
  // Original amenities
  has_food: boolean;
  has_outdoor_seating: boolean;
  shows_sports: boolean;
  has_live_music: boolean;
  has_pool: boolean;
  has_darts: boolean;
  has_board_games: boolean;
  is_speakeasy: boolean;
  // V2 amenities
  has_beer_garden: boolean;
  is_dog_friendly: boolean;
  is_late_bar: boolean;
  is_wheelchair_accessible: boolean;
  has_traditional_music: boolean;
  has_quiz_night: boolean;
  has_snug: boolean;
  is_craft_beer_focused: boolean;
  // Payment options
  is_cash_only: boolean;
  is_card_only: boolean;
  // Status
  is_permanently_closed: boolean;
  is_active: boolean;
  moderation_status: 'active' | 'temporarily_closed' | 'renovating' | 'members_only' | 'permanently_closed';
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
  // V2 computed fields
  like_count?: number;
  avg_cream_score?: number;
  cream_rating_count?: number;
}

export interface Drink {
  id: number;
  name: string;
  category: 'beer' | 'cider';
}

export interface Price {
  id: string;
  pub_id: string;
  drink_id: number | null;
  price: number;
  is_deal: boolean;
  deal_description: string | null;
  deal_type: 'drink_only' | 'food_combo' | 'food_only';
  deal_title: string | null;
  food_item: string | null;
  deal_start_date: string | null;
  deal_end_date: string | null;
  deal_schedule: string | null;
  // V2 deal fields
  deal_discount_type: 'fixed' | 'percentage' | 'bundle' | 'happy_hour' | null;
  deal_discount_value: number | null;
  deal_target: 'all_pints' | 'all_drinks' | 'specific' | null;
  is_promoted: boolean;
  promoted_until: string | null;
  // Verification
  verification_count: number;
  last_verified_at: string | null;
  confidence_level: 'low' | 'medium' | 'high';
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

// V2 Amenities
export type AmenityKeyV2 = AmenityKey | 'has_beer_garden' | 'is_dog_friendly' | 'is_late_bar' | 'is_wheelchair_accessible' | 'has_traditional_music' | 'has_quiz_night' | 'has_snug' | 'is_craft_beer_focused' | 'is_cash_only' | 'is_card_only';

export const AMENITIES_V2: { key: AmenityKeyV2; label: string; icon: string; category: 'feature' | 'payment' }[] = [
  // Original features
  { key: 'has_food', label: 'Serves Food', icon: '🍴', category: 'feature' },
  { key: 'has_live_music', label: 'Live Music', icon: '🎵', category: 'feature' },
  { key: 'shows_sports', label: 'Shows Sports', icon: '⚽', category: 'feature' },
  { key: 'has_outdoor_seating', label: 'Outdoor Seating', icon: '🌳', category: 'feature' },
  { key: 'has_pool', label: 'Pool Table', icon: '🎱', category: 'feature' },
  { key: 'has_darts', label: 'Darts', icon: '🎯', category: 'feature' },
  { key: 'has_board_games', label: 'Board Games', icon: '🎲', category: 'feature' },
  { key: 'is_speakeasy', label: 'Speakeasy', icon: '🕵️', category: 'feature' },
  // V2 features
  { key: 'has_beer_garden', label: 'Beer Garden', icon: '🌻', category: 'feature' },
  { key: 'is_dog_friendly', label: 'Dog Friendly', icon: '🐕', category: 'feature' },
  { key: 'is_late_bar', label: 'Late Bar', icon: '🌙', category: 'feature' },
  { key: 'is_wheelchair_accessible', label: 'Wheelchair Accessible', icon: '♿', category: 'feature' },
  { key: 'has_traditional_music', label: 'Trad Music', icon: '🎻', category: 'feature' },
  { key: 'has_quiz_night', label: 'Quiz Night', icon: '❓', category: 'feature' },
  { key: 'has_snug', label: 'Has Snug', icon: '🛋️', category: 'feature' },
  { key: 'is_craft_beer_focused', label: 'Craft Beer', icon: '🍻', category: 'feature' },
  // Payment
  { key: 'is_cash_only', label: 'Cash Only', icon: '💵', category: 'payment' },
  { key: 'is_card_only', label: 'Card Only', icon: '💳', category: 'payment' },
];

// V2 Types
export interface CreamRating {
  id: string;
  pub_id: string;
  user_id: string;
  creaminess: number;
  temperature: number;
  stick: number;
  comment: string | null;
  created_at: string;
}

export interface PriceVerification {
  id: string;
  price_id: string;
  user_id: string;
  is_accurate: boolean;
  new_price: number | null;
  created_at: string;
}

export interface Report {
  id: string;
  entity_type: 'pub' | 'price' | 'deal' | 'review';
  entity_id: string;
  user_id: string | null;
  report_type: 'price_wrong' | 'deal_expired' | 'pub_closed' | 'inappropriate' | 'other';
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
}

export interface PubEvent {
  id: string;
  pub_id: string;
  title: string;
  event_type: 'trad_session' | 'quiz' | 'live_music' | 'match_day' | 'other';
  description: string | null;
  start_time: string | null;
  end_time: string | null;
  day_of_week: string[];
  specific_date: string | null;
  is_recurring: boolean;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface PubMenu {
  id: string;
  pub_id: string;
  storage_path: string;
  original_filename: string | null;
  uploaded_by: string | null;
  is_approved: boolean;
  created_at: string;
}

export interface StoutIndex {
  current_avg: number;
  last_week_avg: number | null;
  last_month_avg: number | null;
  sample_size: number;
  change_from_last_week: number | null;
  change_from_last_month: number | null;
}

export interface ContributorStats {
  user_id: string;
  username: string | null;
  display_name: string | null;
  prices_this_month: number;
  verifications_this_month: number;
  reviews_this_month: number;
  photos_this_month: number;
  total_contributions: number;
}
