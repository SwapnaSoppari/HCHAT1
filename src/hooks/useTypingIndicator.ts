
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useTypingIndicator = (roomId: string, userName: string) => {
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const channelRef = useRef<any>(null);

  useEffect(() => {
    const channelName = `typing_${roomId}`;
    
    channelRef.current = supabase
      .channel(channelName)
      .on('broadcast', { event: 'typing' }, (payload) => {
        const { user, typing } = payload.payload;
        if (user !== userName) {
          setTypingUsers(prev => {
            if (typing) {
              return prev.includes(user) ? prev : [...prev, user];
            } else {
              return prev.filter(u => u !== user);
            }
          });
        }
      })
      .subscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [roomId, userName]);

  const startTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      channelRef.current?.send({
        type: 'broadcast',
        event: 'typing',
        payload: { user: userName, typing: true }
      });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      channelRef.current?.send({
        type: 'broadcast',
        event: 'typing',
        payload: { user: userName, typing: false }
      });
    }, 2000);
  };

  const stopTyping = () => {
    if (isTyping) {
      setIsTyping(false);
      channelRef.current?.send({
        type: 'broadcast',
        event: 'typing',
        payload: { user: userName, typing: false }
      });
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  return { typingUsers, startTyping, stopTyping };
};
