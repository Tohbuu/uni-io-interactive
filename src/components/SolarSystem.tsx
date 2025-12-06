import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Html } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import Spaceship from './Spaceship';
import { StarSystemData, CelestialBodyData, MoonData } from '../data/universeData';
import { ShipStats } from '../context/AuthContext';

// Define Mission interface compatible with App.tsx
export interface Mission {
  id: number;
  target: string;
  title: string;
  description: string;
  reward: string;
}

// --- Components ---

function ISS() {
  const ref = useRef<THREE.Group>(null);
  
  useFrame(({ clock }) => {
    if (ref.current) {
      const t = clock.getElapsedTime() * 0.5; // Orbit speed
      const radius = 0.85; // Distance from Earth center (Earth is 0.6 size)
      
      // Orbit logic
      ref.current.position.x = Math.cos(t) * radius;
      ref.current.position.z = Math.sin(t) * radius;
      ref.current.position.y = Math.sin(t * 2) * 0.1; // Slight inclination
      
      // Rotate to face direction of movement
      ref.current.rotation.y = -t;
    }
  });

  return (
    <group ref={ref}>
      {/* Main Body */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.02, 0.02, 0.15, 8]} />
        <meshStandardMaterial color="#dddddd" />
      </mesh>
      {/* Solar Panels Array 1 */}
      <mesh position={[0, 0, 0.05]}>
        <boxGeometry args={[0.3, 0.01, 0.08]} />
        <meshStandardMaterial color="#111111" roughness={0.2} metalness={0.8} />
      </mesh>
      {/* Solar Panels Array 2 */}
      <mesh position={[0, 0, -0.05]}>
        <boxGeometry args={[0.3, 0.01, 0.08]} />
        <meshStandardMaterial color="#111111" roughness={0.2} metalness={0.8} />
      </mesh>
      <Html distanceFactor={8}>
        <div style={{ color: '#aaa', fontSize: '8px', pointerEvents: 'none' }}>ISS</div>
      </Html>
    </group>
  );
}

function AsteroidBelt({ timeRef }: { timeRef: React.MutableRefObject<number> }) {
  const asteroidCount = 800;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useEffect(() => {
    if (meshRef.current) {
      for (let i = 0; i < asteroidCount; i++) {
        const angle = (Math.random() * Math.PI * 2);
        const radius = 13 + Math.random() * 2.5;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = (Math.random() - 0.5) * 1.5;

        dummy.position.set(x, y, z);
        dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        const scale = Math.random() * 0.15 + 0.05;
        dummy.scale.set(scale, scale, scale);
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(i, dummy.matrix);
      }
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [dummy, asteroidCount]);

  useFrame(() => {
    if (meshRef.current) {
      // Rotate the belt slowly based on time
      meshRef.current.rotation.y = timeRef.current * 0.05;
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, asteroidCount]}>
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#666666" roughness={0.8} />
    </instancedMesh>
  );
}

function Comet({ timeRef }: { timeRef: React.MutableRefObject<number> }) {
  const ref = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (ref.current) {
      const t = timeRef.current * 0.8; // Comet speed
      // Elliptical orbit logic
      const a = 35; // Semi-major axis
      const b = 20; // Semi-minor axis
      const x = Math.cos(t) * a;
      const z = Math.sin(t) * b;
      
      ref.current.position.set(x, 0, z);
      
      // Orient tail away from sun (0,0,0) roughly, or just along path
      ref.current.lookAt(0, 0, 0);
      ref.current.rotateY(Math.PI / 2); // Adjust to face forward
    }
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.3, 16, 16]} />
      <meshStandardMaterial color="white" emissive="white" emissiveIntensity={2} />
      {/* Comet Tail */}
      <mesh position={[0, 0, 2]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.4, 6, 32]} />
        <meshBasicMaterial color="#aaddff" transparent opacity={0.3} />
      </mesh>
    </mesh>
  );
}

