export interface PromptHistory {
  id: string;
  userId: string;
  templateId?: string;
  title?: string;
  inputVariables?: Record<string, string>;
  finalPrompt: string;
  resultText?: string;
  aiModel: string;
  likeCount?: number;
  isDeleted?: boolean;
  createdAt?: string;
}
