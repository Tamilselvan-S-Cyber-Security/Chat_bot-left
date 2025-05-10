import { useState, useRef } from 'react';
import { useChat } from '@/hooks/useChat';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { VoiceRecorder } from '@/components/ui/voice-recorder';
import { useToast } from '@/hooks/use-toast';
import { Image, PaperclipIcon, Send, Smile } from 'lucide-react';

export function MessageInput() {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const { sendMessage, sendImageMessage, sendAudioMessage } = useChat();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    try {
      await sendMessage(message.trim());
      setMessage('');
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid file type',
          description: 'Only image files are supported',
          variant: 'destructive'
        });
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Maximum file size is 5MB',
          variant: 'destructive'
        });
        return;
      }
      
      try {
        await sendImageMessage(file);
        
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (error) {
        console.error('Failed to upload image:', error);
      }
    }
  };

  const handleAudioComplete = async (blob: Blob) => {
    try {
      setIsRecording(false);
      await sendAudioMessage(blob);
    } catch (error) {
      console.error('Failed to send audio message:', error);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  return (
    <div className="glass-dark border-t border-secondary p-4">
      <div className="flex items-end">
        <Button 
          size="sm" 
          variant="ghost" 
          className="p-2 text-text-secondary hover:text-primary mr-2"
        >
          <Smile className="h-5 w-5" />
        </Button>
        
        <div className="relative flex-1">
          <Textarea 
            ref={textareaRef}
            placeholder="Type a message..." 
            className="w-full px-4 py-3 max-h-32 rounded-lg bg-dark-light border border-secondary focus:border-primary resize-none pr-24"
            rows={1}
            value={message}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
          />
          
          <div className="absolute right-2 bottom-2 flex items-center space-x-2">
            <Button 
              size="sm" 
              variant="ghost" 
              className="p-1.5 text-text-secondary hover:text-primary"
              onClick={handleImageUpload}
            >
              <Image className="h-5 w-5" />
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileChange}
              />
            </Button>
            
            <Button 
              size="sm" 
              variant="ghost" 
              className="p-1.5 text-text-secondary hover:text-primary"
            >
              <PaperclipIcon className="h-5 w-5" />
            </Button>
            
            {isRecording ? (
              <VoiceRecorder 
                onRecordingComplete={handleAudioComplete} 
              />
            ) : (
              <Button
                size="sm"
                variant="ghost"
                className="p-1.5 text-text-secondary hover:text-primary"
                onClick={() => setIsRecording(true)}
              >
                <i className="ri-mic-line text-lg"></i>
              </Button>
            )}
          </div>
        </div>
        
        <Button 
          className="p-3 bg-primary hover:bg-opacity-90 rounded-full ml-2 transition"
          onClick={handleSendMessage}
          disabled={!message.trim() && !isRecording}
        >
          <Send className="h-5 w-5 text-white" />
        </Button>
      </div>
    </div>
  );
}
