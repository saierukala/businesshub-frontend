import { AirVent, Building, Droplets, House, MapPin, Microwave, Package, Refrigerator, Tv, WashingMachine, type LucideIcon } from "lucide-react";

// A picture per appliance type; anything new (an owner-added type) gets a plain box.
const APPLIANCE_ICONS: Record<string, LucideIcon> = {
  "Washing Machine": WashingMachine,
  Refrigerator: Refrigerator,
  "Air Conditioner": AirVent,
  Microwave: Microwave,
  TV: Tv,
  "Water Purifier": Droplets,
};

export const applianceIcon = (categoryName: string): LucideIcon => APPLIANCE_ICONS[categoryName] ?? Package;

// Home -> house, Work/Office -> building, anything else -> pin.
export const addressIcon = (label: string): LucideIcon => (/^home$/i.test(label) ? House : /work|office/i.test(label) ? Building : MapPin);
