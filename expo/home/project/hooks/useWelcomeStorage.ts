import { useState, useEffect } from 'react';

// Simple storage hook for welcome status
// In a real app, this would use AsyncStorage or a proper storage provider
let globalWelcomeState = false;

export function useWelcomeStorage() {
  const [hasSeenWelcome, setHasSeenWelcome] = useState<boolean | null>(null);

  useEffect(() => {
    // Initialize from global state
    setHasSeenWelcome(globalWelcomeState);
  }, []);

  const markWelcomeAsSeen = () => {
    globalWelcomeState = true;
    setHasSeenWelcome(true);
  };

  return {
    hasSeenWelcome,
    markWelcomeAsSeen
  };
}