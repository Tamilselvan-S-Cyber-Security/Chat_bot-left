import { useState, useEffect } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Sidebar } from "@/components/chat/Sidebar";
import { ChatArea } from "@/components/chat/ChatArea";
import { useAuth } from "@/hooks/useAuth";
import { Helmet } from "react-helmet";

export default function ChatPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user, updateUserStatus } = useAuth();

  // Set user status to online when entering chat page
  useEffect(() => {
    if (user) {
      updateUserStatus('online');
    }

    // Set status to offline when user leaves
    const handleBeforeUnload = () => {
      if (user) {
        updateUserStatus('offline');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user, updateUserStatus]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <PageContainer 
      title="Chat" 
      description="Cyber Wolf Chat - Secure, Private, Real-time messaging"
      className="flex flex-col h-screen p-0 overflow-hidden"
    >
      <Helmet>
        <link href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css" rel="stylesheet" />
      </Helmet>
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />
        <ChatArea toggleSidebar={toggleSidebar} />
      </div>
    </PageContainer>
  );
}
