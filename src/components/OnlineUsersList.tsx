
import React from 'react';
import UserAvatar from './UserAvatar';

interface OnlineUsersListProps {
  users: string[];
  currentUser: string;
}

const OnlineUsersList: React.FC<OnlineUsersListProps> = ({ users, currentUser }) => {
  if (users.length === 0) return null;

  return (
    <div className="p-4 border-t border-pink-200 dark:border-gray-600 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-gray-800 dark:to-gray-700">
      <h3 className="text-sm font-semibold bg-gradient-to-r from-pink-600 via-purple-600 to-orange-600 bg-clip-text text-transparent mb-3">
        Online Users ({users.length})
      </h3>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {users.map((user, index) => {
          const isCurrentUser = user === currentUser;
          const activityStatus = Math.random() > 0.7 ? 'away' : 'online';
          
          return (
            <div key={index} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-pink-100 dark:hover:bg-gray-600 transition-colors">
              <div className="relative">
                <UserAvatar username={user} size="sm" />
                <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${
                  isCurrentUser || activityStatus === 'online' 
                    ? 'bg-green-500' 
                    : 'bg-yellow-500'
                }`}></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${
                  isCurrentUser 
                    ? 'bg-gradient-to-r from-pink-600 via-purple-600 to-orange-600 bg-clip-text text-transparent' 
                    : 'text-gray-700 dark:text-gray-300'
                }`}>
                  {isCurrentUser ? `${user} (You)` : user}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {isCurrentUser ? 'online' : activityStatus}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OnlineUsersList;
