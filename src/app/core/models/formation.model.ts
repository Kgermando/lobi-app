export interface Mentor {
  id: string;
  name: string;
  image_url: string;
  description: string;
  followed?: boolean;
  created_at?: string;
}

export interface Motivation {
  id: string;
  citation: string;
  mentor_id: string;
  mentor?: Mentor;
  created_at: string;
  updated_at?: string;
}

export interface Formation {
  id: string;
  title: string;
  description: string;
  image_url: string;
  video_url: string;
  status: 'public' | 'private';
  category: string;
  mentor_id: string;
  mentor?: Mentor;
  created_at: string;
  updated_at?: string;
}
