import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
import SolarSystem from './components/SolarSystem';
import Galaxy from './components/Galaxy';
import Quiz from './components/Quiz';
import { AuthProvider, useAuth, AVAILABLE_ACHIEVEMENTS } from './context/AuthContext';
import { soundEngine } from './utils/SoundEngine';
import { universe, StarSystemData } from './data/universeData'; // Import Data
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  TextField, 
  Typography, 
  IconButton, 
  Avatar,
  Menu,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Fade,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slider,
  Switch,
  FormControlLabel,
  Snackbar,
  Alert,
  Tooltip,
  LinearProgress,
  Autocomplete,
  Chip
} from '@mui/material';
import { AccountCircle, Settings, ExitToApp, Public, Person, Close, Circle, Speed, Visibility, ArrowBack, EmojiEvents, School, Tour, Stop, RestartAlt, VolumeUp, VolumeOff, RocketLaunch, Flag, Build } from '@mui/icons-material';
import TradingPanel from './components/TradingPanel'; // Import TradingPanel
import Shipyard from './components/Shipyard'; // Import Shipyard

function LoginOverlay() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');

  const handleLogin = () => {
    login(username);
    soundEngine.init(); // Initialize audio context on user gesture
    soundEngine.playClick();
  };

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        backgroundColor: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(5px)'
      }}
    >
      <Card sx={{ minWidth: 320, bgcolor: 'rgba(20, 20, 30, 0.9)', color: 'white', border: '1px solid #444' }}>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: 4 }}>
          <Typography variant="h5" component="div" align="center" sx={{ fontWeight: 'bold', letterSpacing: 2 }}>
            UNIVERSE ACCESS
          </Typography>
          <TextField 
            label="Username" 
            variant="outlined" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            sx={{ 
              input: { color: 'white' }, 
              label: { color: '#aaa' },
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: '#555' },
                '&:hover fieldset': { borderColor: '#888' },
                '&.Mui-focused fieldset': { borderColor: '#1976d2' },
              }
            }}
          />
          <Button 
            variant="contained" 
            size="large"
            onClick={handleLogin}
            disabled={!username}
            sx={{ bgcolor: '#1976d2', '&:hover': { bgcolor: '#115293' } }}
          >
            Enter Solar System
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}

function SettingsDialog({ open, onClose, speed, setSpeed, showOrbits, setShowOrbits }: any) {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      PaperProps={{
        sx: { bgcolor: '#222', color: 'white', minWidth: 300, border: '1px solid #444' }
      }}
    >
      <DialogTitle sx={{ borderBottom: '1px solid #333' }}>Simulation Settings</DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ mt: 2 }}>
          <Typography gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Speed fontSize="small" /> Simulation Speed ({speed}x)
          </Typography>
          <Slider
            value={speed}
            onChange={(_, val) => setSpeed(val as number)}
            min={0}
            max={5}
            step={0.1}
            sx={{ color: '#1976d2' }}
          />
        </Box>
        
        <Box sx={{ mt: 3 }}>
          <FormControlLabel
            control={
              <Switch 
                checked={showOrbits} 
                onChange={(e) => setShowOrbits(e.target.checked)} 
                color="primary" 
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Visibility fontSize="small" /> Show Orbit Lines
              </Box>
            }
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ borderTop: '1px solid #333', p: 2 }}>
        <Button onClick={onClose} sx={{ color: 'white' }}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

interface HUDProps {
  onPlanetSelect: (name: string | null) => void;
  onOpenSettings: () => void;
  onOpenQuiz: () => void;
  onStartTour: () => void;
  onStopTour: () => void;
  isTouring: boolean;
  currentView: 'system' | 'galaxy';
  onChangeView: (view: 'system' | 'galaxy') => void;
  selectedPlanet: string | null;
  onEnterShip: () => void;
  activeMission: any;
  currentSystem: StarSystemData; // New Prop
  onOpenShipyard: () => void; // New Prop
}