function OrbitPath({ radius }: { radius: number }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[radius - 0.05, radius + 0.05, 128]} />
      <meshBasicMaterial color="#ffffff" opacity={0.15} transparent side={THREE.DoubleSide} />
    </mesh>
  );
}

function Moon({ size, distance, speed, color, timeRef, parentDistance, parentSpeed }: MoonData & { timeRef: React.MutableRefObject<number>, parentDistance: number, parentSpeed: number }) {
  const ref = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (ref.current) {
      // Calculate parent position again to keep in sync (or use a group structure, but this is robust for time travel)
      // Actually, since this is inside the Planet group, we only need local rotation
      const t = timeRef.current * speed;
      ref.current.position.x = Math.cos(t) * distance;
      ref.current.position.z = Math.sin(t) * distance;
    }
  });

  return (
    <mesh ref={ref} position={[distance, 0, 0]}>
      <sphereGeometry args={[size, 16, 16]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

// Helper to calculate position for camera tracking
const getPlanetPosition = (distance: number, speed: number, time: number) => {
  const angle = time * speed * 0.5;
  return new THREE.Vector3(
    Math.cos(angle) * distance,
    0,
    Math.sin(angle) * distance
  );
};

function Atmosphere({ size, color }: { size: number, color: string }) {
  return (
    <mesh>
      <sphereGeometry args={[size * 1.2, 32, 32]} />
      <meshBasicMaterial 
        color={color} 
        transparent 
        opacity={0.2} 
        blending={THREE.AdditiveBlending} 
        side={THREE.BackSide} 
      />
    </mesh>
  );
}

interface PlanetProps extends CelestialBodyData {
  onClick: (name: string) => void;
  timeRef: React.MutableRefObject<number>;
  showOrbits: boolean;
}

function Planet({ name, color, size, distance, speed, hasRings, moons, atmosphereColor, onClick, timeRef, showOrbits }: PlanetProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHover] = useState(false);
  
  useFrame(({ clock }) => {
    if (groupRef.current) {
      const pos = getPlanetPosition(distance, speed, timeRef.current);
      groupRef.current.position.copy(pos);
    }
  });

  return (
    <group>
      {showOrbits && <OrbitPath radius={distance} />}
      <group ref={groupRef}>
        {atmosphereColor && <Atmosphere size={size} color={atmosphereColor} />}
        {name === "Earth" && <ISS />}
        <mesh 
          onClick={(e) => { e.stopPropagation(); onClick(name); }}
          onPointerOver={() => { document.body.style.cursor = 'pointer'; setHover(true); }}
          onPointerOut={() => { document.body.style.cursor = 'auto'; setHover(false); }}
        >
          <sphereGeometry args={[size, 32, 32]} />
          <meshStandardMaterial 
            color={color} 
            emissive={color}
            emissiveIntensity={hovered ? 0.5 : 0}
          />
          {hasRings && (
             <mesh rotation={[-Math.PI / 2, 0, 0]}>
               <ringGeometry args={[size * 1.4, size * 2.2, 32]} />
               <meshStandardMaterial color={color} opacity={0.6} transparent side={THREE.DoubleSide} />
             </mesh>
          )}
          <Html distanceFactor={15}>
            <div style={{ 
              color: hovered ? '#4caf50' : 'white', 
              fontSize: '10px', 
              fontFamily: 'Arial', 
              textShadow: '0 0 2px black', 
              pointerEvents: 'none',
              transition: 'color 0.2s'
            }}>
              {name}
            </div>
          </Html>
        </mesh>
        {moons?.map((moon, idx) => (
          <Moon key={idx} {...moon} timeRef={timeRef} parentDistance={distance} parentSpeed={speed} />
        ))}
      </group>
    </group>
  );
}

function Sun({ data, onClick }: { data: CelestialBodyData, onClick: (name: string) => void }) {
  const [hovered, setHover] = useState(false);

  return (
    <mesh 
      position={[0, 0, 0]}
      onClick={(e) => { e.stopPropagation(); onClick(data.name); }}
      onPointerOver={() => { document.body.style.cursor = 'pointer'; setHover(true); }}
      onPointerOut={() => { document.body.style.cursor = 'auto'; setHover(false); }}
    >
      <sphereGeometry args={[data.size, 32, 32]} />
      <meshStandardMaterial 
        emissive={data.color} 
        emissiveIntensity={hovered ? 3 : 2} 
        color={data.color} 
      />
      <pointLight intensity={2} distance={100} decay={2} color="white" />
    </mesh>
  );
}

function CameraUpdater({ selectedPlanet, controlsRef, timeRef, viewMode, systemData }: { selectedPlanet: string | null, controlsRef: any, timeRef: React.MutableRefObject<number>, viewMode: 'orbit' | 'ship', systemData: StarSystemData }) {
  useFrame(() => {
    if (viewMode === 'orbit' && selectedPlanet && controlsRef.current) {
      if (selectedPlanet === systemData.star.name) {
        controlsRef.current.target.lerp(new THREE.Vector3(0, 0, 0), 0.1);
      } else {
        const planet = systemData.planets.find(p => p.name === selectedPlanet);
        if (planet) {
          const targetPos = getPlanetPosition(planet.distance, planet.speed, timeRef.current);
          controlsRef.current.target.lerp(targetPos, 0.1);
        }
      }
      controlsRef.current.update();
    }
  });
  return null;
}

interface SolarSystemProps {
  systemData: StarSystemData;
  onPlanetSelect: (name: string) => void;
  selectedPlanet: string | null;
  simulationSpeed: number;
  showOrbits: boolean;
  viewMode: 'orbit' | 'ship';
  onExitShip: () => void;
  activeMission?: Mission | null;
  scannedObjects: string[]; // New
  onScan: (name: string) => void; // New
  stats: ShipStats; // New
}

function SceneContent({ systemData, onPlanetSelect, selectedPlanet, simulationSpeed, showOrbits, viewMode, onExitShip, activeMission, scannedObjects, onScan, stats }: SolarSystemProps) {
  const controlsRef = useRef<any>(null);
  const timeRef = useRef(0);

  useFrame((_, delta) => {
    timeRef.current += delta * simulationSpeed;
  });

  return (
    <>
      <ambientLight intensity={0.1} />
      <Stars radius={300} depth={60} count={20000} factor={7} saturation={0} fade speed={1} />
      
      <Sun data={systemData.star} onClick={onPlanetSelect} />
      
      {/* Only show asteroids/comets in Solar System for now */}
      {systemData.id === 'sol' && (
        <>
            <AsteroidBelt timeRef={timeRef} />
            <Comet timeRef={timeRef} />
        </>
      )}
      
      {systemData.planets.map((planet) => (
        <Planet 
          key={planet.name} 
          {...planet} 
          onClick={onPlanetSelect} 
          timeRef={timeRef}
          showOrbits={showOrbits}
        />
      ))}

      <CameraUpdater selectedPlanet={selectedPlanet} controlsRef={controlsRef} timeRef={timeRef} viewMode={viewMode} systemData={systemData} />

      <EffectComposer>
        <Bloom luminanceThreshold={0} luminanceSmoothing={0.9} height={300} intensity={1.5} />
      </EffectComposer>

      {viewMode === 'orbit' && (
        <OrbitControls ref={controlsRef} enablePan={true} enableZoom={true} enableRotate={true} />
      )}

      {viewMode === 'ship' && (
        <Spaceship 
            onExit={onExitShip} 
            onLand={(name) => onPlanetSelect(name)}
            planets={systemData.planets}
            timeRef={timeRef}
            activeMission={activeMission}
            scannedObjects={scannedObjects}
            onScan={onScan}
            stats={stats} // Pass stats
        />
      )}
    </>
  );
}

export default function SolarSystem(props: SolarSystemProps) {
  return (
    <div style={{ width: '100vw', height: '100vh', background: 'black' }}>
      <Canvas camera={{ position: [0, 30, 40], fov: 50 }}>
        <SceneContent {...props} />
      </Canvas>
    </div>
  );
}