import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { ShipStats } from '../context/AuthContext';

// Define a local interface to avoid circular dependency with SolarSystem.tsx
interface SimplePlanetData {
  name: string;
  distance: number;
  speed: number;
}

interface Mission {
  target: string;
}

interface SpaceshipProps {
  onExit: () => void;
  onLand: (name: string) => void;
  planets: SimplePlanetData[];
  timeRef: React.MutableRefObject<number>;
  activeMission?: Mission | null;
  scannedObjects: string[];
  onScan: (name: string) => void;
  stats: ShipStats; // New Prop
}

export default function Spaceship({ onExit, onLand, planets, timeRef, activeMission, scannedObjects, onScan, stats }: SpaceshipProps) {
  const shipRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  
  // Physics State (Refs for high-frequency updates)
  const speedRef = useRef(0);
  const fuelRef = useRef(stats.maxFuel); // Use maxFuel from stats
  
  // UI State (State for low-frequency rendering)
  const [fuelDisplay, setFuelDisplay] = useState(100);
  const [speedDisplay, setSpeedDisplay] = useState(0);
  const [isRefueling, setIsRefueling] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  
  const [nearestPlanet, setNearestPlanet] = useState<{name: string, distance: number} | null>(null);
  const [radarBlips, setRadarBlips] = useState<{x: number, y: number, color: string, name: string}[]>([]);
  const frameCount = useRef(0);
  
  // Input state
  const keys = useRef<{ [key: string]: boolean }>({});

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        keys.current[e.code] = true;
        // Handle Landing
        if (e.code === 'KeyL' && nearestPlanet) {
            onLand(nearestPlanet.name);
        }
        // Handle Scanning
        if (e.code === 'KeyF' && nearestPlanet) {
             onScan(nearestPlanet.name);
             setIsScanning(true);
             setTimeout(() => setIsScanning(false), 1500);
        }
    };
    const handleKeyUp = (e: KeyboardEvent) => keys.current[e.code] = false;
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    // Set initial camera position relative to ship
    if (shipRef.current) {
        shipRef.current.position.set(15, 0, 15);
        shipRef.current.rotation.set(0, Math.PI, 0);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [nearestPlanet, onLand, onScan]);

  useFrame((state, delta) => {
    if (!shipRef.current) return;

    const ship = shipRef.current;
    const rotationSpeed = 1.5 * delta;
    const acceleration = stats.acceleration * delta; // Use acceleration from stats
    const friction = 0.98;

    // Controls
    // Fixed: W = Up, S = Down (Arcade Style)
    if (keys.current['KeyW']) ship.rotateX(-rotationSpeed);
    if (keys.current['KeyS']) ship.rotateX(rotationSpeed);
    
    // Fixed: A = Left, D = Right
    if (keys.current['KeyA']) ship.rotateY(-rotationSpeed);
    if (keys.current['KeyD']) ship.rotateY(rotationSpeed);
    
    // Roll (Q = Left, E = Right)
    if (keys.current['KeyQ']) ship.rotateZ(rotationSpeed);
    if (keys.current['KeyE']) ship.rotateZ(-rotationSpeed);

    // --- Fuel & Thrust Logic (Using Refs) ---
    const distToSun = ship.position.length();
    const nearSun = distToSun < 20; // Refuel range

    // Refuel Logic
    if (nearSun && fuelRef.current < stats.maxFuel) { // Use maxFuel
        fuelRef.current = Math.min(fuelRef.current + 0.3, stats.maxFuel);
        if (!isRefueling) setIsRefueling(true); // Only trigger render on change
    } else {
        if (isRefueling) setIsRefueling(false);
    }

    // Thrust Logic
    if (keys.current['Space'] && fuelRef.current > 0) {
        speedRef.current = Math.min(speedRef.current + acceleration, stats.maxSpeed); // Use maxSpeed
        fuelRef.current = Math.max(fuelRef.current - 0.15, 0);
    } else if (keys.current['ShiftLeft']) {
        speedRef.current = Math.max(speedRef.current - acceleration, 0);
    } else {
        speedRef.current *= friction; // Glide/Decay
    }

    // Apply movement
    ship.translateZ(speedRef.current * delta);

    // Camera Chase Logic
    const targetFov = 50 + (speedRef.current * 1.5);
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov, 0.1);
      camera.updateProjectionMatrix();
    }

    const relativeCameraOffset = new THREE.Vector3(0, 3, -8);
    const cameraOffset = relativeCameraOffset.applyMatrix4(ship.matrixWorld);
    camera.position.lerp(cameraOffset, 0.1);
    
    const lookAtPos = ship.position.clone().add(new THREE.Vector3(0, 0, 10).applyQuaternion(ship.quaternion));
    camera.lookAt(lookAtPos);

    // --- Planet Detection Logic ---
    let closest = null;
    let minDst = 5; // Detection range

    const getPlanetPos = (p: SimplePlanetData) => {
        const angle = timeRef.current * p.speed * 0.5;
        return new THREE.Vector3(Math.cos(angle) * p.distance, 0, Math.sin(angle) * p.distance);
    };

    for (const p of planets) {
        const pPos = getPlanetPos(p);
        const dst = ship.position.distanceTo(pPos);
        if (dst < minDst) {
            minDst = dst;
            closest = { name: p.name, distance: dst };
        }
    }
    
    const sunDst = ship.position.distanceTo(new THREE.Vector3(0,0,0));
    if (sunDst < 8) {
         closest = { name: "Sun", distance: sunDst };
    }

    if (closest?.name !== nearestPlanet?.name) {
        setNearestPlanet(closest);
    }

    // --- Throttled UI Updates (Radar & HUD) ---
    frameCount.current++;
    
    // Update HUD numbers every 10 frames to save performance
    if (frameCount.current % 10 === 0) {
        setFuelDisplay((fuelRef.current / stats.maxFuel) * 100); // Percentage based on max
        setSpeedDisplay(speedRef.current);
    }

    // Update Radar every 5 frames
    if (frameCount.current % 5 === 0) {
        const blips = [];
        const range = 50; // Radar range
        const shipInvQuat = ship.quaternion.clone().invert();

        // Planets
        for (const p of planets) {
            const pPos = getPlanetPos(p);
            const localPos = pPos.clone().sub(ship.position).applyQuaternion(shipInvQuat);
            
            let rx = localPos.x / range;
            let ry = -localPos.z / range;
            
            const len = Math.sqrt(rx*rx + ry*ry);
            const isTarget = activeMission?.target === p.name;

            if (len <= 1) {
                blips.push({ 
                    x: rx, 
                    y: ry, 
                    color: isTarget ? '#ffaa00' : (p.name === 'Earth' ? '#0088ff' : '#00ff00'), 
                    name: p.name 
                });
            } else {
                blips.push({ 
                    x: rx/len, 
                    y: ry/len, 
                    color: isTarget ? '#aa6600' : '#004400', 
                    name: p.name 
                });
            }
        }

        // Sun
        const localSun = new THREE.Vector3(0,0,0).sub(ship.position).applyQuaternion(shipInvQuat);
        let sx = localSun.x / range;
        let sy = -localSun.z / range;
        const slen = Math.sqrt(sx*sx + sy*sy);
        if (slen <= 1) {
            blips.push({ x: sx, y: sy, color: '#ffff00', name: 'Sun' });
        } else {
            blips.push({ x: sx/slen, y: sy/slen, color: '#888800', name: 'Sun' });
        }

        setRadarBlips(blips);
    }
  });

  return (
    <group ref={shipRef}>
      {/* Ship Body */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.8, 3, 8]} />
        <meshStandardMaterial color="#00ffff" roughness={0.3} metalness={0.8} />
      </mesh>
      
      {/* Wings */}
      <mesh position={[0, 0, -0.5]} rotation={[Math.PI / 2, 0, 0]}>
         <boxGeometry args={[3, 0.1, 1]} />
         <meshStandardMaterial color="#0088ff" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Engine Glow */}
      <mesh position={[0, 0, -1.6]}>
        <sphereGeometry args={[0.3]} />
        <meshBasicMaterial color={fuelDisplay > 0 ? "#00ffff" : "#555555"} />
        {fuelDisplay > 0 && <pointLight color="#00ffff" distance={5} intensity={2} />}
      </mesh>

      {/* HUD */}
      <Html position={[0, -2, 0]} center zIndexRange={[100, 0]}>
        <div style={{ 
            color: '#00ffff', 
            fontFamily: 'monospace', 
            textAlign: 'center', 
            textShadow: '0 0 5px #00ffff',
            background: 'rgba(0,0,0,0.5)',
            padding: '10px',
            borderRadius: '10px',
            border: '1px solid #00ffff',
            pointerEvents: 'none',
            userSelect: 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: '5px',
            minWidth: '220px'
        }}>
          <div style={{ fontSize: '20px', fontWeight: 'bold' }}>SPEED: {Math.round(speedDisplay * 100)} km/h</div>
          
          {/* Fuel Gauge */}
          <div style={{ width: '100%', background: '#333', height: '10px', borderRadius: '5px', overflow: 'hidden', border: '1px solid #555' }}>
            <div style={{ 
                width: `${fuelDisplay}%`, 
                height: '100%', 
                background: fuelDisplay < 20 ? '#ff0000' : (isRefueling ? '#ffff00' : '#00ffff'),
                transition: 'width 0.1s, background 0.2s'
            }} />
          </div>
          <div style={{ fontSize: '10px', display: 'flex', justifyContent: 'space-between' }}>
             <span>FUEL</span>
             {isRefueling && <span style={{ color: '#ffff00', animation: 'pulse 0.5s infinite' }}>SOLAR CHARGING</span>}
             {fuelDisplay < 20 && !isRefueling && <span style={{ color: '#ff0000', animation: 'pulse 0.5s infinite' }}>LOW FUEL</span>}
          </div>

          {activeMission && (
             <div style={{ color: '#ffaa00', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px', animation: 'pulse 2s infinite' }}>
                MISSION TARGET: {activeMission.target.toUpperCase()}
             </div>
          )}

          {/* Radar Display */}
          <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              border: '2px solid rgba(0, 255, 255, 0.5)',
              backgroundColor: 'rgba(0, 20, 40, 0.8)',
              position: 'relative',
              margin: '5px auto',
              overflow: 'hidden'
          }}>
              {/* Grid Lines */}
              <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'rgba(0, 255, 255, 0.2)' }} />
              <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', background: 'rgba(0, 255, 255, 0.2)' }} />
              
              {/* Center (Ship) */}
              <div style={{ position: 'absolute', top: '50%', left: '50%', width: '4px', height: '4px', background: 'white', transform: 'translate(-50%, -50%)', borderRadius: '50%' }} />
              
              {/* Blips */}
              {radarBlips.map((blip, i) => (
                  <div key={i} style={{
                      position: 'absolute',
                      top: `${50 - blip.y * 45}%`, 
                      left: `${50 + blip.x * 45}%`,
                      width: '6px',
                      height: '6px',
                      backgroundColor: blip.color,
                      borderRadius: '50%',
                      transform: 'translate(-50%, -50%)',
                      boxShadow: `0 0 4px ${blip.color}`
                  }} />
              ))}
          </div>

          {nearestPlanet && (
              <div style={{ 
                  color: '#4caf50', 
                  fontWeight: 'bold', 
                  background: 'rgba(0, 255, 0, 0.1)',
                  padding: '5px',
                  borderRadius: '5px',
                  border: '1px solid #4caf50'
              }}>
                  DETECTED: {nearestPlanet.name.toUpperCase()} <br/>
                  <span style={{ fontSize: '12px', color: 'white', animation: 'pulse 1s infinite' }}>PRESS [L] TO LAND</span>
                  
                  {!scannedObjects.includes(nearestPlanet.name) && (
                      <div style={{ marginTop: '5px', color: '#00ffff', fontSize: '12px', borderTop: '1px solid #004444', paddingTop: '2px' }}>
                          PRESS [F] TO SCAN
                      </div>
                  )}
                  {isScanning && <div style={{ color: '#00ff00', fontWeight: 'bold', animation: 'pulse 0.2s infinite' }}>SCANNING...</div>}
              </div>
          )}

          <div style={{ fontSize: '10px', marginTop: '5px', color: '#aaa' }}>
            [W/S] Pitch | [A/D] Yaw | [Q/E] Roll<br/>
            [SPACE] Thrust | [SHIFT] Brake
          </div>
        </div>
        <div style={{ marginTop: '10px', pointerEvents: 'auto', textAlign: 'center' }}>
             <button 
                onClick={onExit} 
                style={{ 
                    background: 'rgba(255, 0, 0, 0.8)', 
                    color: 'white', 
                    border: '1px solid white', 
                    padding: '5px 15px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    borderRadius: '5px'
                }}
            >
                EJECT PILOT
            </button>
        </div>
      </Html>
    </group>
  );
}