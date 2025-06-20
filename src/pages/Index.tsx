
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ChatRoom from "../components/ChatRoom";
import InstallPrompt from "../components/InstallPrompt";

const Index = () => {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const [currentInput, setCurrentInput] = useState("");
  const [roomName, setRoomName] = useState("");
  const [userName, setUserName] = useState("");
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);

  useEffect(() => {
    const savedUserName = localStorage.getItem('chatUserName');
    if (savedUserName) {
      setUserName(savedUserName);
    }
  }, []);

  const generateRoomId = () => {
    return Math.random().toString(36).substring(2, 8);
  };

  const handleFirstMessage = async (message: string) => {
    if (message.trim() && userName.trim() && !roomId && !isCreatingRoom) {
      setIsCreatingRoom(true);
      
      try {
        const newRoomId = generateRoomId();
        
        // Save username
        localStorage.setItem('chatUserName', userName.trim());
        
        // Create room entry in localStorage
        const savedRooms = localStorage.getItem(`chatRooms_${userName.trim()}`);
        const rooms = savedRooms ? JSON.parse(savedRooms) : [];
        
        const newRoom = {
          id: newRoomId,
          name: roomName.trim() || message.substring(0, 30) + (message.length > 30 ? "..." : ""),
          lastActivity: new Date().toISOString(),
          lastMessage: message
        };
        
        rooms.push(newRoom);
        localStorage.setItem(`chatRooms_${userName.trim()}`, JSON.stringify(rooms));
        
        // Dispatch custom event to notify sidebar
        window.dispatchEvent(new CustomEvent('roomsUpdated'));
        
        navigate(`/${newRoomId}`);
      } finally {
        setIsCreatingRoom(false);
      }
    }
  };

  const handleJoinRoom = () => {
    if (userName.trim()) {
      localStorage.setItem('chatUserName', userName.trim());
    }
  };

  if (roomId) {
    return (
      <>
        <ChatRoom roomId={roomId} />
        <InstallPrompt />
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-orange-100 flex items-center justify-center p-2 sm:p-4 lg:p-8 safe-area-top safe-area-bottom">
        <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl">
          <div className="text-center mb-8 sm:mb-12">
            {/* HCHAT Logo */}
            <div className="inline-flex items-center justify-center mb-4 sm:mb-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-pink-500 via-purple-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-2xl transform rotate-12 hover:rotate-0 transition-transform duration-300 touch-button">
                <span className="text-2xl sm:text-3xl font-bold text-white">H</span>
              </div>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-orange-600 bg-clip-text text-transparent mb-3 sm:mb-4">
              HCHAT
            </h1>
            <p className="text-gray-600 text-base sm:text-lg mb-2 px-2">
              Hiscope Chat - Your instant messaging solution
            </p>
            <p className="text-xs sm:text-sm text-gray-500 px-2">
              Enter your name and type your first message to get started
            </p>
          </div>
          
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-8 border border-pink-100 mx-2 sm:mx-0">
            <div className="space-y-4 sm:space-y-6">
              <div>
                <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name *
                </label>
                <input
                  id="userName"
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 sm:px-6 py-3 text-sm sm:text-base rounded-xl sm:rounded-2xl border-2 border-pink-200 focus:border-purple-400 focus:outline-none transition-all duration-300 focus:shadow-lg focus:shadow-purple-200/50 touch-button"
                  maxLength={30}
                  disabled={isCreatingRoom}
                  autoFocus
                />
              </div>

              <div>
                <label htmlFor="roomName" className="block text-sm font-medium text-gray-700 mb-2">
                  Room Name (Optional)
                </label>
                <input
                  id="roomName"
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="Enter room name (e.g., Team Meeting, Study Group)"
                  className="w-full px-4 sm:px-6 py-3 text-sm sm:text-base rounded-xl sm:rounded-2xl border-2 border-pink-200 focus:border-purple-400 focus:outline-none transition-all duration-300 focus:shadow-lg focus:shadow-purple-200/50 touch-button"
                  maxLength={50}
                  disabled={isCreatingRoom}
                />
              </div>
              
              <div className="relative">
                <label htmlFor="firstMessage" className="block text-sm font-medium text-gray-700 mb-2">
                  First Message
                </label>
                <div className="relative">
                  <input
                    id="firstMessage"
                    type="text"
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !isCreatingRoom) {
                        handleFirstMessage(currentInput);
                      }
                    }}
                    placeholder="Type your first message here..."
                    className="w-full px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-lg rounded-xl sm:rounded-2xl border-2 border-pink-200 focus:border-purple-400 focus:outline-none transition-all duration-300 focus:shadow-lg focus:shadow-purple-200/50 pr-16 sm:pr-24 touch-button"
                    disabled={isCreatingRoom || !userName.trim()}
                  />
                  <div className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2">
                    <button
                      onClick={() => handleFirstMessage(currentInput)}
                      disabled={!currentInput.trim() || !userName.trim() || isCreatingRoom}
                      className="bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 hover:from-pink-600 hover:via-purple-600 hover:to-orange-600 disabled:from-gray-300 disabled:via-gray-300 disabled:to-gray-300 text-white px-4 sm:px-8 py-2 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-300 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 text-sm sm:text-base touch-button"
                    >
                      {isCreatingRoom ? 'Creating...' : 'Start'}
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="text-center text-xs sm:text-sm text-gray-500 space-y-1">
                <p className="flex items-center justify-center space-x-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  <span>No registration • No login • No data stored</span>
                </p>
                <p className="flex items-center justify-center space-x-2">
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></span>
                  <span>Share the URL to invite others</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <InstallPrompt />
    </>
  );
};

export default Index;