function HUD({ onPlanetSelect, onOpenSettings, onOpenQuiz, onStartTour, onStopTour, isTouring, currentView, onChangeView, selectedPlanet, onEnterShip, activeMission, currentSystem, onOpenShipyard }: HUDProps) {
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [muted, setMuted] = useState(false);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    logout();
  };

  const toggleMute = () => {
    const isMuted = soundEngine.toggleMute();
    setMuted(isMuted);
  };

  if (!user) return <LoginOverlay />;

  return (
    <>
      {/* Top Right User Menu */}
      <Box sx={{ position: 'absolute', top: 20, right: 20, zIndex: 10, display: 'flex', gap: 1 }}>
        <IconButton
          onClick={toggleMute}
          sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}
        >
          {muted ? <VolumeOff /> : <VolumeUp />}
        </IconButton>
        <IconButton
          size="large"
          onClick={handleMenu}
          sx={{ bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}
        >
          <Avatar sx={{ bgcolor: '#1976d2' }}>{user.username[0].toUpperCase()}</Avatar>
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          PaperProps={{
            sx: { bgcolor: '#222', color: 'white', border: '1px solid #444' }
          }}
        >
          <MenuItem onClick={() => { setDrawerOpen(true); handleClose(); }}>
            <ListItemIcon><Person sx={{ color: 'white' }} /></ListItemIcon>
            Profile
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <ListItemIcon><ExitToApp sx={{ color: 'white' }} /></ListItemIcon>
            Logout
          </MenuItem>
        </Menu>
      </Box>

      {/* Top Left Info & Search */}
      <Box sx={{ position: 'absolute', top: 20, left: 20, zIndex: 10, color: 'white', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {currentView === 'system' && (
             <IconButton onClick={() => { onChangeView('galaxy'); soundEngine.playWarp(); }} sx={{ color: 'white', border: '1px solid #444' }}>
               <ArrowBack />
             </IconButton>
          )}
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', textShadow: '0 0 10px #000', letterSpacing: 2 }}>
              {currentView === 'galaxy' ? 'MILKY WAY' : currentSystem.name.toUpperCase()}
            </Typography>
            <Typography variant="subtitle2" sx={{ color: '#aaa', mt: 0.5 }}>
              Status: <span style={{ color: '#4caf50', fontWeight: 'bold' }}>{user.status.toUpperCase()}</span>
            </Typography>
          </Box>
        </Box>

        {/* Active Mission Card */}
        {activeMission && currentView === 'system' && (
          <Fade in={true}>
            <Card sx={{ bgcolor: 'rgba(25, 118, 210, 0.2)', border: '1px solid #1976d2', color: 'white', maxWidth: 300 }}>
              <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Typography variant="caption" sx={{ color: '#4caf50', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Flag fontSize="inherit" /> ACTIVE MISSION
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 0.5 }}>
                  {activeMission.title}
                </Typography>
                <Typography variant="body2" sx={{ color: '#ccc', fontSize: '0.85rem' }}>
                  {activeMission.description} <span style={{ color: '#00ffff' }}>{activeMission.target}</span>
                </Typography>
                <Chip 
                  label={`Reward: ${activeMission.reward}`} 
                  size="small" 
                  sx={{ mt: 1, bgcolor: 'rgba(255, 215, 0, 0.2)', color: '#ffd700', border: '1px solid #ffd700' }} 
                />
              </CardContent>
            </Card>
          </Fade>
        )}

        {/* Search Bar */}
        {currentView === 'system' && (
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Autocomplete
              options={[currentSystem.star.name, ...currentSystem.planets.map(p => p.name)]}
              value={selectedPlanet}
              onChange={(_, newValue) => onPlanetSelect(newValue)}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  placeholder="Search..." 
                  variant="outlined" 
                  size="small"
                  sx={{ 
                    width: 200, 
                    bgcolor: 'rgba(0,0,0,0.5)', 
                    borderRadius: 1,
                    input: { color: 'white' },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: '#444' },
                      '&:hover fieldset': { borderColor: '#888' },
                      '&.Mui-focused fieldset': { borderColor: '#1976d2' },
                    }
                  }} 
                />
              )}
            />
            {selectedPlanet && (
              <Tooltip title="Reset View">
                <IconButton 
                  onClick={() => onPlanetSelect(null)}
                  sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}
                >
                  <RestartAlt />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        )}
      </Box>

      {/* Tour Status Indicator */}
      {isTouring && (
        <Box sx={{ position: 'absolute', top: 100, left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
          <Card sx={{ bgcolor: 'rgba(25, 118, 210, 0.8)', color: 'white', px: 2, py: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="button" sx={{ fontWeight: 'bold' }}>Grand Tour in Progress</Typography>
            <Button 
              size="small" 
              variant="contained" 
              color="error" 
              startIcon={<Stop />}
              onClick={onStopTour}
            >
              Stop
            </Button>
          </Card>
        </Box>
      )}

      {/* Side Drawer for Settings/Profile */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: { width: 320, bgcolor: '#1a1a1a', color: 'white', borderLeft: '1px solid #333' }
        }}
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h5" sx={{ mb: 3, borderBottom: '1px solid #333', pb: 1 }}>User Profile</Typography>
          <List>
            <ListItem sx={{ mb: 2 }}>
              <ListItemIcon><AccountCircle sx={{ color: '#1976d2', fontSize: 40 }} /></ListItemIcon>
              <ListItemText 
                primary={user.username} 
                secondary="Space Commander" 
                primaryTypographyProps={{ variant: 'h6' }}
                secondaryTypographyProps={{ style: { color: '#888' } }} 
              />
            </ListItem>

            {/* Achievements Section */}
            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, color: '#aaa', display: 'flex', alignItems: 'center', gap: 1 }}>
              <EmojiEvents fontSize="small" sx={{ color: '#ffd700' }} /> ACHIEVEMENTS ({user.unlockedAchievements.length}/{AVAILABLE_ACHIEVEMENTS.length})
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3, p: 1, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 1 }}>
              {AVAILABLE_ACHIEVEMENTS.map((ach) => {
                const isUnlocked = user.unlockedAchievements.includes(ach.id);
                return (
                  <Tooltip key={ach.id} title={isUnlocked ? ach.title : "Locked"}>
                    <Box sx={{ 
                      fontSize: '24px', 
                      opacity: isUnlocked ? 1 : 0.2, 
                      filter: isUnlocked ? 'none' : 'grayscale(100%)',
                      cursor: 'help'
                    }}>
                      {ach.icon}
                    </Box>
                  </Tooltip>
                );
              })}
            </Box>

            <ListItemButton onClick={() => { onOpenSettings(); setDrawerOpen(false); }}>
              <ListItemIcon><Settings sx={{ color: 'white' }} /></ListItemIcon>
              <ListItemText primary="Settings" />
            </ListItemButton>
            
            <ListItemButton onClick={() => { onOpenQuiz(); setDrawerOpen(false); }}>
              <ListItemIcon><School sx={{ color: 'white' }} /></ListItemIcon>
              <ListItemText primary="Cosmic Quiz" />
            </ListItemButton>

            <ListItemButton onClick={() => { onStartTour(); setDrawerOpen(false); }}>
              <ListItemIcon><Tour sx={{ color: 'white' }} /></ListItemIcon>
              <ListItemText primary="Start Grand Tour" />
            </ListItemButton>

            <ListItemButton onClick={() => { onEnterShip(); setDrawerOpen(false); }}>
              <ListItemIcon><RocketLaunch sx={{ color: 'cyan' }} /></ListItemIcon>
              <ListItemText primary="Pilot Mode" />
            </ListItemButton>

            <ListItemButton onClick={() => { onOpenShipyard(); setDrawerOpen(false); }}>
                <ListItemIcon><Build sx={{ color: '#00e676' }} /></ListItemIcon>
                <ListItemText primary="Shipyard" />
            </ListItemButton>

             <ListItemButton onClick={() => { onChangeView('galaxy'); soundEngine.playWarp(); setDrawerOpen(false); }}>
              <ListItemIcon><Public sx={{ color: 'white' }} /></ListItemIcon>
              <ListItemText primary="Galaxy Map" />
            </ListItemButton>
          </List>

          {currentView === 'system' && (
            <>
              <Typography variant="h6" sx={{ mt: 3, mb: 1, borderBottom: '1px solid #333', pb: 1 }}>Navigation</Typography>
              <List>
                <ListItemButton onClick={() => { onPlanetSelect(currentSystem.star.name); setDrawerOpen(false); }}>
                    <ListItemIcon><Circle sx={{ color: currentSystem.star.color, fontSize: 12 }} /></ListItemIcon>
                    <ListItemText primary={currentSystem.star.name} />
                </ListItemButton>
                {currentSystem.planets.map((planet) => (
                  <ListItemButton 
                    key={planet.name} 
                    onClick={() => { onPlanetSelect(planet.name); setDrawerOpen(false); }}
                  >
                    <ListItemIcon><Circle sx={{ color: planet.color, fontSize: 12 }} /></ListItemIcon>
                    <ListItemText primary={planet.name} />
                  </ListItemButton>
                ))}
              </List>
            </>
          )}
        </Box>
      </Drawer>
    </>
  );
}

