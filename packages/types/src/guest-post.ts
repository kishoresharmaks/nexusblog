import { DifficultyLevel, ArticleType } from './article';
import { User } from './user';
import { Category, Tag, Technology } from './taxonomy';

export type GuestPostStatus = 
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'CHANGES_REQUESTED'
  | 'APPROVED'
  | 'SCHEDULED'
  | 'PUBLISHED'
  | 'REJECTED';

export interface GuestPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string; // MDX content
  coverImage?: string | null;
  
  status: GuestPostStatus;
  difficulty: DifficultyLevel;
  type: ArticleType;
  
  authorId: string;
  author?: User;
  
  authorBio?: string | null;
  authorAvatar?: string | null;
  socialLinks?: Record<string, string>;
  
  categoryId: string;
  category?: Category;
  
  tagIds: string[];
  tags?: Tag[];
  
  technologyIds: string[];
  technologies?: Technology[];
  
  references?: string[];
  seoTitle?: string | null;
  seoDescription?: string | null;
  
  editorialFeedback?: string | null;
  reviewedById?: string | null;
  reviewedBy?: User | null;
  reviewedAt?: Date | null;
  
  submittedAt?: Date | null;
  publishedArticleId?: string | null;
  
  createdAt: Date;
  updatedAt: Date;
}
