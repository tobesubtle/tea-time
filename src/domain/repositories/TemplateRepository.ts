import { Template } from '../entities/Template';

export interface TemplateRepository {
  getTemplates(category?: string, search?: string): Promise<Template[]>;
  getTemplateById(id: string): Promise<Template | null>;
  createTemplate(data: Omit<Template, 'id' | 'createdAt'>): Promise<Template>;
  updateTemplate(id: string, data: Partial<Template>): Promise<Template>;
  deleteTemplate(id: string): Promise<void>;
}
