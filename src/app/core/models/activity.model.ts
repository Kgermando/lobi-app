export interface Participant {
  id: string;
  activity_id: string;
  logo_url: string;
  title: string;
  created_at?: string;
}

export interface Activity {
  id: string;
  title: string;
  resume: string;
  description: string;
  image_url: string;
  images: string[];
  participants: Participant[];
  created_at: string;
  updated_at?: string;
}
