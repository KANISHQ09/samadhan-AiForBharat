import { IssueStatus } from "./IssueStatus";
import { IssueCategory } from "./IssueCategory";

export interface Issue {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: IssueCategory | string;
  location: string;
  status: IssueStatus;
  imageUrls: string[];
  supportsCount: number;
  masterIssueId?: string | null;
  createdAt: Date;
}
