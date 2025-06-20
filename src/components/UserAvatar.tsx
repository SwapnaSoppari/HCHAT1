
import React from 'react';
import { generateUserColor, getInitials } from '../utils/avatarUtils';

interface UserAvatarProps {
  username: string;
  size?: 'sm' | 'md' | 'lg';
  showOnline?: boolean;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ username, size = 'md', showOnline = false }) => {
  const color = generateUserColor(username);
  const initials = getInitials(username);
  
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base'
  };

  return (
    <div className="relative">
      <div 
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center text-white font-semibold`}
        style={{ backgroundColor: color }}
      >
        {initials}
      </div>
      {showOnline && (
        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
      )}
    </div>
  );
};

export default UserAvatar;
