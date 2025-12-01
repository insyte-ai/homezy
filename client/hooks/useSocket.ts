import { useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

let socketInstance: Socket | null = null;
let currentGuestId: string | null = null;

// Get guest ID from cookie (don't create a new one - let the server do that)
const getGuestIdFromCookie = (): string | null => {
  const match = document.cookie.match(/guestId=([^;]+)/);
  return match ? match[1] : null;
};

export const useSocket = () => {
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
    incrementGuestCount,
  } = useChatStore();

  const { user } = useAuthStore();

  // Get auth token
  const getAuthToken = useCallback(() => {
    return localStorage.getItem('accessToken');
  }, []);

  useEffect(() => {
    // Wait for conversation to be initialized (so guestId cookie is set by server)
    if (!isInitialized) {
      return;
    }

    const guestId = getGuestIdFromCookie();

    // Check if we need to reconnect due to guestId change
    if (socketInstance?.connected && currentGuestId === guestId) {
      setSocket(socketInstance);
      setIsConnected(true);
      return;
    }

    // Disconnect existing socket if guestId changed
    if (socketInstance && currentGuestId !== guestId) {
      socketInstance.disconnect();
      socketInstance = null;
    }

    currentGuestId = guestId;

    // Create new socket connection
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5001';
    const newSocket = io(socketUrl, {
      auth: {
        token: getAuthToken(),
        guestId: guestId,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: maxReconnectAttempts,
    });

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      setIsConnected(true);
      reconnectAttempts.current = 0;

      // Join conversation room if we have one
      if (conversationId) {
        newSocket.emit('chat:join_conversation', { conversationId });
      }
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);

      if (reason === 'io server disconnect') {
        // Server disconnected, try to reconnect
        newSocket.connect();
      }
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      reconnectAttempts.current += 1;

      if (reconnectAttempts.current >= maxReconnectAttempts) {
        toast.error('Unable to connect to chat. Please refresh the page.');
        setError('Connection failed. Please refresh the page.');
      } else {
        toast.error('Connection issue. Retrying...');
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

      if (code === 'GUEST_LIMIT_REACHED') {
        toast.error('Message limit reached. Please sign up to continue.');
        setError('Message limit reached. Please sign up to continue.');
      } else {
        toast.error(error || 'An error occurred');
        setError(error || 'An error occurred');
      }

      completeStreaming();
    });

    // Handle reconnection
    newSocket.on('reconnect', (attemptNumber) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts');
      toast.success('Reconnected to chat');
      setError(null);
    });

    newSocket.on('reconnect_failed', () => {
      console.error('Socket reconnection failed');
      toast.error('Failed to reconnect. Please refresh the page.');
      setError('Connection failed. Please refresh the page.');
    });

    socketInstance = newSocket;
    setSocket(newSocket);

    return () => {
      // Don't disconnect on unmount (keep connection alive)
      // Only disconnect when window closes or navigates away
      // newSocket.disconnect();
    };
  }, [isInitialized, getAuthToken]);

  // Join conversation when ID changes
  useEffect(() => {
    if (socket && conversationId && socket.connected) {
      socket.emit('chat:join_conversation', { conversationId });
    }
  }, [socket, conversationId]);

  // Send message function
  const sendMessage = (content: string) => {
    if (!socket || !conversationId) {
      console.error('Socket or conversation not ready');
      toast.error('Please wait for connection to establish');
      return;
    }

    if (!isConnected) {
      toast.error('Not connected. Please wait...');
      return;
    }

    // Add user message to the store immediately (for UI)
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    useChatStore.setState((state) => ({
      messages: [
        ...state.messages,
        {
          id: messageId,
          conversationId,
          role: 'user' as const,
          content,
          createdAt: new Date(),
        },
      ],
      isStreaming: true,
      streamingMessage: '',
      error: null,
    }));

    // Emit message to server
    socket.emit('chat:send_message', {
      conversationId,
      content,
    });

    // Increment guest count if not authenticated
    if (!user) {
      incrementGuestCount();
    }
  };

  return { socket, isConnected, sendMessage };
};
