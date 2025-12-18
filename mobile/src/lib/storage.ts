/**
 * Storage utilities for Homezy mobile app
 * Uses AsyncStorage for general data and SecureStore for sensitive data
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { STORAGE_KEYS } from '../constants/config';

/**
 * Secure storage for sensitive data (tokens)
 */
export const secureStorage = {
  async setItem(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error('SecureStore setItem error:', error);
      throw error;
    }
  },

  async getItem(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error('SecureStore getItem error:', error);
      return null;
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('SecureStore removeItem error:', error);
    }
  },
};

/**
 * Token storage helpers
 */
export const tokenStorage = {
  async setTokens(accessToken: string, refreshToken?: string): Promise<void> {
    await secureStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    if (refreshToken) {
      await secureStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    }
  },

  async getAccessToken(): Promise<string | null> {
    return secureStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  },

  async getRefreshToken(): Promise<string | null> {
    return secureStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  },

  async clearTokens(): Promise<void> {
    await secureStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    await secureStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  },

  async hasValidTokens(): Promise<boolean> {
    const accessToken = await this.getAccessToken();
    return !!accessToken;
  },
};

/**
 * General storage for non-sensitive data
 */
export const storage = {
  async setItem(key: string, value: unknown): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error('AsyncStorage setItem error:', error);
      throw error;
    }
  },

  async getItem<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('AsyncStorage getItem error:', error);
      return null;
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('AsyncStorage removeItem error:', error);
    }
  },

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('AsyncStorage clear error:', error);
    }
  },

  async getAllKeys(): Promise<readonly string[]> {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error('AsyncStorage getAllKeys error:', error);
      return [];
    }
  },
};

/**
 * Guest ID management
 */
export const guestStorage = {
  async getGuestId(): Promise<string | null> {
    return secureStorage.getItem(STORAGE_KEYS.GUEST_ID);
  },

  async setGuestId(guestId: string): Promise<void> {
    await secureStorage.setItem(STORAGE_KEYS.GUEST_ID, guestId);
  },

  async generateGuestId(): Promise<string> {
    const existingId = await this.getGuestId();
    if (existingId) return existingId;

    const newId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await this.setGuestId(newId);
    return newId;
  },

  async clearGuestId(): Promise<void> {
    await secureStorage.removeItem(STORAGE_KEYS.GUEST_ID);
  },
};
