export type UserDto = {
  id: string;
  email: string;
  role: string;
  language?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  userType?: string | null;
};
