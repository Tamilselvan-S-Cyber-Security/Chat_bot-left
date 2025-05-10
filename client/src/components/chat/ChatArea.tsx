import { useEffect, useRef, useState } from 'react';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';

interface ChatAreaProps {
  toggleSidebar: () => void;
}

export function ChatArea({ toggleSidebar }: ChatAreaProps) {
  const { activeRoom, messages } = useChat();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messages.length && messagesEndRef.current) {
      // On first load or room change, scroll immediately
      if (isFirstLoad) {
        messagesEndRef.current.scrollIntoView();
        setIsFirstLoad(false);
      } else {
        // For new messages, scroll with animation
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [messages, isFirstLoad]);

  // Reset first load flag when room changes
  useEffect(() => {
    setIsFirstLoad(true);
  }, [activeRoom]);

  // If no active room, show welcome screen
  if (!activeRoom) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">Welcome to Cyber Wolf Chat</h2>
          <p className="text-text-secondary mb-6">
            Select a room from the sidebar or create a new room to start chatting.
          </p>
          <div className="glass p-4 rounded-lg text-sm">
            <p className="text-primary mb-2">🔒 End-to-end secure messaging</p>
            <p className="text-text-secondary">
              Your messages are encrypted and secure. Share information with confidence.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 flex flex-col h-full overflow-hidden">
      <ChatHeader toggleSidebar={toggleSidebar} />
      
      <MessageList messages={messages} currentUser={user} messagesEndRef={messagesEndRef} />
      
      <MessageInput />
    </main>
  );
}
