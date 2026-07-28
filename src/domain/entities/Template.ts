export interface Template {
  id: string;
  title: string;
  content: string;
  aiModel: string;
  category: string;
  description?: string;
  createdBy?: string;
  createdAt?: string;
}
