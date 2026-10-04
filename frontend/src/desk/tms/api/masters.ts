import type { DeskGridRow } from '../ui';
import { resource, type ResourceApi } from './resource';

// ── Vehicles ─────────────────────────────────────────────────────────────────
export interface Vehicle extends DeskGridRow {
  id: string | number;
  registrationNumber: string;
  make?: string | null;
  model?: string | null;
  vehicleTypeId?: string | number | null;
  vehicleType?: { id: string | number; name: string } | null;
  ownershipType?: string | null;
  year?: number | null;
  capacityWeight?: number | null;
  targetKmPerL?: number | null;
  chassisNumber?: string | null;
  engineNumber?: string | null;
  gpsDeviceId?: string | null;
  fastagId?: string | null;
  status?: string | null;
  rcExpiry?: string | null;
  fitnessExpiry?: string | null;
  insuranceExpiry?: string | null;
  pucExpiry?: string | null;
  permitExpiry?: string | null;
  roadTaxExpiry?: string | null;
}

export interface VehicleSave {
  registrationNumber: string;
  vehicleTypeId?: string | number | null;
  make?: string | null;
  model?: string | null;
  ownershipType?: string | null;
  year?: number | null;
  capacityWeight?: number | null;
  targetKmPerL?: number | null;
  chassisNumber?: string | null;
  engineNumber?: string | null;
  gpsDeviceId?: string | null;
  fastagId?: string | null;
  status?: string | null;
  rcExpiry?: string | null;
  fitnessExpiry?: string | null;
  insuranceExpiry?: string | null;
  pucExpiry?: string | null;
  permitExpiry?: string | null;
  roadTaxExpiry?: string | null;
}

export const vehiclesApi: ResourceApi<Vehicle, VehicleSave> = resource<Vehicle, VehicleSave>('/vehicles');

// ── Vehicle Types ──────────────────────────────────────────────────────────────
export interface VehicleType extends DeskGridRow {
  id: string | number;
  name: string;
  code?: string | null;
  capacityTons?: number | null;
  volumeCuFt?: number | null;
  axleCount?: number | null;
  fuelType?: string | null;
  status?: string | null;
  description?: string | null;
}

export const vehicleTypesApi: ResourceApi<VehicleType, Partial<VehicleType>> = resource<VehicleType, Partial<VehicleType>>('/vehicle-types');

// ── Parties / Customers ────────────────────────────────────────────────────────
export interface Party extends DeskGridRow {
  id: string | number;
  name: string;
  code?: string | null;
  type?: string | null;
  gstin?: string | null;
  pan?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  addressLine1?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  creditLimit?: number | null;
  creditDays?: number | null;
  status?: string | null;
}

export const partiesApi: ResourceApi<Party, Partial<Party>> = resource<Party, Partial<Party>>('/customers');

// ── Drivers ───────────────────────────────────────────────────────────────────
export interface Driver extends DeskGridRow {
  id: string | number;
  firstName?: string | null;
  lastName?: string | null;
  name?: string | null;
  phone?: string | null;
  licenseNumber?: string | null;
  licenseCategory?: string | null;
  licenseExpiry?: string | null;
  experience?: number | null;
  status?: string | null;
}

export const driversApi: ResourceApi<Driver, Partial<Driver>> = resource<Driver, Partial<Driver>>('/drivers');

// ── Routes ────────────────────────────────────────────────────────────────────
export interface Route extends DeskGridRow {
  id: string | number;
  name: string;
  code?: string | null;
  originCity: string;
  originState?: string | null;
  destinationCity: string;
  destinationState?: string | null;
  distanceKm?: number | null;
  estimatedHours?: number | null;
  status?: string | null;
}

export const routesApi: ResourceApi<Route, Partial<Route>> = resource<Route, Partial<Route>>('/routes');

// ── Carriers ──────────────────────────────────────────────────────────────────
export interface Carrier extends DeskGridRow {
  id: string | number;
  name: string;
  code?: string | null;
  phone?: string | null;
  email?: string | null;
  pan?: string | null;
  gstin?: string | null;
  rating?: number | null;
  status?: string | null;
}

export const carriersApi: ResourceApi<Carrier, Partial<Carrier>> = resource<Carrier, Partial<Carrier>>('/carriers');
