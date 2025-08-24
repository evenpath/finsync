// src/services/team-notifications-service.ts (v2)
import { db } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

interface NotificationRecipient {
  userId: string;
  role: string;
  email?: string;
  phoneNumber?: string;
  notificationPreferences?: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
}

interface TeamNotification {
  id?: string;
  type: 'team_member_added' | 'team_member_deactivated' | 'team_member_reactivated' | 
        'role_changed' | 'bulk_operation_completed' | 'invitation_expired' | 'access_restored';
  partnerId: string;
  partnerName: string;
  targetUserId?: string;
  targetUserName?: string;
  performedBy: string;
  performedByName: string;
  title: string;
  message: string;
  data: Record<string, any>;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  channels: ('in_app' | 'email' | 'push' | 'sms')[];
  recipients: string[];
  scheduledFor?: Date;
  createdAt: Date;
}

export class TeamNotificationService {
  
  /**
   * Send notification when a team member is deactivated
   */
  static async notifyMemberDeactivated(params: {
    partnerId: string;
    partnerName: string;
    targetUserId: string;
    targetUserName: string;
    performedBy: string;
    performedByName: string;
    reason?: string;
  }) {
    const notification: TeamNotification = {
      type: 'team_member_deactivated',
      partnerId: params.partnerId,
      partnerName: params.partnerName,
      targetUserId: params.targetUserId,
      targetUserName: params.targetUserName,
      performedBy: params.performedBy,
      performedByName: params.performedByName,
      title: 'Team Member Deactivated',
      message: `${params.targetUserName} has been deactivated from ${params.partnerName}`,
      data: {
        reason: params.reason,
        action: 'deactivated',
        requiresInvitation: true
      },
      priority: 'medium',
      channels: ['in_app', 'email'],
      recipients: [params.targetUserId], // Notify the affected user
      createdAt: new Date()
    };

    await this.sendNotification(notification);
    
    // Also notify partner admins
    await this.notifyPartnerAdmins(params.partnerId, {
      ...notification,
      title: 'Team Member Deactivated',
      message: `${params.targetUserName} has been deactivated by ${params.performedByName}`,
      recipients: [] // Will be populated by notifyPartnerAdmins
    });
  }

  /**
   * Send notification when a team member is reactivated
   */
  static async notifyMemberReactivated(params: {
    partnerId: string;
    partnerName: string;
    targetUserId: string;
    targetUserName: string;
    performedBy: string;
    performedByName: string;
    invitationCode?: string;
  }) {
    const notification: TeamNotification = {
      type: 'team_member_reactivated',
      partnerId: params.partnerId,
      partnerName: params.partnerName,
      targetUserId: params.targetUserId,
      targetUserName: params.targetUserName,
      performedBy: params.performedBy,
      performedByName: params.performedByName,
      title: 'Access Restored',
      message: `Your access to ${params.partnerName} has been restored`,
      data: {
        action: 'reactivated',
        invitationCode: params.invitationCode,
        accessLevel: 'full'
      },
      priority: 'high',
      channels: ['in_app', 'email', 'push'],
      recipients: [params.targetUserId],
      createdAt: new Date()
    };

    await this.sendNotification(notification);
  }

  /**
   * Send notification for bulk operations completion
   */
  static async notifyBulkOperationCompleted(params: {
    partnerId: string;
    partnerName: string;
    performedBy: string;
    performedByName: string;
    operationType: string;
    successCount: number;
    failureCount: number;
    totalCount: number;
  }) {
    const notification: TeamNotification = {
      type: 'bulk_operation_completed',
      partnerId: params.partnerId,
      partnerName: params.partnerName,
      performedBy: params.performedBy,
      performedByName: params.performedByName,
      title: 'Bulk Operation Completed',
      message: `Bulk ${params.operationType} completed: ${params.successCount}/${params.totalCount} successful`,
      data: {
        operationType: params.operationType,
        successCount: params.successCount,
        failureCount: params.failureCount,
        totalCount: params.totalCount
      },
      priority: 'medium',
      channels: ['in_app'],
      recipients: [params.performedBy],
      createdAt: new Date()
    };

    await this.sendNotification(notification);
  }

  /**
   * Send notification when invitation is about to expire
   */
  static async notifyInvitationExpiring(params: {
    partnerId: string;
    partnerName: string;
    targetPhoneNumber: string;
    targetName: string;
    invitationCode: string;
    expiresAt: Date;
    hoursUntilExpiry: number;
  }) {
    // We can't send to userId since user might not exist yet
    // This would typically go through SMS/email service
    const notification: TeamNotification = {
      type: 'invitation_expired',
      partnerId: params.partnerId,
      partnerName: params.partnerName,
      targetUserName: params.targetName,
      performedBy: 'system',
      performedByName: 'System',
      title: 'Invitation Expiring Soon',
      message: `Your invitation to ${params.partnerName} expires in ${params.hoursUntilExpiry} hours`,
      data: {
        invitationCode: params.invitationCode,
        expiresAt: params.expiresAt.toISOString(),
        hoursUntilExpiry: params.hoursUntilExpiry,
        phoneNumber: params.targetPhoneNumber
      },
      priority: 'high',
      channels: ['sms', 'email'],
      recipients: [], // External delivery
      createdAt: new Date()
    };

    // Store notification for audit purposes
    await db.collection('notifications').add(notification);
    
    // Here you would integrate with SMS/email services
    await this.sendExternalNotification(notification, params.targetPhoneNumber);
  }

