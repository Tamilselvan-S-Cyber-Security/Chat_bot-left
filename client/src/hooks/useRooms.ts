import { useState, useEffect } from 'react';
import { useChat } from './useChat';
import { ChatRoom } from '@/context/ChatContext';

export const useRooms = () => {
  const { rooms, isLoading, createRoom, joinRoom } = useChat();
  const [filteredRooms, setFilteredRooms] = useState<ChatRoom[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredRooms(rooms);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = rooms.filter(room => 
      room.name.toLowerCase().includes(query) || 
      (room.description && room.description.toLowerCase().includes(query))
    );
    
    setFilteredRooms(filtered);
  }, [rooms, searchQuery]);

  return {
    rooms: filteredRooms,
    allRooms: rooms,
    isLoading,
    searchQuery,
    setSearchQuery,
    createRoom,
    joinRoom
  };
};
