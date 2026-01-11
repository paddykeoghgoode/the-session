export interface Pub {
  id: string;
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
  total_contributions: number;
  created_at: string;
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

// Constants
export const DRINKS: Omit<Drink, 'id'>[] = [
  { name: 'Guinness', category: 'beer' },
  { name: 'Heineken', category: 'beer' },
  { name: 'Coors Light', category: 'beer' },
  { name: 'Rockshore Lager', category: 'beer' },
  { name: 'Bulmers', category: 'cider' },
  { name: 'Orchard Thieves', category: 'cider' },
  { name: 'Rockshore Cider', category: 'cider' },
];

export const RATING_CATEGORIES = [
  { key: 'pint_quality', label: 'Pint Quality', description: 'How good is the pour?' },
  { key: 'ambience', label: 'Ambience', description: 'Atmosphere and decor' },
  { key: 'food_quality', label: 'Food Quality', description: 'If they serve food' },
  { key: 'staff_friendliness', label: 'Staff', description: 'Service and friendliness' },
  { key: 'safety', label: 'Safety', description: 'How safe do you feel?' },
  { key: 'value_for_money', label: 'Value', description: 'Bang for your buck' },
] as const;
