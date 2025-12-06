import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Html } from '@react-three/drei';
import * as THREE from 'three';
import { StarSystemData } from '../data/universeData';

function GalaxyParticles({ position, colorInside, colorOutside, radius, count }: { position?: [number, number, number], colorInside: string, colorOutside: string, radius: number, count: number }) {
  const points = useRef<THREE.Points>(null);

  const parameters = useMemo(() => ({
    count: count,
    size: 0.05,
    radius: radius,
    branches: 3,
    spin: 1,
    randomness: 0.2,
    randomnessPower: 3,
    insideColor: colorInside,
    outsideColor: colorOutside,
  }), [count, radius, colorInside, colorOutside]);

  const particles = useMemo(() => {
    const positions = new Float32Array(parameters.count * 3);
    const colors = new Float32Array(parameters.count * 3);

    const cInside = new THREE.Color(parameters.insideColor);
    const cOutside = new THREE.Color(parameters.outsideColor);

    for (let i = 0; i < parameters.count; i++) {
      const i3 = i * 3;
      const r = Math.random() * parameters.radius;
      const spinAngle = r * parameters.spin;
      const branchAngle = (i % parameters.branches) / parameters.branches * Math.PI * 2;

      const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * r;
      const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * r;
      const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * r;

      positions[i3] = Math.cos(branchAngle + spinAngle) * r + randomX;
      positions[i3 + 1] = randomY;
      positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * r + randomZ;

      const mixedColor = cInside.clone();
      mixedColor.lerp(cOutside, r / parameters.radius);

      colors[i3] = mixedColor.r;
      colors[i3 + 1] = mixedColor.g;
      colors[i3 + 2] = mixedColor.b;
    }

    return { positions, colors };
  }, [parameters]);

  useFrame((state) => {
    if (points.current) {
      points.current.rotation.y = state.clock.getElapsedTime() * 0.05;
    }
  });

  return (
    <points ref={points} position={position ? new THREE.Vector3(...position) : new THREE.Vector3(0,0,0)}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[particles.positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[particles.colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={parameters.size} sizeAttenuation={true} depthWrite={false} blending={THREE.AdditiveBlending} vertexColors={true} />
    </points>
  );
}

function SystemMarker({ system, onEnterSystem }: { system: StarSystemData, onEnterSystem: (id: string) => void }) {
    return (
        <group position={new THREE.Vector3(...system.position)}>
            <mesh onClick={() => onEnterSystem(system.id)} onPointerOver={() => document.body.style.cursor = 'pointer'} onPointerOut={() => document.body.style.cursor = 'auto'}>
                <sphereGeometry args={[0.5, 16, 16]} />
                <meshBasicMaterial color={system.star.color} />
            </mesh>
            <mesh>
                <ringGeometry args={[0.6, 0.7, 32]} />
                <meshBasicMaterial color={system.star.color} side={THREE.DoubleSide} transparent opacity={0.5} />
            </mesh>
            <Html distanceFactor={15} zIndexRange={[100, 0]}>
                <div style={{ transform: 'translate3d(-50%, -100%, 0)', textAlign: 'center' }}>
                    <div style={{ 
                        color: system.star.color, 
                        fontWeight: 'bold', 
                        marginBottom: '5px', 
                        textShadow: '0 0 5px black',
                        whiteSpace: 'nowrap'
                    }}>
                        {system.name}
                    </div>
                    <button 
                        onClick={() => onEnterSystem(system.id)}
                        style={{ 
                            background: 'rgba(25, 118, 210, 0.9)', 
                            border: '1px solid #444', 
                            color: 'white', 
                            padding: '5px 10px', 
                            borderRadius: '15px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '10px',
                            boxShadow: '0 0 10px rgba(25, 118, 210, 0.5)'
                        }}
                    >
                        Warp Here
                    </button>
                </div>
            </Html>
            <pointLight color={system.star.color} intensity={2} distance={10} />
        </group>
    )
}

export default function Galaxy({ systems, onEnterSystem }: { systems: StarSystemData[], onEnterSystem: (id: string) => void }) {
  return (
    <div style={{ width: '100vw', height: '100vh', background: 'black' }}>
      <Canvas camera={{ position: [0, 40, 40], fov: 45 }}>
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
        <Stars radius={300} depth={60} count={20000} factor={7} saturation={0} fade speed={1} />
        
        {/* Milky Way */}
        <GalaxyParticles colorInside='#ff6030' colorOutside='#1b3984' radius={50} count={20000} />
        
        {/* Andromeda (Neighboring Galaxy) - Far away */}
        <GalaxyParticles position={[80, 20, -100]} colorInside='#ffaaaa' colorOutside='#aa00ff' radius={30} count={10000} />
        <Html position={[80, 20, -100]} distanceFactor={50}>
            <div style={{ color: '#d8bfd8', fontWeight: 'bold', textShadow: '0 0 5px black' }}>Andromeda Galaxy</div>
        </Html>

        {systems.map(sys => (
            <SystemMarker key={sys.id} system={sys} onEnterSystem={onEnterSystem} />
        ))}
      </Canvas>
    </div>
  );
}