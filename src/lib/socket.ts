import { Server } from 'socket.io';

interface ApplicationUpdate {
  applicationId: string;
  status: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  userId: string;
  employerId: string;
  timestamp: string;
  message?: string;
}

interface NotificationData {
  id: string;
  type: 'APPLICATION_UPDATE' | 'NEW_APPLICATION' | 'JOB_STATUS_CHANGE';
  title: string;
  message: string;
  userId: string;
  timestamp: string;
  data?: any;
}

export const setupSocket = (io: Server) => {
  // Store user socket mappings
  const userSockets = new Map<string, string>();
  const employerSockets = new Map<string, string>();

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // Handle user authentication
    socket.on('authenticate', (data: { userId: string; role: string; token: string }) => {
      const { userId, role, token } = data;
      
      // In a real app, you would validate the token here
      // For now, we'll just store the mapping
      if (role === 'JOB_SEEKER') {
        userSockets.set(userId, socket.id);
      } else if (role === 'EMPLOYER') {
        employerSockets.set(userId, socket.id);
      }
      
      // Join user-specific room
      socket.join(`user_${userId}`);
      
      console.log(`User ${userId} authenticated with role ${role}`);
    });

    // Handle application status updates
    socket.on('application_update', (update: ApplicationUpdate) => {
      const { userId, employerId, ...updateData } = update;
      
      // Notify the job seeker
      const jobSeekerSocketId = userSockets.get(userId);
      if (jobSeekerSocketId) {
        io.to(jobSeekerSocketId).emit('application_status_update', {
          ...updateData,
          timestamp: new Date().toISOString(),
        });
      }
      
      // Also notify the employer
      const employerSocketId = employerSockets.get(employerId);
      if (employerSocketId) {
        io.to(employerSocketId).emit('application_status_update', {
          ...updateData,
          timestamp: new Date().toISOString(),
        });
      }
    });

    // Handle new application notifications
    socket.on('new_application', (data: { employerId: string; application: any }) => {
      const { employerId, application } = data;
      const employerSocketId = employerSockets.get(employerId);
      
      if (employerSocketId) {
        io.to(employerSocketId).emit('new_application_received', {
          application,
          timestamp: new Date().toISOString(),
        });
      }
    });

    // Handle job status changes
    socket.on('job_status_change', (data: { jobId: string; status: string; applicants: string[] }) => {
      const { jobId, status, applicants } = data;
      
      // Notify all applicants
      applicants.forEach(applicantId => {
        const applicantSocketId = userSockets.get(applicantId);
        if (applicantSocketId) {
          io.to(applicantSocketId).emit('job_status_update', {
            jobId,
            status,
            timestamp: new Date().toISOString(),
          });
        }
      });
    });

    // Handle real-time notifications
    socket.on('send_notification', (notification: NotificationData) => {
      const { userId, ...notificationData } = notification;
      const userSocketId = userSockets.get(userId) || employerSockets.get(userId);
      
      if (userSocketId) {
        io.to(userSocketId).emit('notification', {
          ...notificationData,
          timestamp: new Date().toISOString(),
        });
      }
    });

    // Handle typing indicators for chat
    socket.on('typing_start', (data: { conversationId: string; userId: string }) => {
      socket.to(`conversation_${data.conversationId}`).emit('user_typing', {
        userId: data.userId,
        isTyping: true,
      });
    });

    socket.on('typing_stop', (data: { conversationId: string; userId: string }) => {
      socket.to(`conversation_${data.conversationId}`).emit('user_typing', {
        userId: data.userId,
        isTyping: false,
      });
    });

    // Handle joining conversation rooms
    socket.on('join_conversation', (conversationId: string) => {
      socket.join(`conversation_${conversationId}`);
      console.log(`User ${socket.id} joined conversation ${conversationId}`);
    });

    // Handle leaving conversation rooms
    socket.on('leave_conversation', (conversationId: string) => {
      socket.leave(`conversation_${conversationId}`);
      console.log(`User ${socket.id} left conversation ${conversationId}`);
    });

    // Handle chat messages
    socket.on('send_message', (msg: { 
      conversationId: string; 
      text: string; 
      senderId: string; 
      receiverId: string;
    }) => {
      const messageData = {
        ...msg,
        timestamp: new Date().toISOString(),
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };
      
      // Send to conversation room
      io.to(`conversation_${msg.conversationId}`).emit('new_message', messageData);
      
      // Also send to specific receiver if they're not in the room
      const receiverSocketId = userSockets.get(msg.receiverId) || employerSockets.get(msg.receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('new_message', messageData);
      }
    });

    // Handle application tracking
    socket.on('track_application', (data: { applicationId: string; userId: string }) => {
      const { applicationId, userId } = data;
      socket.join(`application_${applicationId}`);
      console.log(`User ${userId} tracking application ${applicationId}`);
    });

    // Handle untracking application
    socket.on('untrack_application', (data: { applicationId: string; userId: string }) => {
      const { applicationId, userId } = data;
      socket.leave(`application_${applicationId}`);
      console.log(`User ${userId} stopped tracking application ${applicationId}`);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      
      // Clean up user mappings
      for (const [userId, socketId] of userSockets.entries()) {
        if (socketId === socket.id) {
          userSockets.delete(userId);
          break;
        }
      }
      
      for (const [employerId, socketId] of employerSockets.entries()) {
        if (socketId === socket.id) {
          employerSockets.delete(employerId);
          break;
        }
      }
    });

    // Send welcome message
    socket.emit('connection_established', {
      message: 'Connected to Cyprus Jobs Real-time Server',
      timestamp: new Date().toISOString(),
      socketId: socket.id,
    });
  });
};