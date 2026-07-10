import { Mentor } from './formation.model';

export type UserRole = 'apprenant' | 'mentor' | 'admin' | 'partenaire' | 'superadmin' | 'user';

export interface KYC {
  id?: number;
  status: 'pending' | 'approved' | 'rejected';
  admin_note?: string;
}

export interface Parcours {
  id: string;
  user_uuid: string;
  diplome: string;
  etablissement: string;
  filiere?: string;
  niveau?: string;
  annee_debut?: number;
  annee_fin?: number;
  mention?: string;
  pays?: string;
  en_cours: boolean;
  document_url?: string;
  created_at?: string;
}

export interface User {
  uuid: string;
  email: string;
  fullname: string;
  telephone: string;
  tranche_age: string;
  ville: string;
  pays: string;
  role: UserRole;
  onboarding_step: number;
  status: boolean;
  risk_profile: 'secure' | 'balanced' | 'growth';
  profile_photo?: string;
  date_naissance?: string;
  kyc?: KYC;
  mentors?: Mentor[];
  parcours?: Parcours[];
  created_at: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user_uuid: string;
  role: string;
  onboarding_step: number;
}

export interface RegisterStep1 {
  email: string;
  password: string;
  password_confirm: string;
}

export interface RegisterStep2 {
  user_uuid: string;
  fullname: string;
  telephone: string;
  tranche_age: string;
  ville: string;
  pays: string;
  date_naissance?: string;
  nom_universite?: string;
  type_projet?: string;
}

export const ROLE_LABELS: Record<string, string> = {
  apprenant: 'Apprenant',
  mentor: 'Mentor',
  admin: 'Admin',
  partenaire: 'Partenaire',
  superadmin: 'Admin',
  user: 'Apprenant',
};
