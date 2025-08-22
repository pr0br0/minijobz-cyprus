"use client";

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';

interface ApplicationUpdate {
  applicationId: string;
  status: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  timestamp: string;
  message?: string;
}

interface NotificationData {
  id: string;
  type: 'APPLICATION_UPDATE' | 'NEW_APPLICATION' | 'JOB_STATUS_CHANGE';
  title: string;
  message: string;
  timestamp: string;
  data?: any;
}

interface MessageData {
  id: string;
  conversationId: string;
  text: string;
  senderId: string;
  receiverId: string;
  timestamp: string;
}

interface UseSocketOptions {
  autoConnect?: boolean;
  enableNotifications?: boolean;
  enableChat?: boolean;
  enableApplicationTracking?: boolean;
}

export const useSocket = (options: UseSocketOptions = {}) => {
  const {
    autoConnect = true,
    enableNotifications = true,
    enableChat = true,
    enableApplicationTracking = true,
  } = options;

  const { data: session } = useSession();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [applicationUpdates, setApplicationUpdates] = useState<ApplicationUpdate[]>([]);
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!session?.user?.id || !autoConnect) return;

    // Initialize socket connection
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    // Connection events
    socket.on('connect', () => {
      setIsConnected(true);
      console.log('Socket connected:', socket.id);
      socket.emit('authenticate', { userId: session.user.id, role: session.user.role });
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Socket disconnected');
    });

    socket.on('connection_established', (data) => {
      console.log('Connection established:', data);
    });

    // Application tracking events
    if (enableApplicationTracking) {
      socket.on('application_status_update', (update: ApplicationUpdate) => {
        setApplicationUpdates(prev => [update, ...prev.slice(0, 49)]); // Keep last 50 updates
        
        if (enableNotifications) {
          const notification: NotificationData = {
            id: `notif_${Date.now()}`,
            type: 'APPLICATION_UPDATE',
            title: 'Application Status Updated',
            message: `Your application for ${update.jobTitle} at ${update.companyName} is now ${update.status}`,
            timestamp: update.timestamp,
            data: update,
          };
          setNotifications(prev => [notification, ...prev.slice(0, 19)]); // Keep last 20 notifications
        }
      });

      socket.on('new_application_received', (data) => {
        if (enableNotifications) {
          const notification: NotificationData = {
            id: `notif_${Date.now()}`,
            type: 'NEW_APPLICATION',
            title: 'New Application Received',
            message: `New application for ${data.application.job.title}`,
            timestamp: data.timestamp,
            data: data.application,
          };
          setNotifications(prev => [notification, ...prev.slice(0, 19)]);
        }
      });

      socket.on('job_status_update', (data) => {
        if (enableNotifications) {
          const notification: NotificationData = {
            id: `notif_${Date.now()}`,
            type: 'JOB_STATUS_CHANGE',
            title: 'Job Status Updated',
            message: `Job status changed to ${data.status}`,
            timestamp: data.timestamp,
            data: data,
          };
          setNotifications(prev => [notification, ...prev.slice(0, 19)]);
        }
      });
    }

    // Chat events
    if (enableChat) {
      socket.on('new_message', (message: MessageData) => {
        setMessages(prev => [...prev, message]);
      });

      socket.on('user_typing', (data) => {
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          if (data.isTyping) {
            newSet.add(data.userId);
          } else {
            newSet.delete(data.userId);
          }
          return newSet;
        });
      });
    }

    // General notifications
    if (enableNotifications) {
      socket.on('notification', (notification: NotificationData) => {
        setNotifications(prev => [notification, ...prev.slice(0, 19)]);
      });
    }

    // Cleanup on unmount
    return () => {
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [session, autoConnect, enableNotifications, enableChat, enableApplicationTracking]);

  // Socket action methods
  const trackApplication = (applicationId: string) => {
    if (socketRef.current && session?.user?.id) {
      socketRef.current.emit('track_application', {
        applicationId,
        userId: session.user.id,
      });
    }
  };

  const untrackApplication = (applicationId: string) => {
    if (socketRef.current && session?.user?.id) {
      socketRef.current.emit('untrack_application', {
        applicationId,
        userId: session.user.id,
      });
    }
  };

  const joinConversation = (conversationId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('join_conversation', conversationId);
    }
  };

  const leaveConversation = (conversationId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('leave_conversation', conversationId);
    }
  };

  const sendMessage = (message: {
    conversationId: string;
    text: string;
    receiverId: string;
  }) => {
    if (socketRef.current && session?.user?.id) {
      socketRef.current.emit('send_message', {
        ...message,
        senderId: session.user.id,
      });
    }
  };

  const startTyping = (conversationId: string) => {
    if (socketRef.current && session?.user?.id) {
      socketRef.current.emit('typing_start', {
        conversationId,
        userId: session.user.id,
      });
    }
  };

  const stopTyping = (conversationId: string) => {
    if (socketRef.current && session?.user?.id) {
      socketRef.current.emit('typing_stop', {
        conversationId,
        userId: session.user.id,
      });
    }
  };

  const sendNotification = (notification: Omit<NotificationData, 'id' | 'timestamp'>) => {
    if (socketRef.current) {
      socketRef.current.emit('send_notification', {
        ...notification,
        id: `notif_${Date.now()}`,
        timestamp: new Date().toISOString(),
      });
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const clearApplicationUpdates = () => {
    setApplicationUpdates([]);
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  return {
    isConnected,
    socket: socketRef.current,
    notifications,
    applicationUpdates,
    messages,
    typingUsers,
    trackApplication,
    untrackApplication,
    joinConversation,
    leaveConversation,
    sendMessage,
    startTyping,
    stopTyping,
    sendNotification,
    clearNotifications,
    clearApplicationUpdates,
    markNotificationAsRead,
  };
};