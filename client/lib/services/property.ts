import { api } from '../api';
import type {
  Property,
  Room,
  OwnershipType,
  PropertyType,
  RoomType,
} from '@homezy/shared';
import type { EmirateId } from '@homezy/shared';

// Re-export types for convenience
export type { Property, Room, OwnershipType, PropertyType, RoomType };

// ============================================================================
// Input Types
// ============================================================================

export interface CreatePropertyInput {
  name: string;
  emirate: EmirateId;
  neighborhood?: string;
  fullAddress?: string;
  ownershipType: OwnershipType;
  propertyType: PropertyType;
  bedrooms?: number;
  bathrooms?: number;
  sizeSqFt?: number;
  yearBuilt?: number;
  rooms?: Omit<Room, 'id'>[];
  isPrimary?: boolean;
}

export interface UpdatePropertyInput {
  name?: string;
  emirate?: EmirateId;
  neighborhood?: string;
  fullAddress?: string;
  ownershipType?: OwnershipType;
  propertyType?: PropertyType;
  bedrooms?: number;
  bathrooms?: number;
  sizeSqFt?: number;
  yearBuilt?: number;
  rooms?: Room[];
  isPrimary?: boolean;
}

export interface RoomInput {
  name: string;
  type: RoomType;
  floor?: number;
  notes?: string;
}

export interface PropertyListParams {
  limit?: number;
  offset?: number;
}

// ============================================================================
// API Response Types
// ============================================================================

interface PropertyResponse {
  success: boolean;
  data: {
    property: Property;
  };
}

interface PropertiesListResponse {
  success: boolean;
  data: {
    properties: Property[];
    total: number;
    limit: number;
    offset: number;
  };
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Create a new property
 */
export async function createProperty(input: CreatePropertyInput): Promise<Property> {
  const response = await api.post<PropertyResponse>('/properties', input);
  return response.data.data.property;
}

/**
 * Get all properties for the authenticated user
 */
export async function getMyProperties(params?: PropertyListParams): Promise<{
  properties: Property[];
  total: number;
}> {
  const response = await api.get<PropertiesListResponse>('/properties', { params });
  return {
    properties: response.data.data.properties,
    total: response.data.data.total,
  };
}

/**
 * Get a property by ID
 */
export async function getPropertyById(propertyId: string): Promise<Property> {
  const response = await api.get<PropertyResponse>(`/properties/${propertyId}`);
  return response.data.data.property;
}

/**
 * Update a property
 */
export async function updateProperty(
  propertyId: string,
  input: UpdatePropertyInput
): Promise<Property> {
  const response = await api.patch<PropertyResponse>(`/properties/${propertyId}`, input);
  return response.data.data.property;
}

/**
 * Delete a property
 */
export async function deleteProperty(propertyId: string): Promise<void> {
  await api.delete(`/properties/${propertyId}`);
}

/**
 * Add a room to a property
 */
export async function addRoom(propertyId: string, room: RoomInput): Promise<Property> {
  const response = await api.post<PropertyResponse>(`/properties/${propertyId}/rooms`, room);
  return response.data.data.property;
}

/**
 * Update a room in a property
 */
export async function updateRoom(
  propertyId: string,
  roomId: string,
  updates: Partial<RoomInput>
): Promise<Property> {
  const response = await api.patch<PropertyResponse>(
    `/properties/${propertyId}/rooms/${roomId}`,
    updates
  );
  return response.data.data.property;
}

/**
 * Delete a room from a property
 */
export async function deleteRoom(propertyId: string, roomId: string): Promise<Property> {
  const response = await api.delete<PropertyResponse>(
    `/properties/${propertyId}/rooms/${roomId}`
  );
  return response.data.data.property;
}

/**
 * Set a property as primary
 */
export async function setPrimaryProperty(propertyId: string): Promise<Property> {
  const response = await api.post<PropertyResponse>(`/properties/${propertyId}/set-primary`);
  return response.data.data.property;
}
