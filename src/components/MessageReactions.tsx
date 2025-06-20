
import React, { useState } from 'react';

interface MessageReactionsProps {
  messageId: string;
  reactions: Array<{ emoji: string; user: string }>;
  onAddReaction: (messageId: string, emoji: string) => void;
  onRemoveReaction: (messageId: string, emoji: string) => void;
  currentUser: string;
}

const MessageReactions: React.FC<MessageReactionsProps> = ({
  messageId,
  reactions,
  onAddReaction,
  onRemoveReaction,
  currentUser
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const quickEmojis = ['👍', '❤️', '😂', '😮', '😢', '😡', '🔥', '💯', '🎉', '👏'];

  const reactionCounts = reactions.reduce((acc, reaction) => {
    acc[reaction.emoji] = (acc[reaction.emoji] || []).concat(reaction.user);
    return acc;
  }, {} as Record<string, string[]>);

  const handleReactionClick = (emoji: string) => {
    const users = reactionCounts[emoji] || [];
    if (users.includes(currentUser)) {
      onRemoveReaction(messageId, emoji);
    } else {
      onAddReaction(messageId, emoji);
    }
  };

  return (
    <div className="flex flex-wrap gap-1 mt-1 relative">
      {Object.entries(reactionCounts).map(([emoji, users]) => (
        <button
          key={emoji}
          onClick={() => handleReactionClick(emoji)}
          className={`px-2 py-1 rounded-full text-xs flex items-center space-x-1 transition-all duration-200 transform hover:scale-105 shadow-sm ${
            users.includes(currentUser)
              ? 'bg-gradient-to-r from-pink-100 via-purple-100 to-orange-100 text-purple-800 border-2 border-purple-300 shadow-lg'
              : 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 hover:from-pink-50 hover:to-purple-50 border border-gray-200 hover:border-pink-300'
          }`}
        >
          <span className="text-sm">{emoji}</span>
          <span className="font-semibold">{users.length}</span>
        </button>
      ))}
      
      <div className="relative">
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="px-2 py-1 rounded-full text-xs bg-gradient-to-r from-pink-100 to-purple-100 hover:from-pink-200 hover:to-purple-200 text-purple-600 border border-pink-200 hover:border-purple-300 transition-all duration-200 transform hover:scale-105 shadow-sm"
        >
          +
        </button>
        
        {showPicker && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setShowPicker(false)}
            />
            <div className="absolute bottom-8 left-0 z-20 bg-white border-2 border-pink-200 rounded-xl shadow-2xl p-3 flex flex-wrap gap-1 max-w-48 backdrop-blur-sm bg-white/95">
              {quickEmojis.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => {
                    handleReactionClick(emoji);
                    setShowPicker(false);
                  }}
                  className="p-2 hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 rounded-lg text-lg transition-all duration-200 transform hover:scale-125"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MessageReactions;
