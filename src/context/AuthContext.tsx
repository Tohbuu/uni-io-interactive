import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ResourceType } from '../data/universeData';

export interface Achievement {
  id: string;
  title: string;
  icon: string;
}

export const AVAILABLE_ACHIEVEMENTS: Achievement[] = [
  { id: 'galaxy_traveler', title: 'Galaxy Traveler', icon: '🌌' },
  { id: 'quiz_master', title: 'Cosmic Genius', icon: '🧠' },
  { id: 'cosmic_tourist', title: 'Grand Tour', icon: '🚌' },
  { id: 'visit_mercury', title: 'Hot Stuff', icon: '🔥' },
  { id: 'visit_venus', title: 'Cloudy Skies', icon: '☁️' },
  { id: 'visit_earth', title: 'Home Sweet Home', icon: '🌍' },
  { id: 'visit_mars', title: 'Red Planet', icon: '🔴' },
  { id: 'visit_jupiter', title: 'Gas Giant', icon: '⚡' },
  { id: 'visit_saturn', title: 'Ring Master', icon: '🪐' },
  { id: 'visit_uranus', title: 'Ice Giant', icon: '❄️' },
  { id: 'visit_neptune', title: 'Deep Blue', icon: '🌊' },
  { id: 'master_explorer', title: 'Master Explorer', icon: '🔭' },
  { id: 'trade_tycoon', title: 'Trade Tycoon', icon: '💰' },
  { id: 'fully_upgraded', title: 'Maxed Out', icon: '🔧' }, // New
];

export type UpgradeType = 'engine' | 'fuel' | 'cargo';

export interface ShipStats {
    maxSpeed: number;
    acceleration: number;
    maxFuel: number;
    maxCargo: number;
}

interface User {
  username: string;
  status: 'online' | 'offline';
  unlockedAchievements: string[];
  scannedObjects: string[];
  credits: number;
  cargo: Record<ResourceType, number>;
  upgrades: Record<UpgradeType, number>; // New
}

interface AuthContextType {
  user: User | null;
  login: (username: string) => void;
  logout: () => void;
  unlockAchievement: (id: string) => boolean;
  scanObject: (id: string) => boolean;
  trade: (item: ResourceType, amount: number, price: number, type: 'buy' | 'sell') => boolean;
  buyUpgrade: (type: UpgradeType) => boolean; // New
  getShipStats: () => ShipStats; // New
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('universe_user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('universe_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('universe_user');
    }
  }, [user]);

  const login = (username: string) => {
    setUser(prev => {
        if (prev && prev.username === username) {
            const updated = { ...prev };
            if (!updated.scannedObjects) updated.scannedObjects = ['Sun', 'Earth'];
            if (updated.credits === undefined) updated.credits = 1000;
            if (!updated.cargo) updated.cargo = { Water: 0, Minerals: 0, Gas: 0, Food: 0, Tech: 0 };
            if (!updated.upgrades) updated.upgrades = { engine: 1, fuel: 1, cargo: 1 }; // Default level 1
            return updated;
        }
        return { 
            username, 
            status: 'online', 
            unlockedAchievements: [], 
            scannedObjects: ['Sun', 'Earth'],
            credits: 1000,
            cargo: { Water: 0, Minerals: 0, Gas: 0, Food: 0, Tech: 0 },
            upgrades: { engine: 1, fuel: 1, cargo: 1 }
        };
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

  const scanObject = (id: string) => {
    if (!user) return false;
    const currentScanned = user.scannedObjects || [];
    if (currentScanned.includes(id)) return false;

    setUser({
      ...user,
      scannedObjects: [...currentScanned, id]
    });
    return true;
  };

  const getShipStats = (): ShipStats => {
      if (!user) return { maxSpeed: 25, acceleration: 15, maxFuel: 100, maxCargo: 10 };
      const { engine, fuel, cargo } = user.upgrades;
      return {
          maxSpeed: 25 + (engine - 1) * 10,
          acceleration: 15 + (engine - 1) * 5,
          maxFuel: 100 + (fuel - 1) * 50,
          maxCargo: 10 + (cargo - 1) * 10
      };
  };

  const trade = (item: ResourceType, amount: number, price: number, type: 'buy' | 'sell') => {
      if (!user) return false;
      
      const totalCost = amount * price;
      const newCargo = { ...user.cargo };

      if (type === 'buy') {
          if (user.credits < totalCost) return false;
          
          // Check Capacity
          const currentTotal = Object.values(user.cargo).reduce((a, b) => a + b, 0);
          const stats = getShipStats();
          if (currentTotal + amount > stats.maxCargo) return false;

          newCargo[item] = (newCargo[item] || 0) + amount;
          setUser({ ...user, credits: user.credits - totalCost, cargo: newCargo });
      } else {
          if ((newCargo[item] || 0) < amount) return false;
          newCargo[item] -= amount;
          setUser({ ...user, credits: user.credits + totalCost, cargo: newCargo });
      }
      return true;
  };

  const buyUpgrade = (type: UpgradeType) => {
      if (!user) return false;
      const currentLevel = user.upgrades[type];
      if (currentLevel >= 5) return false; // Max level 5

      const cost = currentLevel * 500; // 500, 1000, 1500, 2000
      
      if (user.credits >= cost) {
          const newUpgrades = { ...user.upgrades, [type]: currentLevel + 1 };
          setUser({
              ...user,
              credits: user.credits - cost,
              upgrades: newUpgrades
          });
          
          // Check for maxed out achievement
          if (Object.values(newUpgrades).every(lvl => lvl >= 5)) {
              unlockAchievement('fully_upgraded');
          }
          
          return true;
      }
      return false;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, unlockAchievement, scanObject, trade, buyUpgrade, getShipStats }}>
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