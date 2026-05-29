export type TxType = 'deposit' | 'withdrawal' | 'transfer' | 'interest' | 'investment';
export type TxStatus = 'pending' | 'completed' | 'failed';
export type PayMethod = 'orange_money' | 'airtel_money' | 'mpesa' | 'visa' | 'mastercard' | 'internal';

export interface Transaction {
  id: number;
  reference: string;
  user_uuid: string;
  type: TxType;
  amount: number;
  currency: string;
  status: TxStatus;
  pay_method?: PayMethod;
  phone_or_card?: string;
  description: string;
  balance_before: number;
  balance_after: number;
  created_at: string;
}

export interface Pagination {
  total_records: number;
  total_pages: number;
  current_page: number;
  page_size: number;
}
