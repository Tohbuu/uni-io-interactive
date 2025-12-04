import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Html } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import Spaceship from './Spaceship'; // Import Spaceship

// Define Mission interface compatible with App.tsx
export interface Mission {
  id: number;
  target: string;
  title: string;
  description: string;
  reward: string;
}

// --- Types ---
interface MoonData {
  name: string;
  size: number;
  distance: number;
  speed: number;
  color: string;
}

export interface PlanetData {
  name: string;
  color: string;
  size: number;
  distance: number;
  speed: number;
  description: string;
  hasRings?: boolean;
  moons?: MoonData[];
  atmosphereColor?: string;
  // New Scientific Data
  realDiameter: string;
  temperature: string;
  yearDuration: string;
}

// --- Data ---
export const planetData: PlanetData[] = [
  { 
    name: "Mercury", color: "#A5A5A5", size: 0.4, distance: 6, speed: 1.5, 
    description: "The smallest planet in the Solar System and the closest to the Sun.",
    realDiameter: "4,880 km", temperature: "167°C", yearDuration: "88 days"
  },
  { 
    name: "Venus", color: "#E3BB76", size: 0.6, distance: 8, speed: 1.2, 
    description: "The second planet from the Sun. It has a thick atmosphere trapping heat.", atmosphereColor: "#ffddaa",
    realDiameter: "12,104 km", temperature: "464°C", yearDuration: "225 days"
  },
  { 
    name: "Earth", color: "#2233FF", size: 0.6, distance: 10, speed: 1.0, 
    description: "Our home planet, the only known celestial body to support life.", atmosphereColor: "#4488ff",
    realDiameter: "12,742 km", temperature: "15°C", yearDuration: "365 days",
    moons: [{ name: "Moon", size: 0.15, distance: 1.2, speed: 3, color: "#DDDDDD" }]
  },
  { 
    name: "Mars", color: "#FF4500", size: 0.5, distance: 12, speed: 0.8, 
    description: "The Red Planet, known for its iron oxide rich surface.", atmosphereColor: "#ffccaa",
    realDiameter: "6,779 km", temperature: "-65°C", yearDuration: "687 days"
  },
  { 
    name: "Jupiter", color: "#D2B48C", size: 1.5, distance: 16, speed: 0.5, 
    description: "The largest planet in the Solar System, a gas giant with a Great Red Spot.",
    realDiameter: "139,820 km", temperature: "-110°C", yearDuration: "12 years"
  },
  { 
    name: "Saturn", color: "#F4A460", size: 1.2, distance: 20, speed: 0.4, hasRings: true, 
    description: "Famous for its prominent ring system, composed mainly of ice particles.",
    realDiameter: "116,460 km", temperature: "-140°C", yearDuration: "29 years"
  },
  { 
    name: "Uranus", color: "#ADD8E6", size: 1.0, distance: 24, speed: 0.3, 
    description: "An ice giant with a pale blue color due to methane in its atmosphere.",
    realDiameter: "50,724 km", temperature: "-195°C", yearDuration: "84 years"
  },
  { 
    name: "Neptune", color: "#00008B", size: 1.0, distance: 28, speed: 0.2, 
    description: "The most distant planet, known for its supersonic winds.",
    realDiameter: "49,244 km", temperature: "-200°C", yearDuration: "165 years"
  },
];

export const sunData: PlanetData = {
  name: "Sun",
  color: "#FFD700",
  size: 2.5,
  distance: 0,
  speed: 0,
  description: "The star at the center of our Solar System. It is a nearly perfect sphere of hot plasma.",
  realDiameter: "1,392,700 km",
  temperature: "5,500°C",
  yearDuration: "N/A"
};

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

interface PlanetProps extends PlanetData {
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
        {/* Atmosphere Effect */}
        {atmosphereColor && <Atmosphere size={size} color={atmosphereColor} />}
        
        {/* ISS for Earth */}
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

function Sun({ onClick }: { onClick: (name: string) => void }) {
  const [hovered, setHover] = useState(false);

  return (
    <mesh 
      position={[0, 0, 0]}
      onClick={(e) => { e.stopPropagation(); onClick("Sun"); }}
      onPointerOver={() => { document.body.style.cursor = 'pointer'; setHover(true); }}
      onPointerOut={() => { document.body.style.cursor = 'auto'; setHover(false); }}
    >
      <sphereGeometry args={[2.5, 32, 32]} />
      <meshStandardMaterial 
        emissive="#FFD700" 
        emissiveIntensity={hovered ? 3 : 2} 
        color="#FFD700" 
      />
      <pointLight intensity={2} distance={100} decay={2} color="white" />
    </mesh>
  );
}

function CameraUpdater({ selectedPlanet, controlsRef, timeRef, viewMode }: { selectedPlanet: string | null, controlsRef: any, timeRef: React.MutableRefObject<number>, viewMode: 'orbit' | 'ship' }) {
  useFrame(() => {
    // Only update camera if in orbit mode and a planet is selected
    if (viewMode === 'orbit' && selectedPlanet && controlsRef.current) {
      if (selectedPlanet === "Sun") {
        controlsRef.current.target.lerp(new THREE.Vector3(0, 0, 0), 0.1);
      } else {
        const planet = planetData.find(p => p.name === selectedPlanet);
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
  onPlanetSelect: (name: string) => void;
  selectedPlanet: string | null;
  simulationSpeed: number;
  showOrbits: boolean;
  viewMode: 'orbit' | 'ship';
  onExitShip: () => void;
  activeMission?: Mission | null; // New prop
}

function SceneContent({ onPlanetSelect, selectedPlanet, simulationSpeed, showOrbits, viewMode, onExitShip, activeMission }: SolarSystemProps) {
  const controlsRef = useRef<any>(null);
  const timeRef = useRef(0);

  useFrame((_, delta) => {
    timeRef.current += delta * simulationSpeed;
  });

  return (
    <>
      <ambientLight intensity={0.1} />
      <Stars radius={300} depth={60} count={20000} factor={7} saturation={0} fade speed={1} />
      
      <Sun onClick={onPlanetSelect} />
      <AsteroidBelt timeRef={timeRef} />
      <Comet timeRef={timeRef} />
      
      {planetData.map((planet) => (
        <Planet 
          key={planet.name} 
          {...planet} 
          onClick={onPlanetSelect} 
          timeRef={timeRef}
          showOrbits={showOrbits}
        />
      ))}

      <CameraUpdater selectedPlanet={selectedPlanet} controlsRef={controlsRef} timeRef={timeRef} viewMode={viewMode} />

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
            planets={planetData}
            timeRef={timeRef}
            activeMission={activeMission}
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