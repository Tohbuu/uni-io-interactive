import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Achievement {
  id: string;
  title: string;
  icon: string;
}

export const AVAILABLE_ACHIEVEMENTS: Achievement[] = [
  { id: 'galaxy_traveler', title: 'Galaxy Traveler', icon: '🌌' },
  { id: 'quiz_master', title: 'Cosmic Genius', icon: '🧠' },
  { id: 'cosmic_tourist', title: 'Grand Tour', icon: '🚌' }, // New Achievement
  { id: 'visit_mercury', title: 'Hot Stuff', icon: '🔥' },
  { id: 'visit_venus', title: 'Cloudy Skies', icon: '☁️' },
  { id: 'visit_earth', title: 'Home Sweet Home', icon: '🌍' },
  { id: 'visit_mars', title: 'Red Planet', icon: '🔴' },
  { id: 'visit_jupiter', title: 'Gas Giant', icon: '⚡' },
  { id: 'visit_saturn', title: 'Ring Master', icon: '🪐' },
  { id: 'visit_uranus', title: 'Ice Giant', icon: '❄️' },
  { id: 'visit_neptune', title: 'Deep Blue', icon: '🌊' },
];

interface User {
  username: string;
  status: 'online' | 'offline';
  unlockedAchievements: string[];
}

interface AuthContextType {
  user: User | null;
  login: (username: string) => void;
  logout: () => void;
  unlockAchievement: (id: string) => boolean; // Returns true if newly unlocked
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Load from local storage on initial render
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('universe_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Save to local storage whenever user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('universe_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('universe_user');
    }
  }, [user]);

  const login = (username: string) => {
    setUser(prev => {
        // If logging in as same user, keep progress
        if (prev && prev.username === username) return prev;
        return { username, status: 'online', unlockedAchievements: [] };
    });
  };

  const logout = () => {
    setUser(null);
  };

  const unlockAchievement = (id: string) => {
    if (!user) return false;
    if (user.unlockedAchievements.includes(id)) return false;

    setUser({
      ...user,
      unlockedAchievements: [...user.unlockedAchievements, id]
    });
    return true;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, unlockAchievement }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}