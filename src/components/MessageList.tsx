
import { useRef, useEffect } from 'react';
import UserAvatar from "./UserAvatar";
import MessageReactions from "./MessageReactions";
import EnhancedTypingIndicator from "./EnhancedTypingIndicator";
import { formatMessage, formatTimeAgo } from "../utils/messageUtils";

interface Message {
  id: string;
  text: string;
  user_id: string;
  user_name?: string;
  timestamp: string;
  image_data?: string;
}

interface MessageListProps {
  messages: Message[];
  typingUsers: string[];
  reactions: Record<string, Array<{ emoji: string; user: string }>>;
  userName: string;
  onAddReaction: (messageId: string, emoji: string) => void;
  onRemoveReaction: (messageId: string, emoji: string) => void;
}

const MessageList = ({
  messages,
  typingUsers,
  reactions,
  userName,
  onAddReaction,
  onRemoveReaction,
}: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getUserNameFromMessage = (message: Message) => {
    if (message.user_name) {
      return message.user_name;
    }
    return message.user_id.split('_')[0];
  };

  const isMyMessage = (message: Message) => {
    if (message.user_name) {
      return message.user_name === userName;
    }
    return message.user_id.startsWith(userName + '_');
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-800 px-4 py-2">
      <div className="max-w-4xl mx-auto space-y-1">
        {messages.map((message) => {
          const messageUserName = getUserNameFromMessage(message);
          const isMyMsg = isMyMessage(message);
          
          return (
            <div key={message.id} className="animate-fade-in">
              <div className={`flex ${isMyMsg ? 'justify-end' : 'justify-start'} mb-1`}>
                <div className={`max-w-[70%] ${isMyMsg ? 'order-2' : 'order-1'}`}>
                  <div className={`px-4 py-2 rounded-2xl ${
                    isMyMsg 
                      ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 text-white rounded-br-md' 
                      : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600 rounded-bl-md'
                  }`}>
                    <div className="text-sm leading-relaxed">
                      {message.text && (
                        <span dangerouslySetInnerHTML={{ __html: formatMessage(message.text) }} />
                      )}
                      {message.image_data && (
                        <div className="mt-2">
                          <img 
                            src={message.image_data} 
                            alt="Shared image" 
                            className="max-w-full rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
                            onClick={() => window.open(message.image_data, '_blank')}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className={`flex items-center space-x-2 px-1 mb-2 ${isMyMsg ? 'justify-end' : 'justify-start'}`}>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {messageUserName} • {formatTimeAgo(message.timestamp)}
                </span>
              </div>

              {reactions[message.id] && reactions[message.id].length > 0 && (
                <div className={`flex ${isMyMsg ? 'justify-end' : 'justify-start'} mb-2`}>
                  <MessageReactions
                    messageId={message.id}
                    reactions={reactions[message.id] || []}
                    onAddReaction={onAddReaction}
                    onRemoveReaction={onRemoveReaction}
                    currentUser={userName}
                  />
                </div>
              )}
            </div>
          );
        })}
        
        <EnhancedTypingIndicator users={typingUsers} />
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default MessageList;
