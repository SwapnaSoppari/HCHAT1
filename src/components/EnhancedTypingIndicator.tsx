
import React from 'react';

interface EnhancedTypingIndicatorProps {
  users: string[];
}

const EnhancedTypingIndicator: React.FC<EnhancedTypingIndicatorProps> = ({ users }) => {
  if (users.length === 0) return null;

  const displayText = users.length === 1 
    ? `${users[0]} is typing...`
    : users.length === 2
    ? `${users[0]} and ${users[1]} are typing...`
    : `${users[0]} and ${users.length - 1} others are typing...`;

  return (
    <div className="flex items-center px-4 py-2 text-sm text-gray-500 dark:text-gray-400 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-xl mx-2 shadow-sm border border-pink-100 dark:border-gray-600">
      <div className="flex space-x-1 mr-3">
        <div className="w-2 h-2 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
      <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-orange-600 bg-clip-text text-transparent font-medium">
        {displayText}
      </span>
    </div>
  );
};

export default EnhancedTypingIndicator;
