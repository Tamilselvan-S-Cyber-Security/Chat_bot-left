import { useState } from 'react';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useRooms } from '@/hooks/useRooms';
import { format } from 'date-fns';
import { CreateRoomModal } from './CreateRoomModal';
import { Search, Shield, Terminal, Group, ChevronRight } from 'lucide-react';
import { ChatRoom, DirectChat } from '@/context/ChatContext';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const [isCreateRoomModalOpen, setIsCreateRoomModalOpen] = useState(false);
  const [joinRoomId, setJoinRoomId] = useState('');
  const { rooms, directChats, setActiveRoom, joinRoom } = useChat();
  const { searchQuery, setSearchQuery } = useRooms();
  const { user } = useAuth();

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinRoomId.trim()) return;
    
    try {
      await joinRoom(joinRoomId.trim());
      setJoinRoomId('');
    } catch (error) {
      console.error('Failed to join room:', error);
    }
  };

  const handleRoomSelect = (room: ChatRoom) => {
    setActiveRoom(room);
    if (window.innerWidth < 768) {
      onToggle();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-status-online';
      case 'away': return 'bg-status-away';
      default: return 'bg-status-offline';
    }
  };

  return (
    <>
      <aside className={`w-72 glass-dark border-r border-secondary flex-shrink-0 h-full ${isOpen ? 'block' : 'hidden'} md:block`}>
        <div className="flex flex-col h-full">
          {/* Room Actions */}
          <div className="p-4 border-b border-secondary">
            <Button 
              className="w-full py-2 px-4 bg-primary hover:bg-opacity-90 text-white font-medium rounded-lg transition flex items-center justify-center"
              onClick={() => setIsCreateRoomModalOpen(true)}
            >
              <ChevronRight className="h-4 w-4 mr-2" /> Create Room
            </Button>
            
            <form onSubmit={handleJoinRoom} className="mt-3 relative">
              <Input 
                type="text" 
                placeholder="Enter Room ID to Join" 
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-dark-light border border-secondary focus:border-primary"
                value={joinRoomId}
                onChange={(e) => setJoinRoomId(e.target.value)}
              />
              <div className="absolute left-3 top-2.5 text-text-secondary">
                <Shield className="h-4 w-4" />
              </div>
            </form>
          </div>
          
          {/* Search */}
          <div className="px-4 py-2 relative">
            <Input 
              type="text" 
              placeholder="Search..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-dark-light border border-secondary focus:border-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute left-7 top-5 text-text-secondary">
              <Search className="h-4 w-4" />
            </div>
          </div>
          
          {/* Chat Rooms List */}
          <div className="flex-1 overflow-y-auto hide-scrollbar p-2">
            <h3 className="text-xs uppercase font-semibold text-text-secondary px-3 pt-2 pb-1">Your Rooms</h3>
            
            {rooms.length === 0 ? (
              <div className="text-center p-3">
                <p className="text-sm text-text-secondary">No rooms yet</p>
              </div>
            ) : (
              rooms.map((room) => (
                <div 
                  key={room.id}
                  className={`glass hover:bg-opacity-10 p-3 rounded-lg mb-2 cursor-pointer transition group ${
                    room.id === room.id ? 'border-l-4 border-primary' : ''
                  }`}
                  onClick={() => handleRoomSelect(room)}
                >
                  <div className="flex items-center">
                    <div className="bg-primary bg-opacity-20 rounded-lg p-2 mr-3">
                      {room.name.includes('Security') || room.name.includes('Cyber') ? (
                        <Shield className="h-5 w-5 text-primary" />
                      ) : room.name.includes('CTF') || room.name.includes('Hack') ? (
                        <Terminal className="h-5 w-5 text-primary" />
                      ) : (
                        <Group className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{room.name}</h4>
                      {room.lastMessage ? (
                        <p className="text-sm text-text-secondary truncate">
                          {room.lastMessage.senderId === user?.uid ? 'You: ' : `${room.lastMessage.senderName.split(' ')[0]}: `}
                          {room.lastMessage.text}
                        </p>
                      ) : (
                        <p className="text-sm text-text-secondary truncate">No messages yet</p>
                      )}
                    </div>
                    {room.lastMessage && (
                      <div className="text-xs text-text-secondary">
                        {format(new Date(room.lastMessage.timestamp), 'HH:mm')}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            
            <h3 className="text-xs uppercase font-semibold text-text-secondary px-3 pt-4 pb-1">Direct Messages</h3>
            
            {directChats.length === 0 ? (
              <div className="text-center p-3">
                <p className="text-sm text-text-secondary">No direct messages yet</p>
              </div>
            ) : (
              directChats.map((chat) => (
                <div 
                  key={chat.id}
                  className="glass hover:bg-opacity-10 p-3 rounded-lg mb-2 cursor-pointer transition group"
                >
                  <div className="flex items-center">
                    <div className="relative mr-3">
                      {chat.userPhotoURL ? (
                        <img 
                          src={chat.userPhotoURL}
                          alt="User avatar" 
                          className="w-9 h-9 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-primary bg-opacity-20 flex items-center justify-center">
                          <span className="text-primary font-semibold">
                            {chat.userDisplayName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <span className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ${getStatusColor(chat.userStatus)} ring-2 ring-dark`}></span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{chat.userDisplayName}</h4>
                      {chat.lastMessage ? (
                        <p className="text-sm text-text-secondary truncate">
                          {chat.lastMessage.senderId === user?.uid ? 'You: ' : ''}
                          {chat.lastMessage.text}
                        </p>
                      ) : (
                        <p className="text-sm text-text-secondary truncate">No messages yet</p>
                      )}
                    </div>
                    {chat.lastMessage && (
                      <div className="text-xs text-text-secondary">
                        {format(new Date(chat.lastMessage.timestamp), 'HH:mm')}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* Bottom Actions */}
          <div className="p-4 border-t border-secondary">
            <div className="text-center text-xs text-text-secondary mb-2">
              Developed by S Tamarind, Cyber Security Researcher
            </div>
            <Button variant="secondary" className="w-full py-2 px-4 glass hover:bg-opacity-15 text-text-primary font-medium rounded-lg transition flex items-center justify-center">
              <Shield className="h-4 w-4 mr-2" /> App Settings
            </Button>
          </div>
        </div>
      </aside>
      
      <CreateRoomModal open={isCreateRoomModalOpen} onOpenChange={setIsCreateRoomModalOpen} />
    </>
  );
}
