import express from 'express';
import {
  getAllServices,
  getAllSubservices,
  searchServices,
  getServiceBySlug,
  getServicesByCategory,
} from '../controllers/service.controller';

const router = express.Router();

/**
 * @route   GET /api/v1/services
 * @desc    Get all service groups
 * @access  Public
 */
router.get('/', getAllServices);

/**
 * @route   GET /api/v1/services/subservices
 * @desc    Get all subservices (flattened)
 * @access  Public
 */
router.get('/subservices', getAllSubservices);

/**
 * @route   GET /api/v1/services/search
 * @desc    Search services by query
 * @access  Public
 */
router.get('/search', searchServices);

/**
 * @route   GET /api/v1/services/slug/:slug
 * @desc    Get service by slug
 * @access  Public
 */
router.get('/slug/:slug', getServiceBySlug);

/**
 * @route   GET /api/v1/services/category/:categoryId
 * @desc    Get services by category
 * @access  Public
 */
router.get('/category/:categoryId', getServicesByCategory);

export default router;
