import { useState, useEffect } from "react";
import { Plus, MessageSquare, Users, X, Menu } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ChatRoom {
  id: string;
  name: string;
  lastMessage?: string;
  lastActivity?: string;
}

interface ChatSidebarProps {
  userName: string;
  onCreateRoom: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const ChatSidebar = ({ userName, onCreateRoom, isCollapsed = false, onToggleCollapse }: ChatSidebarProps) => {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const navigate = useNavigate();
  const { roomId } = useParams();

  const loadRooms = () => {
    const savedRooms = localStorage.getItem(`chatRooms_${userName}`);
    if (savedRooms) {
      setRooms(JSON.parse(savedRooms));
    }
  };

  useEffect(() => {
    loadRooms();
  }, [userName]);

  useEffect(() => {
    const handleStorageChange = () => {
      loadRooms();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('roomsUpdated', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('roomsUpdated', handleStorageChange);
    };
  }, [userName]);

  const saveRoomsToStorage = (updatedRooms: ChatRoom[]) => {
    localStorage.setItem(`chatRooms_${userName}`, JSON.stringify(updatedRooms));
    setRooms(updatedRooms);
    window.dispatchEvent(new CustomEvent('roomsUpdated'));
  };

  const removeRoom = (roomIdToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedRooms = rooms.filter(room => room.id !== roomIdToRemove);
    saveRoomsToStorage(updatedRooms);
    
    if (roomId === roomIdToRemove) {
      if (updatedRooms.length > 0) {
        const mostRecentRoom = updatedRooms.sort((a, b) => {
          const timeA = new Date(a.lastActivity || 0).getTime();
          const timeB = new Date(b.lastActivity || 0).getTime();
          return timeB - timeA;
        })[0];
        navigate(`/${mostRecentRoom.id}`);
      } else {
        navigate('/');
      }
    }
  };

  const handleRoomClick = (room: ChatRoom) => {
    navigate(`/${room.id}`);
    if (onToggleCollapse && window.innerWidth < 768) {
      onToggleCollapse();
    }
  };

  const handleCreateRoom = () => {
    if (newRoomName.trim()) {
      const newRoomId = Math.random().toString(36).substring(2, 8);
      
      const newRoom = {
        id: newRoomId,
        name: newRoomName.trim(),
        lastActivity: new Date().toISOString(),
        lastMessage: ""
      };
      
      const updatedRooms = [...rooms, newRoom];
      saveRoomsToStorage(updatedRooms);
      
      setNewRoomName("");
      setIsCreateDialogOpen(false);
      navigate(`/${newRoomId}`);
      onCreateRoom();
      
      if (onToggleCollapse && window.innerWidth < 768) {
        onToggleCollapse();
      }
    }
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className={`flex flex-col h-full transition-all duration-300 safe-area-top safe-area-bottom ${
      isCollapsed ? 'w-0 overflow-hidden md:w-80' : 'w-full'
    }`}>
      {/* Mobile Toggle Button */}
      {onToggleCollapse && (
        <button
          onClick={onToggleCollapse}
          className="md:hidden fixed top-4 left-4 z-50 p-2 bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 text-white rounded-lg shadow-lg touch-button"
        >
          <Menu size={20} />
        </button>
      )}

      {/* Header */}
      <div className="p-3 md:p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <h2 className="text-base md:text-lg font-semibold bg-gradient-to-r from-pink-600 via-purple-600 to-orange-600 bg-clip-text text-transparent">
            HCHAT
          </h2>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <button className="p-1.5 md:p-2 bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 hover:from-pink-600 hover:via-purple-600 hover:to-orange-600 text-white rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg touch-button">
                <Plus size={16} className="md:hidden" />
                <Plus size={20} className="hidden md:block" />
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md mx-4">
              <DialogHeader>
                <DialogTitle>Create New Room</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label htmlFor="roomName" className="block text-sm font-medium text-gray-700 mb-2">
                    Room Name
                  </label>
                  <input
                    id="roomName"
                    type="text"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleCreateRoom();
                      }
                    }}
                    placeholder="Enter room name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent touch-button"
                    autoFocus
                    maxLength={50}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => {
                      setIsCreateDialogOpen(false);
                      setNewRoomName("");
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors touch-button"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateRoom}
                    disabled={!newRoomName.trim()}
                    className="px-4 py-2 bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 hover:from-pink-600 hover:via-purple-600 hover:to-orange-600 disabled:from-gray-300 disabled:via-gray-300 disabled:to-gray-300 text-white rounded-lg transition-all duration-200 disabled:cursor-not-allowed touch-button"
                  >
                    Create Room
                  </button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400 truncate">
          Welcome back, <span className="font-semibold text-purple-600 dark:text-purple-400">{userName}</span>!
        </div>
      </div>

      {/* Room List */}
      <div className="flex-1 overflow-y-auto smooth-scroll">
        {rooms.length === 0 ? (
          <div className="p-3 md:p-4 text-center text-gray-500 dark:text-gray-400">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-pink-400 via-purple-400 to-orange-400 rounded-2xl flex items-center justify-center mx-auto mb-3 animate-float">
              <MessageSquare size={24} className="md:hidden text-white" />
              <MessageSquare size={32} className="hidden md:block text-white" />
            </div>
            <p className="text-sm md:text-base font-semibold mb-1">No conversations yet</p>
            <p className="text-xs md:text-sm">Create a new chat to get started</p>
          </div>
        ) : (
          rooms
            .sort((a, b) => {
              const timeA = new Date(a.lastActivity || 0).getTime();
              const timeB = new Date(b.lastActivity || 0).getTime();
              return timeB - timeA;
            })
            .map((room) => (
              <div
                key={room.id}
                onClick={() => handleRoomClick(room)}
                className={`p-3 md:p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-200 transform hover:scale-[1.01] relative group touch-button ${
                  roomId === room.id ? 'bg-gradient-to-r from-pink-100 to-purple-100 dark:from-gray-700 dark:to-gray-600 border-l-4 border-l-purple-500 shadow-lg' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center mb-1">
                      <div className="w-8 h-8 bg-gradient-to-br from-pink-400 via-purple-400 to-orange-400 rounded-lg flex items-center justify-center mr-2 shadow-sm flex-shrink-0">
                        <Users size={14} className="md:hidden text-white" />
                        <Users size={16} className="hidden md:block text-white" />
                      </div>
                      <h3 className="font-medium text-gray-800 dark:text-white truncate text-sm md:text-base">
                        {room.name}
                      </h3>
                    </div>
                    {room.lastMessage && (
                      <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 truncate ml-10">
                        {room.lastMessage}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    {room.lastActivity && (
                      <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                        {formatTime(room.lastActivity)}
                      </span>
                    )}
                    <button
                      onClick={(e) => removeRoom(room.id, e)}
                      className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-red-500 hover:text-red-700 dark:hover:text-red-300 touch-button"
                      title="Remove room"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
        )}
      </div>

      {/* Footer */}
      <div className="p-3 md:p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            by Hiscope Enterprises
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            All rights reserved
          </p>
        </div>
      </div>
    </div>
  );
};

// Export the updateRoomActivity function for use in other components
export const updateRoomName = (roomId: string, userName: string, firstMessage: string) => {
  const savedRooms = localStorage.getItem(`chatRooms_${userName}`);
  if (savedRooms) {
    const rooms = JSON.parse(savedRooms);
    const updatedRooms = rooms.map((room: ChatRoom) => {
      if (room.id === roomId) {
        return {
          ...room,
          name: firstMessage.length > 30 ? firstMessage.substring(0, 30) + "..." : firstMessage
        };
      }
      return room;
    });
    localStorage.setItem(`chatRooms_${userName}`, JSON.stringify(updatedRooms));
    window.dispatchEvent(new CustomEvent('roomsUpdated'));
  }
};

export default ChatSidebar;
