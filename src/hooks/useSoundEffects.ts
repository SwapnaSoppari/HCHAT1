
import { useState, useEffect } from 'react';

export const useSoundEffects = () => {
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    const savedSetting = localStorage.getItem('chatSounds');
    if (savedSetting !== null) {
      setSoundEnabled(JSON.parse(savedSetting));
    }
  }, []);

  const toggleSound = () => {
    const newSetting = !soundEnabled;
    setSoundEnabled(newSetting);
    localStorage.setItem('chatSounds', JSON.stringify(newSetting));
  };

  const playNotificationSound = () => {
    if (soundEnabled) {
      // Create a simple beep sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    }
  };

  return { soundEnabled, toggleSound, playNotificationSound };
};
