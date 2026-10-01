import { Category, Tag, Technology, Series } from './taxonomy';
import { User } from './user';

export type ArticleStatus = 'DRAFT' | 'IN_REVIEW' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED';

export type DifficultyLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';

export type ArticleType = 
  | 'TUTORIAL'
  | 'SYSTEM_DESIGN'
  | 'DEEP_DIVE'
  | 'CASE_STUDY'
  | 'BENCHMARK'
  | 'GUIDE'
  | 'HOW_TO'
  | 'COMPARISON'
  | 'REFERENCE'
  | 'OPINION';

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string; // MDX content
  coverImage?: string | null;
  thumbnail?: string | null;
  ogImage?: string | null;
  
  status: ArticleStatus;
  difficulty: DifficultyLevel;
  type: ArticleType;
  featured: boolean;
  readingTime: number; // in minutes
  
  authorId: string;
  author?: User;
  
  categoryId: string;
  category?: Category;
  
  tagIds: string[];
  tags?: Tag[];
  
  technologyIds: string[];
  technologies?: Technology[];
  
  seriesId?: string | null;
  series?: Series | null;
  seriesOrder?: number | null;
  
  prerequisites?: string[];
  keyTakeaways?: string[];
  references?: string[];
  
  seoTitle?: string | null;
  seoDescription?: string | null;
  canonicalUrl?: string | null;
  noIndex?: boolean;
  
  viewsCount: number;
  likesCount: number;
  bookmarksCount: number;
  commentsCount: number;
  
  publishedAt?: Date | null;
  scheduledAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
