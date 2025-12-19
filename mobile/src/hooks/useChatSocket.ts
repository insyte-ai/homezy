/**
 * Chat Socket Hook
 * Manages Socket.io connection for HomeGPT AI chat
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import { API_URL } from '../constants/config';
import * as SecureStore from 'expo-secure-store';

let socketInstance: Socket | null = null;

export const useChatSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const {
    appendStreamingToken,
    startFunctionCall,
    completeFunctionCall,
    completeStreaming,
    conversationId,
    isInitialized,
    setError,
  } = useChatStore();

  const { user } = useAuthStore();

  // Get auth token
  const getAuthToken = useCallback(async () => {
    try {
      return await SecureStore.getItemAsync('accessToken');
    } catch {
      return null;
    }
  }, []);

  // Initialize socket connection
  useEffect(() => {
    if (!isInitialized || !conversationId) {
      return;
    }

    const initSocket = async () => {
      // If socket exists and is connected, reuse it
      if (socketInstance?.connected) {
        setSocket(socketInstance);
        setIsConnected(true);
        socketInstance.emit('chat:join_conversation', { conversationId });
        return;
      }

      // Get auth token
      const token = await getAuthToken();

      // Determine socket URL (remove /api/v1 if present)
      const socketUrl = API_URL.replace('/api/v1', '');

      // Create new socket connection
      const newSocket = io(socketUrl, {
        auth: {
          token: token,
        },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: maxReconnectAttempts,
      });

      newSocket.on('connect', () => {
        console.log('Chat socket connected:', newSocket.id);
        setIsConnected(true);
        reconnectAttempts.current = 0;

        // Join conversation room
        if (conversationId) {
          newSocket.emit('chat:join_conversation', { conversationId });
        }
      });

      newSocket.on('disconnect', (reason) => {
        console.log('Chat socket disconnected:', reason);
        setIsConnected(false);

        if (reason === 'io server disconnect') {
          newSocket.connect();
        }
      });

      newSocket.on('connect_error', (error) => {
        console.error('Chat socket connection error:', error);
        reconnectAttempts.current += 1;

        if (reconnectAttempts.current >= maxReconnectAttempts) {
          setError('Unable to connect to chat. Please try again.');
        }
      });

      // Listen for streaming tokens
      newSocket.on('chat:token', ({ token }) => {
        appendStreamingToken(token);
      });

      // Listen for function call start
      newSocket.on('chat:function_call_start', ({ toolName, toolId }) => {
        startFunctionCall(toolName, toolId);
      });

      // Listen for function call completion
      newSocket.on('chat:function_call_complete', ({ toolName, result }) => {
        completeFunctionCall(toolName, result);
      });

      // Listen for message completion
      newSocket.on('chat:complete', () => {
        completeStreaming();
      });

      // Listen for errors
      newSocket.on('chat:error', ({ error, code }) => {
        console.error('Chat error:', error, code);
        setError(error || 'An error occurred');
        completeStreaming();
      });

      // Handle reconnection
      newSocket.on('reconnect', (attemptNumber) => {
        console.log('Chat socket reconnected after', attemptNumber, 'attempts');
        setError(null);

        // Rejoin conversation
        if (conversationId) {
          newSocket.emit('chat:join_conversation', { conversationId });
        }
      });

      newSocket.on('reconnect_failed', () => {
        console.error('Chat socket reconnection failed');
        setError('Connection failed. Please try again.');
      });

      socketInstance = newSocket;
      setSocket(newSocket);
    };

    initSocket();

    return () => {
      // Don't disconnect on unmount to maintain connection
    };
  }, [isInitialized, conversationId, getAuthToken]);

  // Send message function
  const sendMessage = useCallback((content: string) => {
    const { conversationId, addUserMessage, setIsStreaming } = useChatStore.getState();

    if (!socketInstance || !conversationId) {
      console.error('Socket or conversation not ready');
      setError('Please wait for connection to establish');
      return;
    }

    if (!socketInstance.connected) {
      setError('Not connected. Please wait...');
      return;
    }

    // Add user message to the store immediately
    addUserMessage(content);

    // Emit message to server
    socketInstance.emit('chat:send_message', {
      conversationId,
      content,
    });
  }, []);

  // Disconnect socket
  const disconnect = useCallback(() => {
    if (socketInstance) {
      socketInstance.disconnect();
      socketInstance = null;
      setSocket(null);
      setIsConnected(false);
    }
  }, []);

  return { socket, isConnected, sendMessage, disconnect };
};
