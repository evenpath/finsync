import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  serverTimestamp, 
  getDocs,
  DocumentData,
  QuerySnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db } from './firebase';
import { Conversation, ChatMessage, TeamMember } from './types';

export class ChatService {
  static async createConversation(
    partnerId: string,
    participants: string[],
    title: string,
    type: 'direct' | 'group' = 'direct',
    createdBy: string
  ): Promise<string> {
    // Validate required parameters
    if (!partnerId || !participants.length || !title || !createdBy) {
      throw new Error('Missing required parameters for conversation creation');
    }

    const conversationData = {
      partnerId,
      participants,
      title,
      type,
      isActive: true,
      messageCount: 0,
      createdBy,
      createdAt: serverTimestamp(),
      lastMessageAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'conversations'), conversationData);
    return docRef.id;
  }

  static async sendMessage(
    conversationId: string,
    senderId: string,
    content: string,
    partnerId: string,
    type: 'text' | 'file' | 'image' | 'system' = 'text'
  ): Promise<void> {
    // Validate required parameters
    if (!conversationId || !senderId || !content || !partnerId) {
      throw new Error('Missing required parameters for message sending');
    }

    const messageData = {
      conversationId,
      senderId,
      content,
      type,
      partnerId,
      isEdited: false,
      reactions: [],
      mentions: [],
      createdAt: serverTimestamp()
    };

    // Add message to messages collection
    await addDoc(collection(db, 'messages'), messageData);

    // Update conversation last message time
    await updateDoc(doc(db, 'conversations', conversationId), {
      lastMessageAt: serverTimestamp()
    });
  }

  static subscribeToConversations(
    partnerId: string,
    userId: string,
    callback: (conversations: Conversation[]) => void
  ): Unsubscribe {
    // Validate parameters before creating query
    if (!partnerId || !userId) {
      console.error('ChatService.subscribeToConversations: partnerId or userId is undefined', {
        partnerId,
        userId
      });
      // Return empty function to prevent errors
      return () => {};
    }

    try {
      const q = query(
        collection(db, 'conversations'),
        where('partnerId', '==', partnerId),
        where('participants', 'array-contains', userId),
        orderBy('lastMessageAt', 'desc'),
        limit(50)
      );

      return onSnapshot(q, 
        (snapshot: QuerySnapshot<DocumentData>) => {
          const conversations: Conversation[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            conversations.push({
              id: doc.id,
              partnerId: data.partnerId,
              type: data.type,
              title: data.title,
              description: data.description,
              participants: data.participants || [],
              workflowId: data.workflowId,
              isActive: data.isActive !== false, // Default to true if undefined
              lastMessageAt: data.lastMessageAt,
              messageCount: data.messageCount || 0,
              createdBy: data.createdBy,
              createdAt: data.createdAt
            } as Conversation);
          });
          callback(conversations);
        },
        (error) => {
          console.error('Error in conversations listener:', error);
          // Return empty array on error
          callback([]);
        }
      );
    } catch (error) {
      console.error('Error setting up conversations listener:', error);
      return () => {};
    }
  }

  static subscribeToMessages(
    conversationId: string,
    callback: (messages: ChatMessage[]) => void
  ): Unsubscribe {
    // Validate parameters
    if (!conversationId) {
      console.error('ChatService.subscribeToMessages: conversationId is undefined');
      return () => {};
    }

    try {
      const q = query(
        collection(db, 'messages'),
        where('conversationId', '==', conversationId),
        orderBy('createdAt', 'asc'),
        limit(100)
      );

      return onSnapshot(q, 
        (snapshot: QuerySnapshot<DocumentData>) => {
          const messages: ChatMessage[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            messages.push({
              id: doc.id,
              conversationId: data.conversationId,
              senderId: data.senderId,
              sender: data.sender,
              type: data.type || 'text',
              content: data.content || '',
              attachments: data.attachments,
              metadata: data.metadata,
              isEdited: data.isEdited || false,
              editedAt: data.editedAt,
              reactions: data.reactions || [],
              replyToId: data.replyToId,
              mentions: data.mentions || [],
              createdAt: data.createdAt
            } as ChatMessage);
          });
          callback(messages);
        },
        (error) => {
          console.error('Error in messages listener:', error);
          callback([]);
        }
      );
    } catch (error) {
      console.error('Error setting up messages listener:', error);
      return () => {};
    }
  }

  static async getTeamMembers(partnerId: string): Promise<TeamMember[]> {
    // Validate partnerId
    if (!partnerId) {
      console.error('ChatService.getTeamMembers: partnerId is undefined');
      return [];
    }

    try {
      const q = query(
        collection(db, 'teamMembers'),
        where('partnerId', '==', partnerId)
      );
      
      const snapshot = await getDocs(q);
      const members: TeamMember[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        members.push({
          id: doc.id,
          partnerId: data.partnerId,
          userId: data.userId,
          name: data.name || 'Unknown User',
          email: data.email || '',
          role: data.role || 'employee',
          status: data.status || 'active',
          phoneNumber: data.phoneNumber,
          avatar: data.avatar,
          joinedAt: data.joinedAt,
          lastActiveAt: data.lastActiveAt,
          permissions: data.permissions || []
        } as TeamMember);
      });
      
      return members;
    } catch (error) {
      console.error('Error fetching team members:', error);
      return [];
    }
  }

  static async findExistingDirectConversation(
    partnerId: string,
    userId1: string,
    userId2: string
  ): Promise<string | null> {
    // Validate parameters
    if (!partnerId || !userId1 || !userId2) {
      console.error('ChatService.findExistingDirectConversation: Missing required parameters', {
        partnerId,
        userId1,
        userId2
      });
      return null;
    }

    try {
      const q = query(
        collection(db, 'conversations'),
        where('partnerId', '==', partnerId),
        where('type', '==', 'direct'),
        where('participants', 'array-contains', userId1)
      );

      const snapshot = await getDocs(q);
      
      for (const doc of snapshot.docs) {
        const data = doc.data();
        if (data.participants && 
            data.participants.includes(userId2) && 
            data.participants.length === 2) {
          return doc.id;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error finding existing conversation:', error);
      return null;
    }
  }

  static async markMessageAsRead(messageId: string, userId: string): Promise<void> {
    if (!messageId || !userId) {
      console.error('ChatService.markMessageAsRead: Missing required parameters');
      return;
    }

    try {
      // Implementation for read receipts can be added here
      console.log(`Marking message ${messageId} as read by ${userId}`);
    } catch (error) {
      console.error('Failed to mark message as read:', error);
    }
  }

  static async deleteMessage(messageId: string, userId: string): Promise<void> {
    if (!messageId || !userId) {
      throw new Error('Missing required parameters for message deletion');
    }

    try {
      await updateDoc(doc(db, 'messages', messageId), {
        content: '[Message deleted]',
        isEdited: true,
        editedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Failed to delete message:', error);
      throw error;
    }
  }

  static async editMessage(messageId: string, newContent: string, userId: string): Promise<void> {
    if (!messageId || !newContent || !userId) {
      throw new Error('Missing required parameters for message editing');
    }

    try {
      await updateDoc(doc(db, 'messages', messageId), {
        content: newContent,
        isEdited: true,
        editedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Failed to edit message:', error);
      throw error;
    }
  }
}