function PlanetDetails({ planetName, onClose, isTouring, currentSystem, scannedObjects }: { planetName: string | null, onClose: () => void, isTouring: boolean, currentSystem: StarSystemData, scannedObjects: string[] }) {
  const planet = planetName === currentSystem.star.name ? currentSystem.star : currentSystem.planets.find(p => p.name === planetName);

  if (!planet) return null;

  const isScanned = scannedObjects.includes(planet.name);

  return (
    <Fade in={!!planet}>
      <Card sx={{ 
        position: 'absolute', 
        bottom: 40, 
        left: 40, 
        width: 350, 
        bgcolor: 'rgba(20, 20, 30, 0.95)', 
        color: 'white', 
        border: '1px solid #444',
        zIndex: 20,
        backdropFilter: 'blur(10px)',
        maxHeight: '80vh', // Limit height
        overflowY: 'auto' // Scroll if needed
      }}>
        {isTouring && <LinearProgress color="primary" sx={{ height: 4 }} />}
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4" sx={{ color: planet.color, fontWeight: 'bold' }}>
              {planet.name}
            </Typography>
            {!isTouring && (
              <IconButton onClick={onClose} size="small" sx={{ color: 'white' }}>
                <Close />
              </IconButton>
            )}
          </Box>
          
          <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
            {planet.description}
          </Typography>

          {!isScanned ? (
             <Box sx={{ p: 2, border: '1px dashed #555', borderRadius: 1, textAlign: 'center', color: '#aaa' }}>
                 <Typography variant="h6" sx={{ color: '#f44336' }}>DATA ENCRYPTED</Typography>
                 <Typography variant="caption">Scan this object with your ship to unlock scientific data.</Typography>
             </Box>
          ) : (
            <>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                    <Box>
                    <Typography variant="caption" sx={{ color: '#888' }}>DIAMETER</Typography>
                    <Typography variant="h6">{planet.realDiameter}</Typography>
                    </Box>
                    <Box>
                    <Typography variant="caption" sx={{ color: '#888' }}>TEMPERATURE</Typography>
                    <Typography variant="h6">{planet.temperature}</Typography>
                    </Box>
                    <Box>
                    <Typography variant="caption" sx={{ color: '#888' }}>YEAR LENGTH</Typography>
                    <Typography variant="h6">{planet.yearDuration}</Typography>
                    </Box>
                    <Box>
                    <Typography variant="caption" sx={{ color: '#888' }}>ORBIT SPEED</Typography>
                    <Typography variant="h6">{planet.speed === 0 ? 'N/A' : planet.speed}</Typography>
                    </Box>
                </Box>
                
                {/* Trading Panel */}
                {planet.market && (
                    <TradingPanel market={planet.market} />
                )}
            </>
          )}
        </CardContent>
      </Card>
    </Fade>
  );
}

