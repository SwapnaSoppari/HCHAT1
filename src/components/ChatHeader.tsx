
import { useState } from 'react';
import { Menu, X, Moon, Sun, Volume2, VolumeX, Users, Copy, Search, Wifi, WifiOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import GlobalUserCounter from './GlobalUserCounter';

interface ChatHeaderProps {
  roomId: string;
  userName: string;
  isOnline: boolean;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  showSearch: boolean;
  setShowSearch: (show: boolean) => void;
  soundEnabled: boolean;
  toggleSound: () => void;
  theme: string;
  toggleTheme: () => void;
}

const ChatHeader = ({
  roomId,
  userName,
  isOnline,
  sidebarOpen,
  setSidebarOpen,
  showSearch,
  setShowSearch,
  soundEnabled,
  toggleSound,
  theme,
  toggleTheme,
}: ChatHeaderProps) => {
  const { toast } = useToast();

  const copyRoomUrl = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast({
      title: "Success",
      description: "Room URL copied to clipboard!",
    });
  };

  const handleLeaveRoom = () => {
    localStorage.removeItem('chatUserName');
    window.location.href = '/';
  };

  return (
    <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 dark:from-pink-600 dark:via-purple-600 dark:to-orange-600 text-white p-3 flex items-center justify-between shadow-sm">
      <div className="flex items-center flex-1 min-w-0">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg mr-3 md:hidden"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        
        <div className="w-10 h-10 bg-gradient-to-r from-white/20 to-white/30 rounded-full flex items-center justify-center mr-3">
          <span className="text-lg font-bold">H</span>
        </div>
        
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-semibold truncate">
            Room {roomId}
          </h1>
          <div className="text-sm text-white/80 flex items-center space-x-2">
            <span>You are: {userName}</span>
            <GlobalUserCounter />
            <div className={`flex items-center space-x-1 ${isOnline ? 'text-white/90' : 'text-red-300'}`}>
              {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setShowSearch(!showSearch)}
          className={`p-2 rounded-lg ${showSearch ? 'bg-white/20' : 'hover:bg-white/20'}`}
        >
          <Search size={18} />
        </button>
        <button
          onClick={copyRoomUrl}
          className="p-2 hover:bg-white/20 rounded-lg"
          title="Copy room URL to share"
        >
          <Copy size={18} />
        </button>
        <button
          onClick={handleLeaveRoom}
          className="p-2 hover:bg-white/20 rounded-lg"
          title="Leave room"
        >
          <Users size={18} />
        </button>
        <button
          onClick={toggleSound}
          className={`p-2 rounded-lg ${soundEnabled ? 'text-white' : 'text-white/60'} hover:bg-white/20`}
        >
          {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>
        <button
          onClick={toggleTheme}
          className="p-2 hover:bg-white/20 rounded-lg"
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
