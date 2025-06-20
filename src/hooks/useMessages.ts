
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Message = Database['public']['Tables']['messages']['Row'] & {
  user_name?: string;
  image_data?: string; // This will only exist in memory, not in DB
  is_image_only?: boolean;
};

export const useMessages = (roomId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('room_id', roomId)
          .order('timestamp', { ascending: true });

        if (error) {
          console.error('Error fetching messages:', error);
        } else {
          setMessages(data || []);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoading(false);
      }
    };

    const setupRealtimeSubscription = () => {
      // Create a unique channel name to avoid conflicts
      const channelName = `messages_${roomId}_${Date.now()}`;
      
      channelRef.current = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `room_id=eq.${roomId}`,
          },
          (payload) => {
            console.log('New text message received:', payload);
            setMessages((current) => [...current, payload.new as Message]);
          }
        )
        .on('broadcast', { event: 'image_message' }, (payload) => {
          console.log('Image message received via broadcast:', payload);
          // Add image message to local state only (not persisted)
          const imageMessage: Message = {
            id: `temp_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
            room_id: roomId,
            text: payload.payload.text || '[Image]',
            user_id: payload.payload.user_id,
            timestamp: new Date().toISOString(),
            image_data: payload.payload.image_data,
            is_image_only: !payload.payload.text || payload.payload.text.trim() === '',
            user_name: payload.payload.user_name,
          };
          console.log('Adding image message to state:', imageMessage);
          setMessages((current) => [...current, imageMessage]);
        })
        .subscribe((status) => {
          console.log('Channel subscription status:', status);
        });
    };

    // Fetch initial messages and setup subscription
    fetchMessages().then(() => {
      setupRealtimeSubscription();
    });

    // Cleanup function
    return () => {
      if (channelRef.current) {
        console.log('Cleaning up channel subscription');
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [roomId]);

  const compressImage = (file: File, maxSizeKB: number = 300): Promise<string> => {
    return new Promise((resolve, reject) => {
      console.log('Starting image compression for:', file.name, 'Size:', file.size, 'bytes');
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        console.log('Original image dimensions:', img.width, 'x', img.height);
        
        // Calculate new dimensions (max 800px for better compression)
        let { width, height } = img;
        const maxDimension = 800;
        
        if (width > height) {
          if (width > maxDimension) {
            height = (height * maxDimension) / width;
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = (width * maxDimension) / height;
            height = maxDimension;
          }
        }

        console.log('Resized dimensions:', width, 'x', height);
        
        canvas.width = width;
        canvas.height = height;

        // Draw image with better quality
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);
        }
        
        // Start with moderate quality
        let quality = 0.8;
        let result = canvas.toDataURL('image/jpeg', quality);
        
        // Calculate actual size in KB
        const sizeInKB = Math.round((result.length * 3) / 4 / 1024);
        console.log('Initial compressed size:', sizeInKB, 'KB at quality:', quality);
        
        // Reduce quality if needed
        while (sizeInKB > maxSizeKB && quality > 0.1) {
          quality -= 0.1;
          result = canvas.toDataURL('image/jpeg', quality);
          const newSizeKB = Math.round((result.length * 3) / 4 / 1024);
          console.log('Quality:', quality.toFixed(1), 'Size:', newSizeKB, 'KB');
          if (newSizeKB <= maxSizeKB) break;
        }
        
        const finalSizeKB = Math.round((result.length * 3) / 4 / 1024);
        console.log('Final compressed image size:', finalSizeKB, 'KB');
        resolve(result);
      };

      img.onerror = (error) => {
        console.error('Error loading image:', error);
        reject(new Error('Failed to load image'));
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const sendMessage = async (text: string, userName: string, imageData?: string) => {
    try {
      const userId = `${userName}_${roomId}`;
      
      if (imageData) {
        // Send image via broadcast (real-time only, not stored in DB)
        console.log('Attempting to send image message via broadcast');
        const imageSizeKB = Math.round((imageData.length * 3) / 4 / 1024);
        console.log('Image data size:', imageSizeKB, 'KB');
        
        if (!channelRef.current) {
          console.error('Channel not available for broadcast');
          throw new Error('Failed to send image - channel not available');
        }

        const broadcastPayload = {
          user_id: userId,
          user_name: userName,
          image_data: imageData,
          text: text.trim() || '',
        };

        console.log('Sending broadcast with payload keys:', Object.keys(broadcastPayload));
        
        const result = await channelRef.current.send({
          type: 'broadcast',
          event: 'image_message',
          payload: broadcastPayload
        });
        
        console.log('Broadcast send result:', result);
        
        if (result !== 'ok') {
          throw new Error(`Failed to send image - broadcast failed: ${result}`);
        }
      } 
      
      if (text.trim()) {
        // Send text message to database
        console.log('Sending text message to database');
        const messageData = {
          room_id: roomId,
          text: text,
          user_id: userId,
        };
        
        const { error } = await supabase
          .from('messages')
          .insert(messageData);

        if (error) {
          console.error('Error sending text message:', error);
          throw error;
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  return { messages, loading, sendMessage, compressImage };
};