  /**
   * Send in-app notification
   */
  private static async sendNotification(notification: TeamNotification) {
    try {
      // Store in database
      const notificationRef = await db.collection('notifications').add(notification);
      
      // Send to each recipient
      for (const recipientId of notification.recipients) {
        await db.collection('userNotifications').add({
          ...notification,
          id: notificationRef.id,
          userId: recipientId,
          read: false,
          readAt: null,
          createdAt: FieldValue.serverTimestamp()
        });
      }

      // If push notifications are enabled, send them
      if (notification.channels.includes('push')) {
        await this.sendPushNotifications(notification);
      }

      // If email notifications are enabled, send them
      if (notification.channels.includes('email')) {
        await this.sendEmailNotifications(notification);
      }

      console.log(`Notification sent: ${notification.title} to ${notification.recipients.length} recipients`);
      
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  /**
   * Notify all partner admins
   */
  private static async notifyPartnerAdmins(partnerId: string, notification: TeamNotification) {
    try {
      // Get all partner admins for this partner
      const adminMembersSnapshot = await db
        .collection('teamMembers')
        .where('partnerId', '==', partnerId)
        .where('role', '==', 'partner_admin')
        .where('status', '==', 'active')
        .get();

      const adminIds = adminMembersSnapshot.docs.map(doc => doc.id);
      
      if (adminIds.length > 0) {
        notification.recipients = adminIds;
        await this.sendNotification(notification);
      }
      
    } catch (error) {
      console.error('Error notifying partner admins:', error);
    }
  }

  /**
   * Send push notifications (placeholder - integrate with FCM or similar)
   */
  private static async sendPushNotifications(notification: TeamNotification) {
    // Integrate with Firebase Cloud Messaging or similar service
    console.log('Push notification would be sent:', notification.title);
    
    // Example FCM integration:
    // const messaging = admin.messaging();
    // for (const userId of notification.recipients) {
    //   const userDoc = await db.collection('userProfiles').doc(userId).get();
    //   const fcmToken = userDoc.data()?.fcmToken;
    //   if (fcmToken) {
    //     await messaging.send({
    //       token: fcmToken,
    //       notification: {
    //         title: notification.title,
    //         body: notification.message
    //       },
    //       data: notification.data
    //     });
    //   }
    // }
  }

  /**
   * Send email notifications (placeholder - integrate with email service)
   */
  private static async sendEmailNotifications(notification: TeamNotification) {
    // Integrate with email service (SendGrid, AWS SES, etc.)
    console.log('Email notification would be sent:', notification.title);
    
    // Example email service integration:
    // const emailService = new EmailService();
    // for (const userId of notification.recipients) {
    //   const userDoc = await db.collection('userProfiles').doc(userId).get();
    //   const email = userDoc.data()?.email;
    //   if (email) {
    //     await emailService.send({
    //       to: email,
    //       subject: notification.title,
    //       template: 'team-notification',
    //       data: {
    //         message: notification.message,
    //         partnerName: notification.partnerName,
    //         ...notification.data
    //       }
    //     });
    //   }
    // }
  }

  /**
   * Send external notifications (SMS, email to non-users)
   */
  private static async sendExternalNotification(notification: TeamNotification, phoneNumber: string) {
    // Integrate with SMS service (Twilio, AWS SNS, etc.)
    console.log('External notification would be sent to:', phoneNumber, notification.title);
    
    // Example SMS service integration:
    // const smsService = new SmsService();
    // await smsService.send({
    //   to: phoneNumber,
    //   message: `${notification.title}: ${notification.message}. Code: ${notification.data.invitationCode}`
    // });
  }

  /**
   * Schedule recurring notifications (e.g., invitation expiry reminders)
   */
  static async scheduleInvitationReminders(partnerId: string) {
    try {
      // Get all pending invitations that expire in 24 hours
      const tomorrow = new Date();
      tomorrow.setHours(tomorrow.getHours() + 24);
      
      const expiringInvitationsSnapshot = await db
        .collection('invitationCodes')
        .where('partnerId', '==', partnerId)
        .where('status', '==', 'pending')
        .where('expiresAt', '<=', tomorrow)
        .get();

      const partnerDoc = await db.collection('partners').doc(partnerId).get();
      const partnerName = partnerDoc.data()?.name || 'Organization';

      for (const invitationDoc of expiringInvitationsSnapshot.docs) {
        const invitation = invitationDoc.data();
        const expiresAt = invitation.expiresAt.toDate();
        const hoursUntilExpiry = Math.floor((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60));

        if (hoursUntilExpiry > 0 && hoursUntilExpiry <= 24) {
          await this.notifyInvitationExpiring({
            partnerId,
            partnerName,
            targetPhoneNumber: invitation.phoneNumber,
            targetName: invitation.name,
            invitationCode: invitation.invitationCode,
            expiresAt,
            hoursUntilExpiry
          });
        }
      }

    } catch (error) {
      console.error('Error scheduling invitation reminders:', error);
    }
  }
}