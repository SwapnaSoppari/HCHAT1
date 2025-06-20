
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UserPresence {
  user: string;
  online_at: string;
}

export const useUserPresence = (roomId: string, userName: string) => {
  const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([]);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    const channelName = `presence_${roomId}`;
    
    channelRef.current = supabase
      .channel(channelName)
      .on('presence', { event: 'sync' }, () => {
        const newState = channelRef.current.presenceState();
        const users = Object.keys(newState).map(key => newState[key][0]);
        setOnlineUsers(users);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          const presenceTrackStatus = await channelRef.current.track({
            user: userName,
            online_at: new Date().toISOString(),
          });
          console.log('Presence track status:', presenceTrackStatus);
        }
      });

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [roomId, userName]);

  return { onlineUsers };
};
