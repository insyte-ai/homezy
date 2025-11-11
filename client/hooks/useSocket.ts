import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

let socketInstance: Socket | null = null;

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
    setError,
    incrementGuestCount,
  } = useChatStore();

  const { user } = useAuthStore();

  useEffect(() => {
    // Reuse existing socket instance if connected
    if (socketInstance?.connected) {
      setSocket(socketInstance);
      setIsConnected(true);
      return;
    }

    // Get guest ID from cookie or create new one
    const getGuestId = () => {
      const match = document.cookie.match(/guestId=([^;]+)/);
      if (match) return match[1];

      const newGuestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      // Set cookie
      document.cookie = `guestId=${newGuestId}; path=/; max-age=${24 * 60 * 60}`; // 24 hours
      return newGuestId;
    };

    // Get auth token
    const getAuthToken = () => {
      return localStorage.getItem('accessToken');
    };

    // Create new socket connection
    const newSocket = io(process.env.NEXT_PUBLIC_API_URL!, {
      auth: {
        token: getAuthToken(),
        guestId: getGuestId(),
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
  }, []);

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
