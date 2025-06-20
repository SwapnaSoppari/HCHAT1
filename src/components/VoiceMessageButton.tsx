
import React from 'react';
import { Mic, MicOff, Loader } from 'lucide-react';
import { useVoiceMessage } from '@/hooks/useVoiceMessage';

interface VoiceMessageButtonProps {
  onSendMessage: (text: string, audioData?: string) => Promise<void>;
}

const VoiceMessageButton: React.FC<VoiceMessageButtonProps> = ({ onSendMessage }) => {
  const { 
    isRecording, 
    isTranscribing, 
    transcript, 
    startRecording, 
    stopRecording, 
    cancelRecording 
  } = useVoiceMessage({ onSendMessage });

  const handleClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        disabled={isTranscribing}
        className={`p-3 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg ${
          isRecording 
            ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
            : 'bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 hover:from-pink-600 hover:via-purple-600 hover:to-orange-600 text-white'
        } ${isTranscribing ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isTranscribing ? (
          <Loader size={20} className="animate-spin" />
        ) : isRecording ? (
          <MicOff size={20} />
        ) : (
          <Mic size={20} />
        )}
      </button>
      
      {isRecording && (
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 border-2 border-red-200 rounded-xl p-4 shadow-2xl min-w-64 max-w-sm">
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-red-600 dark:text-red-400">Recording...</span>
            </div>
            
            {transcript && (
              <div className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded-lg p-2 max-h-20 overflow-y-auto">
                "{transcript}"
              </div>
            )}
            
            <div className="flex space-x-2">
              <button
                onClick={stopRecording}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
              >
                Send
              </button>
              <button
                onClick={cancelRecording}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceMessageButton;
