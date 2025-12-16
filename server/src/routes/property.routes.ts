import express from 'express';
import {
  createProperty,
  getMyProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  addRoom,
  updateRoom,
  deleteRoom,
  setPrimaryProperty,
} from '../controllers/property.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createPropertySchema,
  updatePropertySchema,
  getPropertyByIdSchema,
  deletePropertySchema,
  listPropertiesSchema,
  addRoomSchema,
  updateRoomSchema,
  setPrimaryPropertySchema,
  propertyIdParamSchema,
  roomIdParamSchema,
} from '../schemas/property.schema';

const router = express.Router();

// All routes require authentication and homeowner role
router.use(authenticate);
router.use(authorize('homeowner'));

/**
 * Property CRUD Routes
 */

// Create property
router.post(
  '/',
  validate(createPropertySchema),
  createProperty
);

// Get all properties for the authenticated user
router.get(
  '/',
  validate(listPropertiesSchema, 'query'),
  getMyProperties
);

// Get property by ID
router.get(
  '/:id',
  validate(getPropertyByIdSchema, 'params'),
  getPropertyById
);

// Update property
router.patch(
  '/:id',
  validate(propertyIdParamSchema, 'params'),
  validate(updatePropertySchema),
  updateProperty
);

// Delete property
router.delete(
  '/:id',
  validate(deletePropertySchema, 'params'),
  deleteProperty
);

/**
 * Room Management Routes
 */

// Add room to property
router.post(
  '/:id/rooms',
  validate(propertyIdParamSchema, 'params'),
  validate(addRoomSchema),
  addRoom
);

// Update room in property
router.patch(
  '/:id/rooms/:roomId',
  validate(roomIdParamSchema, 'params'),
  validate(updateRoomSchema),
  updateRoom
);

// Delete room from property
router.delete(
  '/:id/rooms/:roomId',
  validate(roomIdParamSchema, 'params'),
  deleteRoom
);

/**
 * Property Actions
 */

// Set property as primary
router.post(
  '/:id/set-primary',
  validate(setPrimaryPropertySchema, 'params'),
  setPrimaryProperty
);

export default router;
