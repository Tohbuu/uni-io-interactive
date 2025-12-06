import React from 'react';
import { 
    Dialog, DialogTitle, DialogContent, DialogActions, Button, 
    Typography, Box, LinearProgress, Chip, Paper, Grid
} from '@mui/material';
import { RocketLaunch, LocalGasStation, Inventory2, Upgrade } from '@mui/icons-material';
import { useAuth, UpgradeType } from '../context/AuthContext';

interface ShipyardProps {
    open: boolean;
    onClose: () => void;
}

export default function Shipyard({ open, onClose }: ShipyardProps) {
    const { user, buyUpgrade, getShipStats } = useAuth();

    if (!user) return null;

    const stats = getShipStats();

    const renderUpgradeCard = (type: UpgradeType, label: string, icon: React.ReactNode, currentStat: number, unit: string) => {
        // Fix: Safely access upgrades with fallback
        const upgrades = user.upgrades || { engine: 1, fuel: 1, cargo: 1 };
        const level = upgrades[type] || 1;
        const cost = level * 500;
        const isMaxed = level >= 5;

        const handleBuy = () => {
            buyUpgrade(type);
        };

        return (
            <Grid size={{ xs: 12, md: 4 }}>
                <Paper sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.05)', color: 'white' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        {icon}
                        <Typography variant="h6">{label}</Typography>
                    </Box>
                    <Typography variant="body2" color="gray" gutterBottom>
                        Level {level} / 5
                    </Typography>
                    <LinearProgress 
                        variant="determinate" 
                        value={(level / 5) * 100} 
                        sx={{ mb: 2, height: 8, borderRadius: 4, bgcolor: '#333', '& .MuiLinearProgress-bar': { bgcolor: '#00e676' } }} 
                    />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="caption">Current: {currentStat} {unit}</Typography>
                        {!isMaxed && <Typography variant="caption" color="#00e676">Next: {currentStat + (type === 'cargo' ? 10 : type === 'fuel' ? 50 : 10)} {unit}</Typography>}
                    </Box>

                    <Button 
                        fullWidth 
                        variant="contained" 
                        disabled={isMaxed || user.credits < cost}
                        onClick={handleBuy}
                        startIcon={<Upgrade />}
                        color={isMaxed ? "success" : "primary"}
                    >
                        {isMaxed ? "MAXED" : `${cost} CR`}
                    </Button>
                </Paper>
            </Grid>
        );
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{ sx: { bgcolor: '#1a1a1a', color: 'white', border: '1px solid #333' } }}
        >
            <DialogTitle sx={{ borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <RocketLaunch sx={{ color: '#00e676' }} />
                    SHIPYARD
                </Box>
                <Chip label={`${user.credits} CR`} sx={{ bgcolor: '#ffd700', color: 'black', fontWeight: 'bold' }} />
            </DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
                <Grid container spacing={3} sx={{ mt: 0 }}>
                    {renderUpgradeCard('engine', 'Engine Thrusters', <RocketLaunch color="primary" />, stats.maxSpeed, 'km/s')}
                    {renderUpgradeCard('fuel', 'Fuel Tanks', <LocalGasStation color="error" />, stats.maxFuel, 'units')}
                    {renderUpgradeCard('cargo', 'Cargo Hold', <Inventory2 color="warning" />, stats.maxCargo, 'tons')}
                </Grid>
            </DialogContent>
            <DialogActions sx={{ borderTop: '1px solid #333', p: 2 }}>
                <Button onClick={onClose} sx={{ color: 'white' }}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}