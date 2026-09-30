// Shapes returned by the API (see ../BusinessHub-backend/docs/api/*.md).
import type { Role } from "@/lib/auth";

export type Page<T> = { items: T[]; page: number; pageSize: number; total: number; totalPages: number };

export type Category = { id: string; name: string };

export type Service = {
  id: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  basePrice: string; // "599.00"
  active: boolean;
  category: Category;
};

export type Customer = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  emailVerified: boolean;
  hasAccount: boolean;
  active: boolean;
  createdAt: string;
};

export type Address = {
  id: string;
  customerId: string;
  label: string;
  line1: string;
  area: string;
  city: string;
  pincode: string | null;
};

export type Appliance = {
  id: string;
  customerId: string;
  category: Category;
  brand: string;
  model: string | null;
  serialNumber: string | null;
  purchaseYear: number | null;
  description: string | null;
};

export type StaffUser = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: Role;
  active: boolean;
  hasAccount: boolean;
  createdAt: string;
};

// Customer in a 409 DUPLICATE_PHONE error's details.
export type PhoneMatch = { id: string; name: string; phone: string; email: string | null };
