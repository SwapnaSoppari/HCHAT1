
import { useState, useEffect, useRef } from 'react';
import { Phone, PhoneCall, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VoiceCallProps {
  roomId: string;
  userName: string;
  isInCall: boolean;
  onEndCall: () => void;
}

const VoiceCall = ({ roomId, userName, isInCall, onEndCall }: VoiceCallProps) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const { toast } = useToast();
  const callStartTime = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isInCall) {
      callStartTime.current = Date.now();
      setIsConnecting(true);
      
      // Simulate connection process
      setTimeout(() => {
        setIsConnecting(false);
        toast({
          title: "Call Connected",
          description: "Voice call is now active",
        });
        
        // Start duration timer
        intervalRef.current = setInterval(() => {
          setCallDuration(Math.floor((Date.now() - callStartTime.current) / 1000));
        }, 1000);
      }, 2000);
    } else {
      setCallDuration(0);
      setIsConnecting(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isInCall, toast]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
    toast({
      title: isMuted ? "Microphone On" : "Microphone Muted",
      description: isMuted ? "You can now speak" : "You are now muted",
    });
  };

  const handleSpeakerToggle = () => {
    setIsSpeakerOn(!isSpeakerOn);
    toast({
      title: isSpeakerOn ? "Speaker Off" : "Speaker On",
      description: isSpeakerOn ? "Audio through earpiece" : "Audio through speaker",
    });
  };

  const handleEndCall = () => {
    onEndCall();
    toast({
      title: "Call Ended",
      description: `Call duration: ${formatDuration(callDuration)}`,
    });
  };

  if (!isInCall) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm mx-auto shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-pink-500 via-purple-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Phone size={32} className="text-white" />
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
            Voice Call
          </h3>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Room {roomId}
          </p>
          
          {isConnecting ? (
            <p className="text-sm text-orange-500 animate-pulse">
              Connecting...
            </p>
          ) : (
            <p className="text-sm text-green-500">
              Connected • {formatDuration(callDuration)}
            </p>
          )}
        </div>

        <div className="flex justify-center space-x-4 mb-6">
          {/* Mute Button */}
          <button
            onClick={handleMuteToggle}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
              isMuted 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
            }`}
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          {/* Speaker Button */}
          <button
            onClick={handleSpeakerToggle}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
              isSpeakerOn 
                ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
            }`}
            title={isSpeakerOn ? "Speaker Off" : "Speaker On"}
          >
            {isSpeakerOn ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>

          {/* End Call Button */}
          <button
            onClick={handleEndCall}
            className="w-12 h-12 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all duration-200"
            title="End Call"
          >
            <PhoneCall size={20} />
          </button>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Voice calling is currently in development
          </p>
        </div>
      </div>
    </div>
  );
};

export default VoiceCall;
