import React from 'react';
import { Box, Button, Typography, Divider, Chip } from '@mui/material';
import { ShoppingCart, Sell } from '@mui/icons-material';
import { ResourceType, MarketData } from '../data/universeData';
import { useAuth } from '../context/AuthContext';

const BASE_PRICES: Record<ResourceType, number> = {
    Water: 50,
    Minerals: 100,
    Gas: 150,
    Food: 80,
    Tech: 300
};

interface TradingPanelProps {
    market: MarketData;
}

export default function TradingPanel({ market }: TradingPanelProps) {
    const { user, trade } = useAuth();

    if (!user) return null;

    const getPrice = (resource: ResourceType, type: 'buy' | 'sell') => {
        let multiplier = 1.0;
        
        // Supply & Demand Logic
        if (market.produces.includes(resource)) multiplier = 0.7; // Cheap here
        if (market.demands.includes(resource)) multiplier = 1.4; // Expensive here

        const base = BASE_PRICES[resource] * multiplier;
        
        // Buy price is slightly higher than sell price (spread)
        return Math.floor(type === 'buy' ? base * 1.1 : base * 0.9);
    };

    const handleTrade = (resource: ResourceType, type: 'buy' | 'sell') => {
        const price = getPrice(resource, type);
        const success = trade(resource, 1, price, type);
        if (success) {
            // Optional: Play sound or show toast
        }
    };

    const resources: ResourceType[] = ['Water', 'Minerals', 'Gas', 'Food', 'Tech'];

    return (
        <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(0,0,0,0.3)', borderRadius: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 'bold', color: '#ffd700' }}>
                    MARKETPLACE
                </Typography>
                <Chip label={`${user.credits} CR`} size="small" sx={{ bgcolor: '#ffd700', color: 'black', fontWeight: 'bold' }} />
            </Box>
            <Divider sx={{ bgcolor: '#444', mb: 2 }} />
            
            {resources.map(res => {
                const buyPrice = getPrice(res, 'buy');
                const sellPrice = getPrice(res, 'sell');
                const owned = user.cargo[res] || 0;
                const isProduced = market.produces.includes(res);
                const isDemanded = market.demands.includes(res);

                return (
                    <Box key={res} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                        <Box>
                            <Typography variant="body2" sx={{ color: 'white', fontWeight: 'bold' }}>
                                {res} {isProduced && <span style={{color:'#4caf50', fontSize:'10px'}}>(Supply)</span>} {isDemanded && <span style={{color:'#f44336', fontSize:'10px'}}>(Demand)</span>}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#aaa' }}>Owned: {owned}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button 
                                size="small" 
                                variant="outlined" 
                                color="error"
                                startIcon={<Sell sx={{ fontSize: 14 }} />}
                                onClick={() => handleTrade(res, 'sell')}
                                disabled={owned <= 0}
                                sx={{ minWidth: 80, py: 0.2, fontSize: '0.7rem' }}
                            >
                                {sellPrice}
                            </Button>
                            <Button 
                                size="small" 
                                variant="contained" 
                                color="success"
                                startIcon={<ShoppingCart sx={{ fontSize: 14 }} />}
                                onClick={() => handleTrade(res, 'buy')}
                                disabled={user.credits < buyPrice}
                                sx={{ minWidth: 80, py: 0.2, fontSize: '0.7rem' }}
                            >
                                {buyPrice}
                            </Button>
                        </Box>
                    </Box>
                );
            })}
        </Box>
    );
}