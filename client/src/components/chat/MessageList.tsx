import { ForwardedRef, memo } from 'react';
import { format } from 'date-fns';
import { ChatMessage } from '@/context/ChatContext';
import { User } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AudioPlayer } from '@/components/ui/audio-player';
import { Check, CheckCheck } from 'lucide-react';

interface MessageListProps {
  messages: ChatMessage[];
  currentUser: User | null;
  messagesEndRef: ForwardedRef<HTMLDivElement>;
}

function MessageListComponent({ messages, currentUser, messagesEndRef }: MessageListProps) {
  // Group messages by date
  const groupedMessages: { [date: string]: ChatMessage[] } = {};
  
  messages.forEach((message) => {
    const date = format(new Date(message.timestamp), 'yyyy-MM-dd');
    if (!groupedMessages[date]) {
      groupedMessages[date] = [];
    }
    groupedMessages[date].push(message);
  });

  const isCurrentUser = (senderId: string) => {
    return currentUser?.uid === senderId;
  };

  const getReadStatus = (message: ChatMessage) => {
    if (isCurrentUser(message.senderId)) {
      if (message.readBy.length > 1) {
        return <CheckCheck className="h-4 w-4 mr-1" />;
      } else {
        return <Check className="h-4 w-4 mr-1" />;
      }
    }
    return null;
  };

  const formatMessageTime = (timestamp: number) => {
    return format(new Date(timestamp), 'HH:mm');
  };

  const formatDateHeader = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return format(date, 'MMMM d, yyyy');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 hide-scrollbar" id="messages-container">
      {/* Render grouped messages by date */}
      {Object.keys(groupedMessages).map((date) => (
        <div key={date}>
          {/* Date Header */}
          <div className="flex justify-center mb-6">
            <div className="glass px-4 py-2 rounded-full text-sm text-text-secondary">
              {formatDateHeader(date)}
            </div>
          </div>
          
          {/* Messages for this date */}
          {groupedMessages[date].map((message) => (
            <div key={message.id} className="mb-6 message-new">
              {isCurrentUser(message.senderId) ? (
                // Current user's message (right side)
                <div className="flex items-start justify-end">
                  <div className="flex-1 max-w-3xl">
                    <div className="flex items-center justify-end mb-1">
                      <span className="text-xs text-text-secondary">{formatMessageTime(message.timestamp)}</span>
                      <span className="font-medium ml-2">You</span>
                    </div>
                    <div className="bg-primary bg-opacity-20 rounded-xl rounded-tr-none px-4 py-3 ml-auto">
                      {message.text && <p>{message.text}</p>}
                      
                      {message.imageUrl && (
                        <img 
                          src={message.imageUrl} 
                          alt="Shared image" 
                          className="w-full max-w-md rounded-lg mt-2"
                        />
                      )}
                      
                      {message.audioUrl && (
                        <AudioPlayer src={message.audioUrl} className="mt-2" />
                      )}
                    </div>
                    <div className="flex justify-end mt-1">
                      <span className="text-xs text-text-secondary flex items-center">
                        {getReadStatus(message)}
                        {message.readBy.length > 1 ? 'Read' : 'Delivered'}
                      </span>
                    </div>
                  </div>
                  <div className="flex-shrink-0 ml-3">
                    <Avatar>
                      <AvatarImage src={currentUser?.photoURL || ''} alt="Your avatar" />
                      <AvatarFallback>{currentUser?.displayName?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                  </div>
                </div>
              ) : (
                // Other user's message (left side)
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-3">
                    <Avatar>
                      <AvatarImage src={message.senderAvatar} alt={`${message.senderName}'s avatar`} />
                      <AvatarFallback>{message.senderName[0]}</AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1 max-w-3xl">
                    <div className="flex items-center mb-1">
                      <span className="font-medium mr-2">{message.senderName}</span>
                      <span className="text-xs text-text-secondary">{formatMessageTime(message.timestamp)}</span>
                    </div>
                    <div className="glass rounded-xl rounded-tl-none px-4 py-3">
                      {message.text && <p>{message.text}</p>}
                      
                      {message.imageUrl && (
                        <img 
                          src={message.imageUrl} 
                          alt="Shared image" 
                          className="w-full max-w-md rounded-lg mt-2"
                        />
                      )}
                      
                      {message.audioUrl && (
                        <AudioPlayer src={message.audioUrl} className="mt-2" />
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
      
      {/* Typing indicator (placeholder) */}
      {/* <div className="flex items-start">
        <div className="flex-shrink-0 mr-3">
          <Avatar>
            <AvatarImage src="" alt="User typing" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
        </div>
        <div className="glass rounded-xl rounded-tl-none px-4 py-2">
          <div className="flex space-x-1">
            <div className="w-2 h-2 rounded-full bg-text-secondary animate-pulse"></div>
            <div className="w-2 h-2 rounded-full bg-text-secondary animate-pulse delay-100"></div>
            <div className="w-2 h-2 rounded-full bg-text-secondary animate-pulse delay-200"></div>
          </div>
        </div>
      </div> */}
      
      {/* Ref for auto-scrolling */}
      <div ref={messagesEndRef} />
    </div>
  );
}

// Memo to prevent unnecessary re-renders
export const MessageList = memo(MessageListComponent);
