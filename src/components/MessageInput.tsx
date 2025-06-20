
import { useState, useRef } from "react";
import { Send, Image } from "lucide-react";
import EmojiPicker from "./EmojiPicker";
import VoiceMessageButton from "./VoiceMessageButton";

interface MessageInputProps {
  onSendMessage: (message: string, imageData?: string) => Promise<void>;
  compressImage: (file: File, maxSizeKB?: number) => Promise<string>;
  onStartTyping?: () => void;
  onStopTyping?: () => void;
}

const MessageInput = ({ onSendMessage, compressImage, onStartTyping, onStopTyping }: MessageInputProps) => {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [processingImage, setProcessingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = async () => {
    if ((message.trim() || selectedImage) && !sending) {
      setSending(true);
      onStopTyping?.();
      try {
        console.log('Sending message with image:', !!selectedImage);
        await onSendMessage(message.trim(), selectedImage || undefined);
        setMessage("");
        setSelectedImage(null);
        console.log('Message sent successfully');
      } catch (error) {
        console.error('Error sending message:', error);
      } finally {
        setSending(false);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === 'Escape') {
      setMessage("");
      setSelectedImage(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    if (e.target.value.trim() && !sending) {
      onStartTyping?.();
    } else {
      onStopTyping?.();
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage(prev => prev + emoji);
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log('Selected file:', file.name, 'Type:', file.type, 'Size:', file.size, 'bytes');
      
      // Check if it's an image
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file (JPG, PNG, GIF, WebP, etc.)');
        return;
      }
      
      // Check file size (max 10MB for original file)
      if (file.size > 10 * 1024 * 1024) {
        alert('Image size should be less than 10MB');
        return;
      }
      
      setProcessingImage(true);
      try {
        // Compress to 300KB for better performance
        const compressedImage = await compressImage(file, 300);
        console.log('Image compressed successfully');
        setSelectedImage(compressedImage);
      } catch (error) {
        console.error('Error processing image:', error);
        alert('Failed to process image. Please try a different image or reduce the file size.');
      } finally {
        setProcessingImage(false);
      }
    }
    
    // Clear the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
  };

  return (
    <div className="space-y-3">
      {selectedImage && (
        <div className="relative inline-block">
          <img 
            src={selectedImage} 
            alt="Selected" 
            className="max-w-32 max-h-32 rounded-lg border-2 border-pink-200 shadow-lg"
          />
          <button
            onClick={removeSelectedImage}
            className="absolute -top-2 -right-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:from-pink-600 hover:to-purple-600 transition-all duration-200 shadow-lg transform hover:scale-110"
          >
            ×
          </button>
        </div>
      )}
      
      {processingImage && (
        <div className="text-sm text-transparent bg-gradient-to-r from-pink-600 via-purple-600 to-orange-600 bg-clip-text flex items-center space-x-2">
          <div className="animate-spin w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full"></div>
          <span>Processing image...</span>
        </div>
      )}
      
      <div className="flex items-center space-x-3">
        <div className="flex-1 relative">
          <input
            type="text"
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            onBlur={onStopTyping}
            placeholder="Type your message..."
            className="w-full px-4 py-3 rounded-xl border-2 border-pink-200 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-200/50 focus:shadow-lg focus:shadow-purple-200/50 transition-all duration-300 pr-12 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:border-purple-400 dark:focus:ring-purple-300/50"
            autoFocus
            disabled={sending || processingImage}
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <EmojiPicker onEmojiSelect={handleEmojiSelect} />
          </div>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 hover:from-pink-600 hover:via-purple-600 hover:to-orange-600 text-white p-3 rounded-xl transition-all duration-200 disabled:opacity-50 shadow-lg transform hover:scale-105 disabled:hover:scale-100"
          disabled={sending || processingImage}
          title="Share Image (Max 10MB)"
        >
          <Image size={20} />
        </button>
        
        <VoiceMessageButton onSendMessage={onSendMessage} />
        
        <button
          onClick={handleSend}
          disabled={(!message.trim() && !selectedImage) || sending || processingImage}
          className="bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 hover:from-pink-600 hover:via-purple-600 hover:to-orange-600 disabled:from-gray-300 disabled:via-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 shadow-lg"
        >
          {sending ? (
            <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
          ) : (
            <Send size={20} />
          )}
        </button>
      </div>
    </div>
  );
};

export default MessageInput;
