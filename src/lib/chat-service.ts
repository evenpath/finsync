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
    arrayUnion,
    getDocs,
    DocumentData,
    QuerySnapshot,
    Unsubscribe
  } from 'firebase/firestore';
  import { db } from './firebase';
  import { Conversation, ChatMessage } from './types';
  
  export class ChatService {
    static async createConversation(
      partnerId: string,
      participants: string[],
      title: string,
      type: 'direct' | 'group' = 'direct',
      createdBy: string
    ): Promise<string> {
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
      const q = query(
        collection(db, 'conversations'),
        where('partnerId', '==', partnerId),
        where('participants', 'array-contains', userId),
        orderBy('lastMessageAt', 'desc'),
        limit(50)
      );
  
      return onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
        const conversations: Conversation[] = [];
        snapshot.forEach((doc) => {
          conversations.push({
            id: doc.id,
            ...doc.data()
          } as Conversation);
        });
        callback(conversations);
      });
    }
  
    static subscribeToMessages(
      conversationId: string,
      callback: (messages: ChatMessage[]) => void
    ): Unsubscribe {
      const q = query(
        collection(db, 'messages'),
        where('conversationId', '==', conversationId),
        orderBy('createdAt', 'asc'),
        limit(100)
      );
  
      return onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
        const messages: ChatMessage[] = [];
        snapshot.forEach((doc) => {
          messages.push({
            id: doc.id,
            ...doc.data()
          } as ChatMessage);
        });
        callback(messages);
      });
    }
  
    static async getTeamMembers(partnerId: string): Promise<any[]> {
      const q = query(
        collection(db, 'teamMembers'),
        where('partnerId', '==', partnerId)
      );
      
      const snapshot = await getDocs(q);
      const members: any[] = [];
      
      snapshot.forEach((doc) => {
        members.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return members;
    }
  
    static async findExistingDirectConversation(
      partnerId: string,
      userId1: string,
      userId2: string
    ): Promise<string | null> {
      const q = query(
        collection(db, 'conversations'),
        where('partnerId', '==', partnerId),
        where('type', '==', 'direct'),
        where('participants', 'array-contains', userId1)
      );
  
      const snapshot = await getDocs(q);
      
      for (const doc of snapshot.docs) {
        const data = doc.data();
        if (data.participants.includes(userId2) && data.participants.length === 2) {
          return doc.id;
        }
      }
      
      return null;
    }
  }