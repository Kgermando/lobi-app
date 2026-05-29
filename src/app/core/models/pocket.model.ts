export type PocketType = 'secure' | 'local_projects' | 'entrepreneurship';

export interface InvestmentNetwork {
  id: number;
  name: string;
  description: string;
  type: PocketType;
  interest_rate: number;
  min_amount: number;
  max_amount: number;
  image_url?: string;
  active: boolean;
  total_funds?: number;
  investors?: number;
}

export interface UserPocket {
  id: number;
  user_uuid: string;
  investment_network_id: number;
  network: InvestmentNetwork;
  amount_invested: number;
  current_value?: number;
  interest_earned?: number;
  status: string;
  maturity_date?: string;
  created_at: string;
}

export interface Notification {
  id: number;
  user_uuid: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  link?: string;
  created_at: string;
}

export interface Webinar {
  id: number;
  title: string;
  description: string;
  speaker: string;
  image_url: string;
  video_url: string;
  scheduled_at: string;
  duration: number;
  tags: string;
  is_live: boolean;
  register_url: string;
}

export interface Resource {
  id: number;
  title: string;
  description: string;
  category: string;
  content_url: string;
  image_url: string;
  read_time: number;
}
