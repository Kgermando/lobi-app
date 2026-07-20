export interface HomeStats {
  total_members: number;
  total_invested: number;
  active_projects: number;
  total_returns: number;
  active_investors: number;
}

export interface HomeActivity {
  user_display: string;
  action: string;
  amount: number;
  currency: string;
  type: string;
  created_at: string;
}

export interface HomeNetwork {
  id: number;
  name: string;
  description: string;
  type: 'secure' | 'local_projects' | 'entrepreneurship';
  interest_rate: number;
  min_amount: number;
  max_amount: number;
  target_amount: number;
  image_url: string;
  active: boolean;
  total_funds: number;
  investors: number;
  duration: string;
  badge: string;
}

export interface HomeWebinar {
  id: number;
  title: string;
  description: string;
  speaker: string;
  image_url: string;
  scheduled_at: string;
  duration: number;
  tags: string;
  is_live: boolean;
  register_url: string;
  location: string;
  event_type: string;   // webinar | forum | atelier | summit
  max_spots: number;
  available_spots: number;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  initials: string;
  text: string;
  rating: number;
  color: string;
  gain: string;
  active: boolean;
  sort_order: number;
}
