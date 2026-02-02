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
  cheapest_non_alcoholic?: number;
  // V2 computed fields
  like_count?: number;
  avg_cream_score?: number;
  cream_rating_count?: number;
}

export interface Drink {
  id: number;
  name: string;
  category: 'beer' | 'cider' | 'non-alcoholic';
}

export interface Price {
  id: string;
  pub_id: string;
  drink_id: number | null;
  drink_ids: number[] | null;
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
  avg_rating: number | null; // Auto-calculated average of all rating fields
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
  // Non-alcoholic drinks (19-26)
  { name: 'Guinness 0.0', category: 'non-alcoholic' },      // 19
  { name: 'Heineken 0.0', category: 'non-alcoholic' },      // 20
  { name: 'Paulaner 0%', category: 'non-alcoholic' },       // 21
  { name: 'Erdinger Alkoholfrei', category: 'non-alcoholic' }, // 22
  { name: 'Bulmers 0.0%', category: 'non-alcoholic' },      // 23
  { name: 'Kopparberg 0.0', category: 'non-alcoholic' },    // 24
  { name: 'Corona 0.0', category: 'non-alcoholic' },        // 25
  { name: 'Peroni 0.0', category: 'non-alcoholic' },        // 26
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

// ============================================
// USER ENGAGEMENT FEATURES
// ============================================

export interface UserPreferences {
  id: string;
  user_id: string;
  favorite_drinks: number[];
  home_latitude: number | null;
  home_longitude: number | null;
  default_radius_km: number;
  email_weekly_digest: boolean;
  email_price_alerts: boolean;
  email_deal_alerts: boolean;
  push_enabled: boolean;
  preferred_vibes: string[];
  created_at: string;
  updated_at: string;
}

export interface CheckIn {
  id: string;
  user_id: string;
  pub_id: string;
  verified_price_id: string | null;
  photo_path: string | null;
  photo_verified: boolean;
  notes: string | null;
  is_verified: boolean;
  verified_at: string | null;
  check_in_latitude: number | null;
  check_in_longitude: number | null;
  location_verified: boolean;
  created_at: string;
  // Joined fields
  pub?: Pub;
  profile?: Profile;
}

export interface PubStreak {
  id: string;
  user_id: string;
  pub_id: string;
  current_streak: number;
  longest_streak: number;
  last_check_in_date: string;
  streak_started_at: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  pub?: Pub;
}

export interface PriceAlert {
  id: string;
  user_id: string;
  drink_id: number | null;
  max_price: number | null;
  latitude: number | null;
  longitude: number | null;
  radius_km: number;
  pub_id: string | null;
  is_active: boolean;
  last_triggered_at: string | null;
  created_at: string;
  // Joined fields
  drink?: Drink;
  pub?: Pub;
}

export interface DealAlert {
  id: string;
  user_id: string;
  price_id: string;
  pub_id: string;
  alert_type: 'new_deal' | 'price_drop' | 'verified_price';
  is_read: boolean;
  is_sent: boolean;
  created_at: string;
  // Joined fields
  price?: Price;
  pub?: Pub;
}

export interface PubCrawl {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  start_latitude: number | null;
  start_longitude: number | null;
  is_public: boolean;
  estimated_duration_mins: number | null;
  total_distance_km: number | null;
  status: 'draft' | 'planned' | 'in_progress' | 'completed';
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  stops?: PubCrawlStop[];
  profile?: Profile;
}

export interface PubCrawlStop {
  id: string;
  crawl_id: string;
  pub_id: string;
  stop_order: number;
  planned_drink_id: number | null;
  estimated_spend: number | null;
  notes: string | null;
  visited: boolean;
  visited_at: string | null;
  actual_spend: number | null;
  created_at: string;
  // Joined fields
  pub?: Pub;
  drink?: Drink;
}

export interface PubVibe {
  id: string;
  pub_id: string;
  user_id: string | null;
  vibe: string;
  vote_count: number;
  created_at: string;
}

export interface VibeOption {
  id: number;
  name: string;
  category: 'atmosphere' | 'crowd' | 'style' | 'occasion';
  icon: string | null;
  is_active: boolean;
}

export interface PubVibeVote {
  id: string;
  pub_id: string;
  user_id: string;
  vibe: string;
  vote: boolean;
  created_at: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_type: string;
  badge_level: number;
  pub_id: string | null;
  earned_at: string;
  expires_at: string | null;
  metadata: Record<string, unknown>;
  // Joined fields
  pub?: Pub;
  badge_info?: BadgeType;
}

export interface BadgeType {
  id: number;
  name: string;
  display_name: string;
  description: string | null;
  icon: string | null;
  category: 'contribution' | 'streak' | 'expertise' | 'special';
  is_active: boolean;
}

export interface PubSimilarity {
  id: string;
  pub_id: string;
  similar_pub_id: string;
  similarity_score: number;
  shared_amenities: string[];
  shared_vibes: string[];
  similar_price_range: boolean;
  similar_ratings: boolean;
  calculated_at: string;
  // Joined fields
  similar_pub?: Pub;
}

// Vibe categories for UI grouping
export const VIBE_CATEGORIES = {
  atmosphere: { label: 'Atmosphere', vibes: ['cozy', 'lively', 'quiet', 'romantic', 'casual', 'upscale'] },
  crowd: { label: 'Crowd', vibes: ['locals', 'tourists', 'students', 'professionals', 'mixed-age', 'young-crowd'] },
  style: { label: 'Style', vibes: ['traditional', 'modern', 'hipster', 'sports-bar', 'cocktail-bar', 'dive-bar'] },
  occasion: { label: 'Good For', vibes: ['first-date', 'catch-up', 'celebration', 'work-drinks', 'solo-drink', 'big-group'] },
} as const;

export const VIBE_ICONS: Record<string, string> = {
  cozy: '🔥', lively: '🎉', quiet: '🤫', romantic: '💕', casual: '😎', upscale: '✨',
  locals: '🏠', tourists: '🧳', students: '📚', professionals: '💼', 'mixed-age': '👥', 'young-crowd': '🎓',
  traditional: '🍀', modern: '🆕', hipster: '🧔', 'sports-bar': '📺', 'cocktail-bar': '🍸', 'dive-bar': '🍺',
  'first-date': '💝', 'catch-up': '☕', celebration: '🎊', 'work-drinks': '🤝', 'solo-drink': '🧘', 'big-group': '👨‍👩‍👧‍👦',
};

export const BADGE_ICONS: Record<string, string> = {
  verified_this_week: '✓',
  local_expert: '🏆',
  pub_regular: '🍺',
  streak_7: '🔥',
  streak_30: '⚡',
  price_hunter: '🎯',
  photo_pro: '📸',
  early_adopter: '🌟',
  crawl_master: '🗺️',
};
