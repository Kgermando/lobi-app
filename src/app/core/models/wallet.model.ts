export interface Wallet {
  id: number;
  user_uuid: string;
  balance: number;
  total_saved: number;
  total_interest?: number;
  currency: string;
  saving_goal?: number;
  saving_goal_name?: string;
  created_at: string;
}

export interface RecurringPayment {
  id: number;
  user_uuid: string;
  amount: number;
  frequency: string;
  pay_method: string;
  phone_or_card: string;
  active: boolean;
  next_run_at: string;
}

export interface DepositInput {
  amount: number;
  pay_method: string;
  phone_or_card: string;
  description?: string;
}
