export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR' | 'AUTHOR' | 'MODERATOR' | 'ANALYST' | 'USER';

export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION' | 'DEACTIVATED';

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar?: string | null;
  bio?: string | null;
  website?: string | null;
  github?: string | null;
  linkedin?: string | null;
  role: Role;
  status: UserStatus;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSession {
  id: string;
  userId: string;
  userAgent?: string | null;
  ipAddress?: string | null;
  expiresAt: Date;
  lastUsedAt: Date;
  createdAt: Date;
  revokedAt?: Date | null;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}
