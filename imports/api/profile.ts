export interface Profile {
  _id: string;
  name: string;
  email?: string | null;
  number?: string | null;
  avatar?: string | null;
  createdAt: Date;
}
