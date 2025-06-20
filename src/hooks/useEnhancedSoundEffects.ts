
import { useState, useEffect } from 'react';

export const useEnhancedSoundEffects = () => {
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

  const createSound = (frequency: number, duration: number, volume: number = 0.3) => {
    if (!soundEnabled) return;
    
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    } catch (error) {
      console.log('Audio not available');
    }
  };

  const playMessageSound = () => {
    // Pleasant chime sound
    createSound(800, 0.2, 0.2);
    setTimeout(() => createSound(1000, 0.15, 0.15), 100);
  };

  const playJoinSound = () => {
    // Rising tone for user join
    createSound(600, 0.1, 0.2);
    setTimeout(() => createSound(800, 0.1, 0.15), 50);
    setTimeout(() => createSound(1000, 0.1, 0.1), 100);
  };

  const playLeaveSound = () => {
    // Falling tone for user leave
    createSound(1000, 0.1, 0.15);
    setTimeout(() => createSound(800, 0.1, 0.1), 50);
    setTimeout(() => createSound(600, 0.15, 0.05), 100);
  };

  const playReactionSound = () => {
    // Quick pop sound for reactions
    createSound(1200, 0.1, 0.1);
  };

  return { 
    soundEnabled, 
    toggleSound, 
    playMessageSound, 
    playJoinSound, 
    playLeaveSound, 
    playReactionSound 
  };
};
