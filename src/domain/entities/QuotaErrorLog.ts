export interface QuotaErrorLog {
  id: string;
  userEmail?: string;
  modelName: string;
  errorMessage: string;
  status: 'pending' | 'notified' | 'resolved';
  createdAt: string;
}
