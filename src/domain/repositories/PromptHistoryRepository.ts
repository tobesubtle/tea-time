import { PromptHistory } from '../entities/PromptHistory';

export interface PromptHistoryRepository {
  createPromptHistory(data: Omit<PromptHistory, 'id' | 'createdAt'>): Promise<PromptHistory>;
  getPromptHistoryById(id: string): Promise<PromptHistory | null>;
  updatePromptHistory(id: string, data: Partial<PromptHistory>): Promise<PromptHistory>;
  deletePromptHistory(id: string): Promise<void>;
  getRecentHistoryByTemplateId(templateId: string, userId: string): Promise<PromptHistory[]>;
  getUserPromptHistories(userId?: string, templateId?: string, search?: string): Promise<PromptHistory[]>;
  getDeletedPromptHistories(userId?: string, templateId?: string, search?: string): Promise<PromptHistory[]>;
  hardDeletePromptHistories(ids: string[]): Promise<void>;
}
