import type { Locale } from "../../i18n/config";

export type UserType = "candidate" | "company";

export type UserDto = {
  id: string;
  email: string;
  role: string;
  language?: Locale | null;
  firstName?: string | null;
  lastName?: string | null;
  userType?: UserType | null;
};

export type CompanyDto = {
  id: string;
  name: string;
  defaultLocale?: string | null;
  status?: string | null;
};

export type MeResponseData = {
  user: UserDto;
  company?: CompanyDto | null;
};

export type LoginRequest = {
  email: string;
  password: string;
  rememberUser?: boolean;
  language?: Locale;
  companyId?: string;
  fingerprint?: string;
};

export type LoginResponseData = {
  accessToken: string;
  refreshToken: string;
  fingerprintHash: string;
  userType: UserType;
  user: UserDto;
  company?: CompanyDto | null;
};

export type CurrentResponseData = {
  user: UserDto;
  company?: CompanyDto | null;
};

export type RegisterCandidateRequest = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  language?: Locale;
};

export type RegisterCandidateResponseData = {
  accessToken: string;
  refreshToken: string;
  fingerprintHash: string;
  user: UserDto;
};

export type RegisterCompanyRequest = {
  name: string;
  email: string;
  password: string;
  defaultLocale?: Locale;
  adminLanguage?: Locale;
  fingerprint?: string;
};

export type RegisterCompanyResponseData = {
  accessToken: string;
  refreshToken: string;
  fingerprintHash?: string | null;
  user: UserDto & { position?: string | null };
  company: CompanyDto & { email?: string };
};

export type LogoutResponse = { success: boolean };