function AppContent() {
  const { user, unlockAchievement, scanObject, getShipStats } = useAuth(); // Get getShipStats
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);
  const [shipyardOpen, setShipyardOpen] = useState(false); // New state
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [showOrbits, setShowOrbits] = useState(true);
  const [view, setView] = useState<'system' | 'galaxy'>('system');
  const [viewMode, setViewMode] = useState<'orbit' | 'ship'>('orbit');
  
  // System State
  const [currentSystemId, setCurrentSystemId] = useState<string>('sol');
  const currentSystem = universe.find(s => s.id === currentSystemId) || universe[0];

  // Mission State
  const [activeMission, setActiveMission] = useState<any | null>(null);

  // Tour State
  const [isTouring, setIsTouring] = useState(false);
  const tourIndexRef = useRef(-1);
  const tourTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Notification State
  const [notification, setNotification] = useState<{open: boolean, message: string}>({ open: false, message: '' });

  const handleScan = (name: string) => {
      const isNew = scanObject(name);
      if (isNew) {
          soundEngine.playClick(); 
          setNotification({ open: true, message: `Data Unlocked: ${name}` });
          
          // Check for Master Explorer achievement
          if (user && user.scannedObjects.length >= 5) {
              const unlocked = unlockAchievement('master_explorer');
              if (unlocked) {
                  setNotification({ open: true, message: `Achievement Unlocked: Master Explorer 🔭` });
              }
          }
      }
  };

  const generateNewMission = useCallback(() => {
    // Pick a random system first
    const randomSystem = universe[Math.floor(Math.random() * universe.length)];
    const randomPlanet = randomSystem.planets[Math.floor(Math.random() * randomSystem.planets.length)];
    
    const templates = [
        { title: "Supply Run", desc: "Deliver medical supplies to colony on", reward: "500 Credits" },
        { title: "Data Collection", desc: "Scan atmospheric data at", reward: "300 Science" },
        { title: "VIP Transport", desc: "Transport diplomat to", reward: "800 Credits" },
        { title: "Maintenance", desc: "Repair satellite uplink at", reward: "150 Parts" },
    ];
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    setActiveMission({
      id: Date.now(),
      target: randomPlanet.name,
      systemId: randomSystem.id, // Track system
      title: template.title,
      description: template.desc,
      reward: template.reward
    });
  }, []);

  // Generate initial mission
  useEffect(() => {
    if (!activeMission) {
      generateNewMission();
    }
  }, [activeMission, generateNewMission]);

  const handlePlanetSelect = (name: string | null) => {
    if (isTouring && name !== currentSystem.planets[tourIndexRef.current]?.name) {
      stopTour();
    }
    
    if (viewMode === 'ship' && name) {
        setViewMode('orbit');
    }

    setSelectedPlanet(name);
    soundEngine.playClick();

    if (name) {
      const achievementId = `visit_${name.toLowerCase()}`;
      const unlocked = unlockAchievement(achievementId);
      if (unlocked) {
        const ach = AVAILABLE_ACHIEVEMENTS.find(a => a.id === achievementId);
        setNotification({ open: true, message: `Achievement Unlocked: ${ach?.title} ${ach?.icon}` });
      }

      if (activeMission && name === activeMission.target && currentSystem.id === activeMission.systemId) {
        setNotification({ open: true, message: `Mission Complete! Reward: ${activeMission.reward}` });
        setTimeout(() => {
          generateNewMission();
        }, 2000);
      }
    }
  };

  const handleViewChange = (newView: 'system' | 'galaxy') => {
    if (isTouring) stopTour();
    setView(newView);
    if (newView === 'galaxy') {
      const unlocked = unlockAchievement('galaxy_traveler');
      if (unlocked) {
        const ach = AVAILABLE_ACHIEVEMENTS.find(a => a.id === 'galaxy_traveler');
        setNotification({ open: true, message: `Achievement Unlocked: ${ach?.title} ${ach?.icon}` });
      }
    }
  };

  const handleEnterSystem = (systemId: string) => {
      setCurrentSystemId(systemId);
      handleViewChange('system');
      soundEngine.playWarp();
  };

  const handleQuizComplete = (score: number) => {
    if (score === 5) {
      const unlocked = unlockAchievement('quiz_master');
      if (unlocked) {
        const ach = AVAILABLE_ACHIEVEMENTS.find(a => a.id === 'quiz_master');
        setNotification({ open: true, message: `Achievement Unlocked: ${ach?.title} ${ach?.icon}` });
      }
    }
  };

  const startTour = () => {
    if (view !== 'system') setView('system');
    if (viewMode === 'ship') setViewMode('orbit');
    setIsTouring(true);
    tourIndexRef.current = -1;
    advanceTour();
  };

  const stopTour = () => {
    setIsTouring(false);
    if (tourTimerRef.current) clearTimeout(tourTimerRef.current);
    setSelectedPlanet(null);
  };

  const advanceTour = () => {
    const nextIndex = tourIndexRef.current + 1;
    
    if (nextIndex < currentSystem.planets.length) {
      tourIndexRef.current = nextIndex;
      const planetName = currentSystem.planets[nextIndex].name;
      
      setSelectedPlanet(planetName);
      
      const achievementId = `visit_${planetName.toLowerCase()}`;
      unlockAchievement(achievementId);

      tourTimerRef.current = setTimeout(advanceTour, 8000);
    } else {
      stopTour();
      const unlocked = unlockAchievement('cosmic_tourist');
      if (unlocked) {
        const ach = AVAILABLE_ACHIEVEMENTS.find(a => a.id === 'cosmic_tourist');
        setNotification({ open: true, message: `Achievement Unlocked: ${ach?.title} ${ach?.icon}` });
      } else {
        setNotification({ open: true, message: "Grand Tour Completed!" });
      }
    }
  };

  useEffect(() => {
    return () => {
      if (tourTimerRef.current) clearTimeout(tourTimerRef.current);
    };
  }, []);

  return (
    <>
      <HUD 
        onPlanetSelect={handlePlanetSelect} 
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenQuiz={() => setQuizOpen(true)}
        onStartTour={startTour}
        onStopTour={stopTour}
        isTouring={isTouring}
        currentView={view}
        onChangeView={handleViewChange}
        selectedPlanet={selectedPlanet}
        onEnterShip={() => { setViewMode('ship'); setSelectedPlanet(null); }}
        activeMission={activeMission}
        currentSystem={currentSystem}
        onOpenShipyard={() => setShipyardOpen(true)}
      />
      
      <SettingsDialog 
        open={settingsOpen} 
        onClose={() => setSettingsOpen(false)}
        speed={simulationSpeed}
        setSpeed={setSimulationSpeed}
        showOrbits={showOrbits}
        setShowOrbits={setShowOrbits}
      />

      <Quiz 
        open={quizOpen} 
        onClose={() => setQuizOpen(false)} 
        onComplete={handleQuizComplete} 
      />

      <Shipyard 
        open={shipyardOpen} 
        onClose={() => setShipyardOpen(false)} 
      />

      {view === 'system' && (
        <>
          {viewMode === 'orbit' && (
            <PlanetDetails 
                planetName={selectedPlanet} 
                onClose={() => setSelectedPlanet(null)} 
                isTouring={isTouring}
                currentSystem={currentSystem}
                scannedObjects={user?.scannedObjects || []} // Pass scanned objects
            />
          )}
          <SolarSystem 
            systemData={currentSystem}
            onPlanetSelect={handlePlanetSelect} 
            selectedPlanet={selectedPlanet} 
            simulationSpeed={simulationSpeed}
            showOrbits={showOrbits}
            viewMode={viewMode}
            onExitShip={() => setViewMode('orbit')}
            activeMission={activeMission}
            scannedObjects={user?.scannedObjects || []} // Pass scanned objects
            onScan={handleScan} // Pass handler
            stats={getShipStats()} // Pass stats
          />
        </>
      )}

      {view === 'galaxy' && (
        <Galaxy systems={universe} onEnterSystem={handleEnterSystem} />
      )}

      <Snackbar 
        open={notification.open} 
        autoHideDuration={4000} 
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setNotification({ ...notification, open: false })} 
          severity="success" 
          variant="filled"
          sx={{ width: '100%', bgcolor: '#ffd700', color: 'black', fontWeight: 'bold' }}
          icon={<EmojiEvents fontSize="inherit" />}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
