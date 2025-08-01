export type User = {
  email: string;
  password: string;
};
export type Notes = {
  id: number;
  lat: number;
  lon: number;
  message?: string;
  created_at: string;
};