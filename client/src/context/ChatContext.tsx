import { createContext, useState, useEffect, ReactNode } from "react";
import { 
  db,
  ref,
  onValue,
  push,
  serverTimestamp,
  get,
  set,
  update,
  storage,
  storageRef,
  uploadBytes,
  getDownloadURL
} from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid';

// Define types for the chat app
export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text?: string;
  imageUrl?: string;
  audioUrl?: string;
  timestamp: number;
  readBy: string[];
}

export interface ChatRoom {
  id: string;
  name: string;
  description?: string;
  isPrivate: boolean;
  createdBy: string;
  createdAt: number;
  lastMessage?: {
    text: string;
    senderId: string;
    senderName: string;
    timestamp: number;
  };
  members: Record<string, boolean>;
}

export interface DirectChat {
  id: string;
  userId: string;
  userDisplayName: string;
  userPhotoURL: string;
  userStatus: 'online' | 'away' | 'offline';
  lastMessage?: {
    text: string;
    senderId: string;
    timestamp: number;
  };
}

interface ChatContextType {
  activeRoom: ChatRoom | null;
  messages: ChatMessage[];
  rooms: ChatRoom[];
  directChats: DirectChat[];
  setActiveRoom: (room: ChatRoom | null) => void;
  createRoom: (name: string, description: string, isPrivate: boolean) => Promise<string>;
  joinRoom: (roomId: string) => Promise<void>;
  sendMessage: (text: string) => Promise<void>;
  sendImageMessage: (file: File) => Promise<void>;
  sendAudioMessage: (blob: Blob) => Promise<void>;
  isLoading: boolean;
}

export const ChatContext = createContext<ChatContextType>({
  activeRoom: null,
  messages: [],
  rooms: [],
  directChats: [],
  setActiveRoom: () => {},
  createRoom: async () => "",
  joinRoom: async () => {},
  sendMessage: async () => {},
  sendImageMessage: async () => {},
  sendAudioMessage: async () => {},
  isLoading: true
});

