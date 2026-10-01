export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  order: number;
  articleCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  articleCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Technology {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  logo?: string | null;
  officialUrl?: string | null;
  docsUrl?: string | null;
  articleCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Series {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  coverImage?: string | null;
  articleCount?: number;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}
