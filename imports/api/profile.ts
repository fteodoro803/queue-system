export interface Profile {
  _id?: string;
  name: string;
  email?: string;
  number?: string;

  avatar?: string;
  createdAt: Date;
}