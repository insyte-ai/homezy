// @ts-nocheck - Temporary: disable type checking for initial implementation
import { Property, IProperty } from '../models/Property.model';
import { User } from '../models/User.model';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import type { CreatePropertyInput, UpdatePropertyInput, RoomInput } from '@homezy/shared';

/**
 * Create a new property
 */
export async function createProperty(
  homeownerId: string,
  input: CreatePropertyInput
): Promise<IProperty> {
  // Generate IDs for rooms if not provided
  const rooms = (input.rooms || []).map(room => ({
    ...room,
    id: room.id || uuidv4(),
  }));

  const property = new Property({
    homeownerId,
    name: input.name,
    country: 'UAE',
    emirate: input.emirate,
    neighborhood: input.neighborhood,
    fullAddress: input.fullAddress,
    ownershipType: input.ownershipType,
    propertyType: input.propertyType,
    bedrooms: input.bedrooms,
    bathrooms: input.bathrooms,
    sizeSqFt: input.sizeSqFt,
    yearBuilt: input.yearBuilt,
    rooms,
    isPrimary: input.isPrimary || false,
  });

  await property.save();

  // If this is the first property or marked as primary, update user's primaryPropertyId
  if (input.isPrimary) {
    await User.findByIdAndUpdate(homeownerId, {
      'homeownerProfile.primaryPropertyId': property._id.toString(),
    });
  }

  return property;
}

/**
 * Get a property by ID
 */
export async function getPropertyById(propertyId: string): Promise<IProperty | null> {
  if (!mongoose.Types.ObjectId.isValid(propertyId)) {
    return null;
  }
  return Property.findById(propertyId);
}

/**
 * Get all properties for a homeowner
 */
export async function getHomeownerProperties(
  homeownerId: string,
  options: { limit?: number; offset?: number } = {}
): Promise<{ properties: IProperty[]; total: number }> {
  const [properties, total] = await Promise.all([
    Property.find({ homeownerId })
      .sort({ isPrimary: -1, createdAt: -1 })
      .skip(options.offset || 0)
      .limit(options.limit || 20),
    Property.countDocuments({ homeownerId }),
  ]);

  return { properties, total };
}

/**
 * Get primary property for a homeowner
 */
export async function getPrimaryProperty(homeownerId: string): Promise<IProperty | null> {
  return Property.findOne({ homeownerId, isPrimary: true });
}

/**
 * Update a property
 */
export async function updateProperty(
  propertyId: string,
  homeownerId: string,
  input: UpdatePropertyInput
): Promise<IProperty | null> {
  const property = await Property.findOne({ _id: propertyId, homeownerId });

  if (!property) {
    return null;
  }

  // Update fields
  if (input.name !== undefined) property.name = input.name;
  if (input.emirate !== undefined) property.emirate = input.emirate as any;
  if (input.neighborhood !== undefined) property.neighborhood = input.neighborhood;
  if (input.fullAddress !== undefined) property.fullAddress = input.fullAddress;
  if (input.ownershipType !== undefined) property.ownershipType = input.ownershipType;
  if (input.propertyType !== undefined) property.propertyType = input.propertyType;
  if (input.bedrooms !== undefined) property.bedrooms = input.bedrooms;
  if (input.bathrooms !== undefined) property.bathrooms = input.bathrooms;
  if (input.sizeSqFt !== undefined) property.sizeSqFt = input.sizeSqFt;
  if (input.yearBuilt !== undefined) property.yearBuilt = input.yearBuilt;
  if (input.isPrimary !== undefined) property.isPrimary = input.isPrimary;

  // Handle rooms update if provided
  if (input.rooms !== undefined) {
    property.rooms = input.rooms.map(room => ({
      ...room,
      id: room.id || uuidv4(),
    })) as any;
  }

  await property.save();

  // Update user's primaryPropertyId if this property was set as primary
  if (input.isPrimary) {
    await User.findByIdAndUpdate(homeownerId, {
      'homeownerProfile.primaryPropertyId': property._id.toString(),
    });
  }

  return property;
}

/**
 * Delete a property
 */
export async function deleteProperty(
  propertyId: string,
  homeownerId: string
): Promise<boolean> {
  const result = await Property.deleteOne({ _id: propertyId, homeownerId });

  if (result.deletedCount > 0) {
    // If this was the primary property, clear the user's primaryPropertyId
    const user = await User.findById(homeownerId);
    if (user?.homeownerProfile?.primaryPropertyId === propertyId) {
      // Set another property as primary if one exists
      const anotherProperty = await Property.findOne({ homeownerId });
      if (anotherProperty) {
        anotherProperty.isPrimary = true;
        await anotherProperty.save();
        await User.findByIdAndUpdate(homeownerId, {
          'homeownerProfile.primaryPropertyId': anotherProperty._id.toString(),
        });
      } else {
        await User.findByIdAndUpdate(homeownerId, {
          $unset: { 'homeownerProfile.primaryPropertyId': 1 },
        });
      }
    }
    return true;
  }

  return false;
}

/**
 * Add a room to a property
 */
export async function addRoom(
  propertyId: string,
  homeownerId: string,
  room: RoomInput
): Promise<IProperty | null> {
  const property = await Property.findOne({ _id: propertyId, homeownerId });

  if (!property) {
    return null;
  }

  const newRoom = {
    ...room,
    id: room.id || uuidv4(),
  };

  property.rooms.push(newRoom as any);
  await property.save();

  return property;
}

/**
 * Update a room in a property
 */
export async function updateRoom(
  propertyId: string,
  homeownerId: string,
  roomId: string,
  updates: Partial<RoomInput>
): Promise<IProperty | null> {
  const property = await Property.findOne({ _id: propertyId, homeownerId });

  if (!property) {
    return null;
  }

  const roomIndex = property.rooms.findIndex(r => r.id === roomId);
  if (roomIndex === -1) {
    return null;
  }

  // Update room fields
  const room = property.rooms[roomIndex];
  if (updates.name !== undefined) room.name = updates.name;
  if (updates.type !== undefined) room.type = updates.type;
  if (updates.floor !== undefined) room.floor = updates.floor;
  if (updates.notes !== undefined) room.notes = updates.notes;

  await property.save();

  return property;
}

/**
 * Delete a room from a property
 */
export async function deleteRoom(
  propertyId: string,
  homeownerId: string,
  roomId: string
): Promise<IProperty | null> {
  const property = await Property.findOne({ _id: propertyId, homeownerId });

  if (!property) {
    return null;
  }

  const roomIndex = property.rooms.findIndex(r => r.id === roomId);
  if (roomIndex === -1) {
    return null;
  }

  property.rooms.splice(roomIndex, 1);
  await property.save();

  return property;
}

/**
 * Set a property as primary
 */
export async function setPrimaryProperty(
  propertyId: string,
  homeownerId: string
): Promise<IProperty | null> {
  const property = await Property.findOne({ _id: propertyId, homeownerId });

  if (!property) {
    return null;
  }

  // Unset any existing primary property
  await Property.updateMany(
    { homeownerId, isPrimary: true },
    { $set: { isPrimary: false } }
  );

  // Set this property as primary
  property.isPrimary = true;
  await property.save();

  // Update user's primaryPropertyId
  await User.findByIdAndUpdate(homeownerId, {
    'homeownerProfile.primaryPropertyId': property._id.toString(),
  });

  return property;
}
