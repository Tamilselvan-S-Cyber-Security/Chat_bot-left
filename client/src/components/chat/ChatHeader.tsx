import { useState } from 'react';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ProfileModal } from '@/components/profile/ProfileModal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Menu, Search, UserPlus, Info, Shield, Terminal, Users, UserCog } from 'lucide-react';

interface ChatHeaderProps {
  toggleSidebar: () => void;
}

export function ChatHeader({ toggleSidebar }: ChatHeaderProps) {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const { activeRoom } = useChat();
  const { user } = useAuth();

  const getOnlineCount = () => {
    if (!activeRoom?.members) return 0;
    return Object.keys(activeRoom.members).length;
  };

  const getRoomIcon = () => {
    if (!activeRoom) return <Users className="h-5 w-5 text-primary" />;
    
    if (activeRoom.name.includes('Security') || activeRoom.name.includes('Cyber')) {
      return <Shield className="h-5 w-5 text-primary" />;
    } else if (activeRoom.name.includes('CTF') || activeRoom.name.includes('Hack')) {
      return <Terminal className="h-5 w-5 text-primary" />;
    } else {
      return <Users className="h-5 w-5 text-primary" />;
    }
  };

  const getRoomCode = () => {
    if (!activeRoom) return '';
    return activeRoom.roomCode || (activeRoom.id.substring(0, 6).toUpperCase());
  };

  return (
    <>
      <div className="glass-dark border-b border-secondary py-3 px-4 sm:px-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="sm"
              className="md:hidden mr-3 text-xl"
              onClick={toggleSidebar}
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            {activeRoom && (
              <>
                <div className="bg-primary bg-opacity-20 rounded-lg p-2 mr-3 hidden sm:block">
                  {getRoomIcon()}
                </div>
                <div>
                  <h2 className="font-medium text-lg">{activeRoom.name}</h2>
                  <p className="text-xs text-text-secondary flex items-center">
                    <span className="flex items-center mr-3">
                      <span className="w-1.5 h-1.5 bg-status-online rounded-full mr-1"></span>
                      {getOnlineCount()} online
                    </span>
                    <span>Room ID: {getRoomCode()}</span>
                  </p>
                </div>
              </>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            {activeRoom && (
              <>
                <Button variant="ghost" size="sm" className="p-2 text-text-secondary hover:text-primary rounded-full">
                  <Search className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="sm" className="p-2 text-text-secondary hover:text-primary rounded-full">
                  <UserPlus className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="sm" className="p-2 text-text-secondary hover:text-primary rounded-full">
                  <Info className="h-5 w-5" />
                </Button>
              </>
            )}
            
            <Button 
              variant="ghost" 
              size="sm"
              className="p-2 text-text-secondary hover:text-primary rounded-full"
              onClick={() => setIsProfileModalOpen(true)}
            >
              <UserCog className="h-5 w-5" />
            </Button>
            
            <div className="relative">
              <Avatar>
                <AvatarImage src={user?.photoURL || ''} alt="User avatar" />
                <AvatarFallback>{user?.displayName?.[0] || 'U'}</AvatarFallback>
              </Avatar>
              <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-status-online ring-2 ring-dark"></span>
            </div>
          </div>
        </div>
      </div>
      
      <ProfileModal open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen} />
    </>
  );
}
