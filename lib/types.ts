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

export type WorkingDay = { dayOfWeek: number; startTime: string; endTime: string; isOff: boolean };

export type Technician = {
  id: string;
  userId: string;
  name: string;
  email: string | null;
  phone: string;
  status: "ACTIVE" | "INACTIVE";
  skills: Category[];
  areas: string[];
  workingHours: WorkingDay[];
};

export type TimeOffReason = "SICK" | "LEAVE" | "OTHER";
export type TimeOff = { id: string; startAt: string; endAt: string; reason: TimeOffReason; note: string | null };

export type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "ASSIGNED"
  | "EN_ROUTE"
  | "ARRIVED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

export type Booking = {
  id: string;
  bookingNumber: string;
  status: BookingStatus;
  source: "ONLINE" | "PHONE" | "WHATSAPP" | "WALK_IN";
  startAt: string;
  endAt: string;
  problemDescription: string;
  rescheduleCount: number;
  needsReassignment: boolean;
  createdByUserId: string;
  createdAt: string;
  customer: { id: string; name: string; phone: string | null; email: string | null };
  service: { id: string; name: string; durationMinutes: number; basePrice: string };
  appliance: { id: string; brand: string; model: string | null; category: Category };
  address: { id: string; label: string; line1: string; area: string; city: string; pincode: string | null };
  technician: { id: string; name: string } | null;
};

export type BookingDetail = Booking & {
  history: {
    fromStatus: BookingStatus | null;
    toStatus: BookingStatus;
    note: string | null;
    createdAt: string;
    changedBy?: { name: string; role: Role }; // staff only
  }[];
};

// One bookable start time. Staff also get who is free.
export type SlotOption = { startAt: string; endAt: string; technicians?: { id: string; name: string }[] };
export type Availability = { date: string; timezone: string; durationMinutes: number; slots: SlotOption[] };
