/**
 * Socket.io client for real-time messaging
 */

import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '../constants/config';
import { tokenStorage } from './storage';

// Extract base URL without /api/v1
const SOCKET_URL = API_BASE_URL.replace('/api/v1', '');

// Types for socket events
export interface TypingEvent {
  conversationId: string;
  userId: string;
}

export interface PresenceEvent {
  userId: string;
}

export interface NewMessageEvent {
  message: {
    id: string;
    conversationId: string;
    senderId: string;
    recipientId: string;
    content: string;
    attachments: any[];
    isRead: boolean;
    createdAt: string;
  };
}

export interface ReadReceiptEvent {
  conversationId: string;
  readBy: string;
}

// Socket manager class
class MessagingSocket {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private listeners: Map<string, Set<Function>> = new Map();

  /**
   * Connect to the messaging socket
   */
  async connect(): Promise<void> {
    if (this.socket?.connected) {
      console.log('[Socket] Already connected');
      return;
    }

    const token = await tokenStorage.getAccessToken();
    if (!token) {
      console.log('[Socket] No token available, cannot connect');
      return;
    }

    console.log('[Socket] Connecting to', SOCKET_URL);

    this.socket = io(`${SOCKET_URL}/messaging`, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    this.setupEventListeners();
  }

  /**
   * Set up internal event listeners
   */
  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('[Socket] Connected to messaging');
      this.reconnectAttempts = 0;
      this.emit('presence:online');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error.message);
      this.reconnectAttempts++;
    });

    this.socket.on('error', (error) => {
      console.error('[Socket] Error:', error);
    });

    // Forward events to registered listeners
    this.socket.on('message:new', (data: NewMessageEvent) => {
      this.notifyListeners('message:new', data);
    });

    this.socket.on('typing:user_typing', (data: TypingEvent) => {
      this.notifyListeners('typing:user_typing', data);
    });

    this.socket.on('typing:user_stopped', (data: TypingEvent) => {
      this.notifyListeners('typing:user_stopped', data);
    });

    this.socket.on('presence:user_online', (data: PresenceEvent) => {
      this.notifyListeners('presence:user_online', data);
    });

    this.socket.on('presence:user_offline', (data: PresenceEvent) => {
      this.notifyListeners('presence:user_offline', data);
    });

    this.socket.on('message:read', (data: ReadReceiptEvent) => {
      this.notifyListeners('message:read', data);
    });
  }

  /**
   * Disconnect from socket
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('[Socket] Disconnected');
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  /**
   * Join a conversation room
   */
  joinConversation(conversationId: string): void {
    if (!this.socket?.connected) {
      console.warn('[Socket] Not connected, cannot join conversation');
      return;
    }
    this.socket.emit('conversation:join', { conversationId });
  }

  /**
   * Leave a conversation room
   */
  leaveConversation(conversationId: string): void {
    if (!this.socket?.connected) return;
    this.socket.emit('conversation:leave', { conversationId });
  }

  /**
   * Send typing started indicator
   */
  startTyping(conversationId: string, recipientId: string): void {
    if (!this.socket?.connected) return;
    this.socket.emit('typing:start', { conversationId, recipientId });
  }

  /**
   * Send typing stopped indicator
   */
  stopTyping(conversationId: string, recipientId: string): void {
    if (!this.socket?.connected) return;
    this.socket.emit('typing:stop', { conversationId, recipientId });
  }

  /**
   * Emit generic event
   */
  emit(event: string, data?: any): void {
    if (!this.socket?.connected) return;
    this.socket.emit(event, data);
  }

  /**
   * Add event listener
   */
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  /**
   * Remove event listener
   */
  off(event: string, callback: Function): void {
    this.listeners.get(event)?.delete(callback);
  }

  /**
   * Notify all listeners for an event
   */
  private notifyListeners(event: string, data: any): void {
    this.listeners.get(event)?.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error(`[Socket] Error in listener for ${event}:`, error);
      }
    });
  }
}

// Singleton instance
export const messagingSocket = new MessagingSocket();

export default messagingSocket;
