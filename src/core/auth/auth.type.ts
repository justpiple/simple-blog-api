export interface AuthUser {
  id: string;
  username: string;
  email: string;
  createdAt: Date;
  updatedAt: Date | null;
}
