
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface MessageReaction {
  messageId: string;
  emoji: string;
  user: string;
}

export const useMessageReactions = (roomId: string, userName: string) => {
  const [reactions, setReactions] = useState<Record<string, MessageReaction[]>>({});
  const channelRef = useRef<any>(null);

  useEffect(() => {
    const channelName = `reactions_${roomId}`;
    
    channelRef.current = supabase
      .channel(channelName)
      .on('broadcast', { event: 'reaction' }, (payload) => {
        const { messageId, emoji, user, action } = payload.payload;
        
        setReactions(prev => {
          const messageReactions = prev[messageId] || [];
          
          if (action === 'add') {
            // Check if user already reacted with this emoji
            const existingReaction = messageReactions.find(r => r.emoji === emoji && r.user === user);
            if (!existingReaction) {
              return {
                ...prev,
                [messageId]: [...messageReactions, { messageId, emoji, user }]
              };
            }
          } else if (action === 'remove') {
            return {
              ...prev,
              [messageId]: messageReactions.filter(r => !(r.emoji === emoji && r.user === user))
            };
          }
          return prev;
        });
      })
      .subscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [roomId, userName]);

  const addReaction = (messageId: string, emoji: string) => {
    channelRef.current?.send({
      type: 'broadcast',
      event: 'reaction',
      payload: { messageId, emoji, user: userName, action: 'add' }
    });
  };

  const removeReaction = (messageId: string, emoji: string) => {
    channelRef.current?.send({
      type: 'broadcast',
      event: 'reaction',
      payload: { messageId, emoji, user: userName, action: 'remove' }
    });
  };

  return { reactions, addReaction, removeReaction };
};
