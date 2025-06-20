import { useState, useEffect } from 'react';
import { Globe, Users } from 'lucide-react';

const GlobalUserCounter = () => {
  const [userCount, setUserCount] = useState(7787);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimating(true);
      // Fluctuate randomly - can increase or decrease by 15-45 users every 20 minutes
      const change = Math.floor(Math.random() * 31) + 15; // 15-45
      const isIncrease = Math.random() > 0.3; // 70% chance to increase, 30% to decrease
      
      setUserCount(prev => {
        const newCount = isIncrease ? prev + change : prev - change;
        // Keep it above 5000 and below 15000 for realism
        return Math.max(5000, Math.min(15000, newCount));
      });
      
      setTimeout(() => setAnimating(false), 500);
    }, 1200000); // 20 minutes = 1200000 milliseconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="inline-flex items-center space-x-1 text-xs text-white/90">
      <div className="flex items-center space-x-1">
        <Globe size={10} className="animate-pulse" />
        <Users size={10} />
      </div>
      <span className="whitespace-nowrap">
        <span 
          className={`font-bold transition-all duration-500 ${
            animating ? 'scale-110' : 'scale-100'
          }`}
        >
          {userCount.toLocaleString()}+
        </span>
        <span className="ml-1">online</span>
      </span>
    </div>
  );
};

export default GlobalUserCounter;
