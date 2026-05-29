export interface KYC {
  id?: number;
  status: 'pending' | 'approved' | 'rejected';
  admin_note?: string;
}

export interface User {
  uuid: string;
  email: string;
  fullname: string;
  telephone: string;
  tranche_age: string;
  ville: string;
  pays: string;
  role: 'user' | 'admin' | 'superadmin';
  onboarding_step: number;
  status: boolean;
  risk_profile: 'secure' | 'balanced' | 'growth';
  profile_photo?: string;
  date_naissance?: string;
  kyc?: KYC;
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
}
