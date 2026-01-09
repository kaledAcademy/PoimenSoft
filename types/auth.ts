import { UserRole } from "@prisma/client";

export interface User {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  isActive: boolean;
  emailVerified?: Date;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
  profile?: Profile;
}

export interface Profile {
  id: string;
  userId: string;
  userType: UserType;

  // Datos comunes
  email: string;
  phone: string;
  address: string;
  city: string;
  department: string;

  // Datos persona natural
  fullName?: string;
  documentType?: DocumentType;
  documentNumber?: string;
  taxRegime?: TaxRegime;
  rutNumber?: string;

  // Datos persona jurídica
  companyName?: string;
  nit?: string;
  companyTaxRegime?: CompanyTaxRegime;
  legalRepresentativeName?: string;
  legalRepresentativeDocument?: string;

  createdAt: Date;
  updatedAt: Date;
}

// UserRole importado desde Prisma para mantener consistencia
// Los roles reales del sistema son: USST, USPR, USPL, ASIN, ASEX, ADM1, ADM2, CEO1, CEO2, CEO3, CEOM
export type { UserRole } from "@prisma/client";

export enum UserType {
  NATURAL = "NATURAL",
  JURIDICA = "JURIDICA",
}

export enum DocumentType {
  CEDULA_CIUDADANIA = "CEDULA_CIUDADANIA",
  CEDULA_EXTRANJERIA = "CEDULA_EXTRANJERIA",
  PASAPORTE = "PASAPORTE",
  NIT = "NIT",
}

export enum TaxRegime {
  SIMPLIFICADO = "SIMPLIFICADO",
  COMUN = "COMUN",
}

export enum CompanyTaxRegime {
  RESPONSABLE_IVA = "RESPONSABLE_IVA",
  NO_RESPONSABLE_IVA = "NO_RESPONSABLE_IVA",
  GRAN_CONTRIBUYENTE = "GRAN_CONTRIBUYENTE",
}

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  customId?: string;
  profilePhoto?: string;
  image?: string;
  profile?: Profile;
  // Campos de control de acceso
  hasCompletedPurchase?: boolean;
  purchaseDate?: Date;
  membershipId?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  confirmPassword: string;
  userType?: UserType; // Opcional para registro rápido
  // Datos persona natural
  fullName?: string;
  documentType?: DocumentType;
  documentNumber?: string;
  taxRegime?: TaxRegime;
  rutNumber?: string;
  // Datos persona jurídica
  companyName?: string;
  nit?: string;
  companyTaxRegime?: CompanyTaxRegime;
  legalRepresentativeName?: string;
  legalRepresentativeDocument?: string;
  // Datos comunes
  phone: string;
  address?: string; // Opcional para registro rápido
  city?: string; // Opcional para registro rápido
  department?: string; // Opcional para registro rápido
  // Consentimientos legales (Ley 1581/2012)
  acceptDataPolicy: boolean;
  acceptTerms: boolean;
  acceptMarketing?: boolean;
}

export interface AuthResponse {
  user: AuthUser;
  session: any;
  error?: string;
}
