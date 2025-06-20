import { useRef, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import MessageInput from "./MessageInput";
import NameInput from "./NameInput";
import ChatSidebar from "./ChatSidebar";
import ChatHeader from "./ChatHeader";
import SearchBar from "./SearchBar";
import MessageList from "./MessageList";
import VoiceCall from "./VoiceCall";
import { useMessages } from "../hooks/useMessages";
import { useTypingIndicator } from "../hooks/useTypingIndicator";
import { useUserPresence } from "../hooks/useUserPresence";
import { useMessageReactions } from "../hooks/useMessageReactions";
import { useEnhancedSoundEffects } from "../hooks/useEnhancedSoundEffects";
import { useTheme } from "../contexts/ThemeContext";
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";

interface ChatRoomProps {
  roomId: string;
}

const ChatRoom = ({ roomId }: ChatRoomProps) => {
  const location = useLocation();
  const { toast } = useToast();
  const { messages, loading, sendMessage, compressImage } = useMessages(roomId);
  const [userName, setUserName] = useState<string>("");
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOnlineUsers, setShowOnlineUsers] = useState(false);
  const [isInCall, setIsInCall] = useState(false);

  const { typingUsers, startTyping, stopTyping } = useTypingIndicator(roomId, userName);
  const { onlineUsers } = useUserPresence(roomId, userName);
  const { reactions, addReaction, removeReaction } = useMessageReactions(roomId, userName);
  const { 
    soundEnabled, 
    toggleSound, 
    playMessageSound, 
    playJoinSound, 
    playLeaveSound, 
    playReactionSound 
  } = useEnhancedSoundEffects();
  const { theme, toggleTheme } = useTheme();

  const [prevMessagesLength, setPrevMessagesLength] = useState(0);
  const [prevOnlineUsersLength, setPrevOnlineUsersLength] = useState(0);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (messages.length > prevMessagesLength && prevMessagesLength > 0) {
      playMessageSound();
    }
    setPrevMessagesLength(messages.length);
  }, [messages.length, prevMessagesLength, playMessageSound]);

  useEffect(() => {
    if (onlineUsers.length > prevOnlineUsersLength && prevOnlineUsersLength > 0) {
      playJoinSound();
    } else if (onlineUsers.length < prevOnlineUsersLength && prevOnlineUsersLength > 0) {
      playLeaveSound();
    }
    setPrevOnlineUsersLength(onlineUsers.length);
  }, [onlineUsers.length, prevOnlineUsersLength, playJoinSound, playLeaveSound]);

  useEffect(() => {
    const savedUserName = localStorage.getItem('chatUserName');
    if (savedUserName) {
      setUserName(savedUserName);
      const sessionUserId = `${savedUserName}_${roomId}`;
      setCurrentUserId(sessionUserId);
    }
  }, [roomId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'k':
            e.preventDefault();
            setShowSearch(!showSearch);
            break;
          case 'u':
            e.preventDefault();
            setShowOnlineUsers(!showOnlineUsers);
            break;
        }
      }
      if (e.key === 'Escape') {
        setShowSearch(false);
        setSearchTerm("");
        setShowOnlineUsers(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showSearch, showOnlineUsers]);

  useEffect(() => {
    let startX = 0;
    let startY = 0;
    
    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };
    
    const handleTouchEnd = (e: TouchEvent) => {
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const deltaX = endX - startX;
      const deltaY = endY - startY;
      
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        if (deltaX > 0 && startX < 50) {
          setSidebarOpen(true);
        } else if (deltaX < 0 && sidebarOpen) {
          setSidebarOpen(false);
        }
      }
    };
    
    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [sidebarOpen]);

  const handleNameSet = (name: string) => {
    setUserName(name);
    localStorage.setItem('chatUserName', name);
    const sessionUserId = `${name}_${roomId}`;
    setCurrentUserId(sessionUserId);
  };

  const handleSendMessage = async (text: string, imageData?: string) => {
    try {
      await sendMessage(text, userName, imageData);
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReactionAdd = (messageId: string, emoji: string) => {
    addReaction(messageId, emoji);
    playReactionSound();
  };

  const handleEndCall = () => {
    setIsInCall(false);
  };

  const filteredMessages = messages.filter(message => 
    !searchTerm || 
    message.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (message.user_name || message.user_id.split('_')[0]).toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!userName) {
    return <NameInput onNameSet={handleNameSet} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="text-lg text-gray-600 dark:text-gray-300 flex items-center space-x-2">
          <div className="animate-spin w-6 h-6 border-2 border-gradient-to-r from-pink-500 via-purple-500 to-orange-500 border-t-transparent rounded-full"></div>
          <span className="text-center">Loading HCHAT...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="h-screen bg-gray-100 dark:bg-gray-900 flex overflow-hidden">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed md:relative z-30 transition-transform duration-300 ease-in-out h-full`}>
          <div className="bg-white dark:bg-gray-800 border-r border-gray-300 dark:border-gray-700 h-full w-80 md:w-80 sm:w-64 flex flex-col shadow-xl md:shadow-none">
            <ChatSidebar 
              userName={userName} 
              onCreateRoom={() => {}}
            />
          </div>
        </div>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Chat Container */}
        <div className="flex-1 flex flex-col h-screen">
          <ChatHeader
            roomId={roomId}
            userName={userName}
            isOnline={isOnline}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            showSearch={showSearch}
            setShowSearch={setShowSearch}
            soundEnabled={soundEnabled}
            toggleSound={toggleSound}
            theme={theme}
            toggleTheme={toggleTheme}
          />

          <SearchBar
            showSearch={showSearch}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />

          <MessageList
            messages={filteredMessages}
            typingUsers={typingUsers}
            reactions={reactions}
            userName={userName}
            onAddReaction={handleReactionAdd}
            onRemoveReaction={removeReaction}
          />

          {/* Message Input Area */}
          <div className="bg-gray-100 dark:bg-gray-800 p-4 border-t border-gray-300 dark:border-gray-700">
            <MessageInput 
              onSendMessage={handleSendMessage} 
              compressImage={compressImage}
              onStartTyping={startTyping}
              onStopTyping={stopTyping}
            />
          </div>
        </div>
      </div>
      
      {/* Voice Call Overlay */}
      <VoiceCall 
        roomId={roomId}
        userName={userName}
        isInCall={isInCall}
        onEndCall={handleEndCall}
      />
    </>
  );
};

export default ChatRoom;