export function ChatProvider({ children }: { children: ReactNode }) {
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [directChats, setDirectChats] = useState<DirectChat[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Load user's rooms
  useEffect(() => {
    if (!user) {
      setRooms([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const userRoomsRef = ref(db, `userRooms/${user.uid}`);
    
    const unsubscribe = onValue(userRoomsRef, async (snapshot) => {
      if (!snapshot.exists()) {
        setRooms([]);
        setIsLoading(false);
        return;
      }

      const userRoomsData = snapshot.val();
      const roomPromises = Object.keys(userRoomsData).map(async (roomId) => {
        const roomRef = ref(db, `rooms/${roomId}`);
        const roomSnap = await get(roomRef);
        if (roomSnap.exists()) {
          const roomData = roomSnap.val();
          return { id: roomId, ...roomData } as ChatRoom;
        }
        return null;
      });

      const roomResults = await Promise.all(roomPromises);
      const filteredRooms = roomResults.filter((room): room is ChatRoom => room !== null);
      
      setRooms(filteredRooms);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Load direct chats
  useEffect(() => {
    if (!user) {
      setDirectChats([]);
      return;
    }

    const directChatsRef = ref(db, `directChats/${user.uid}`);
    
    const unsubscribe = onValue(directChatsRef, async (snapshot) => {
      if (!snapshot.exists()) {
        setDirectChats([]);
        return;
      }

      const directChatsData = snapshot.val();
      const chatPromises = Object.keys(directChatsData).map(async (chatId) => {
        const chatData = directChatsData[chatId];
        const userRef = ref(db, `users/${chatData.userId}`);
        const userSnap = await get(userRef);
        
        if (userSnap.exists()) {
          const userData = userSnap.val();
          return {
            id: chatId,
            userId: chatData.userId,
            userDisplayName: userData.displayName,
            userPhotoURL: userData.photoURL || '',
            userStatus: userData.status || 'offline',
            lastMessage: chatData.lastMessage
          } as DirectChat;
        }
        return null;
      });

      const chatResults = await Promise.all(chatPromises);
      const filteredChats = chatResults.filter((chat): chat is DirectChat => chat !== null);
      
      setDirectChats(filteredChats);
    });

    return () => unsubscribe();
  }, [user]);

  // Load messages for active room
  useEffect(() => {
    if (!activeRoom || !user) {
      setMessages([]);
      return;
    }

    const messagesRef = ref(db, `messages/${activeRoom.id}`);
    
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      if (!snapshot.exists()) {
        setMessages([]);
        return;
      }

      const messagesData = snapshot.val();
      const messageList = Object.keys(messagesData).map(msgId => ({
        id: msgId,
        ...messagesData[msgId]
      })) as ChatMessage[];
      
      // Sort messages by timestamp
      messageList.sort((a, b) => a.timestamp - b.timestamp);
      
      setMessages(messageList);
      
      // Mark messages as read
      messageList.forEach(message => {
        if (message.senderId !== user.uid && !message.readBy.includes(user.uid)) {
          const messageRef = ref(db, `messages/${activeRoom.id}/${message.id}`);
          const readBy = [...message.readBy, user.uid];
          update(messageRef, { readBy });
        }
      });
    });

    return () => unsubscribe();
  }, [activeRoom, user]);

  // Create a new chat room
  const createRoom = async (name: string, description: string, isPrivate: boolean): Promise<string> => {
    if (!user) throw new Error("User not authenticated");
    
    try {
      // Create a new room entry
      const roomsRef = ref(db, "rooms");
      const newRoomRef = push(roomsRef);
      const roomId = newRoomRef.key;
      
      if (!roomId) throw new Error("Failed to generate room ID");
      
      // Generate a more user-friendly room code
      const roomCode = `CW-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      
      const roomData: Omit<ChatRoom, 'id'> = {
        name,
        description,
        isPrivate,
        createdBy: user.uid,
        createdAt: Date.now(),
        members: { [user.uid]: true }
      };
      
      await set(newRoomRef, {
        ...roomData,
        roomCode
      });
      
      // Add room to user's rooms
      const userRoomRef = ref(db, `userRooms/${user.uid}/${roomId}`);
      await set(userRoomRef, true);
      
      toast({
        title: "Room created",
        description: `Your room "${name}" has been created successfully`,
      });
      
      return roomId;
    } catch (error: any) {
      toast({
        title: "Failed to create room",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Join a room by ID or code
  const joinRoom = async (roomIdOrCode: string) => {
    if (!user) throw new Error("User not authenticated");
    
    try {
      // First try to find by roomCode
      const roomsRef = ref(db, "rooms");
      const snapshot = await get(roomsRef);
      
      if (!snapshot.exists()) {
        throw new Error("Room not found");
      }
      
      let roomId = '';
      let roomData = null;
      
      // Check all rooms to find the matching code or ID
      const rooms = snapshot.val();
      for (const id in rooms) {
        if (rooms[id].roomCode === roomIdOrCode || id === roomIdOrCode) {
          roomId = id;
          roomData = rooms[id];
          break;
        }
      }
      
      if (!roomId || !roomData) {
        throw new Error("Room not found");
      }
      
      // Check if room is private
      if (roomData.isPrivate && !roomData.members[user.uid]) {
        throw new Error("This room is private. You need an invitation to join.");
      }
      
      // Add user to room members
      const roomMembersRef = ref(db, `rooms/${roomId}/members/${user.uid}`);
      await set(roomMembersRef, true);
      
      // Add room to user's rooms
      const userRoomRef = ref(db, `userRooms/${user.uid}/${roomId}`);
      await set(userRoomRef, true);
      
      // Set as active room
      setActiveRoom({ id: roomId, ...roomData });
      
      toast({
        title: "Room joined",
        description: `You have joined "${roomData.name}"`,
      });
    } catch (error: any) {
      toast({
        title: "Failed to join room",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Send a text message
  const sendMessage = async (text: string) => {
    if (!user || !activeRoom) throw new Error("Cannot send message");
    
    try {
      const messagesRef = ref(db, `messages/${activeRoom.id}`);
      const newMessageRef = push(messagesRef);
      
      const messageData: Omit<ChatMessage, 'id'> = {
        roomId: activeRoom.id,
        senderId: user.uid,
        senderName: user.displayName || 'Unknown User',
        senderAvatar: user.photoURL || '',
        text,
        timestamp: Date.now(),
        readBy: [user.uid]
      };
      
      await set(newMessageRef, messageData);
      
      // Update room's last message
      const roomRef = ref(db, `rooms/${activeRoom.id}`);
      await update(roomRef, {
        lastMessage: {
          text: text.length > 30 ? text.substring(0, 27) + '...' : text,
          senderId: user.uid,
          senderName: user.displayName || 'Unknown User',
          timestamp: Date.now()
        }
      });
    } catch (error: any) {
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Send an image message
  const sendImageMessage = async (file: File) => {
    if (!user || !activeRoom) throw new Error("Cannot send message");
    
    try {
      // Upload image to Firebase Storage
      const fileId = uuidv4();
      const imageRef = storageRef(storage, `images/${activeRoom.id}/${fileId}`);
      await uploadBytes(imageRef, file);
      
      // Get download URL
      const imageUrl = await getDownloadURL(imageRef);
      
      // Create message in database
      const messagesRef = ref(db, `messages/${activeRoom.id}`);
      const newMessageRef = push(messagesRef);
      
      const messageData: Omit<ChatMessage, 'id'> = {
        roomId: activeRoom.id,
        senderId: user.uid,
        senderName: user.displayName || 'Unknown User',
        senderAvatar: user.photoURL || '',
        imageUrl,
        timestamp: Date.now(),
        readBy: [user.uid]
      };
      
      await set(newMessageRef, messageData);
      
      // Update room's last message
      const roomRef = ref(db, `rooms/${activeRoom.id}`);
      await update(roomRef, {
        lastMessage: {
          text: '📷 Image',
          senderId: user.uid,
          senderName: user.displayName || 'Unknown User',
          timestamp: Date.now()
        }
      });
    } catch (error: any) {
      toast({
        title: "Failed to send image",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Send an audio message
  const sendAudioMessage = async (blob: Blob) => {
    if (!user || !activeRoom) throw new Error("Cannot send message");
    
    try {
      // Upload audio to Firebase Storage
      const fileId = uuidv4();
      const audioRef = storageRef(storage, `audio/${activeRoom.id}/${fileId}.webm`);
      await uploadBytes(audioRef, blob);
      
      // Get download URL
      const audioUrl = await getDownloadURL(audioRef);
      
      // Create message in database
      const messagesRef = ref(db, `messages/${activeRoom.id}`);
      const newMessageRef = push(messagesRef);
      
      const messageData: Omit<ChatMessage, 'id'> = {
        roomId: activeRoom.id,
        senderId: user.uid,
        senderName: user.displayName || 'Unknown User',
        senderAvatar: user.photoURL || '',
        audioUrl,
        timestamp: Date.now(),
        readBy: [user.uid]
      };
      
      await set(newMessageRef, messageData);
      
      // Update room's last message
      const roomRef = ref(db, `rooms/${activeRoom.id}`);
      await update(roomRef, {
        lastMessage: {
          text: '🎤 Voice message',
          senderId: user.uid,
          senderName: user.displayName || 'Unknown User',
          timestamp: Date.now()
        }
      });
    } catch (error: any) {
      toast({
        title: "Failed to send voice message",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  return (
    <ChatContext.Provider
      value={{
        activeRoom,
        messages,
        rooms,
        directChats,
        setActiveRoom,
        createRoom,
        joinRoom,
        sendMessage,
        sendImageMessage,
        sendAudioMessage,
        isLoading
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}
