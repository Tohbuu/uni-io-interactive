import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Html } from '@react-three/drei';
import * as THREE from 'three';

function GalaxyParticles() {
  const points = useRef<THREE.Points>(null);

  // Galaxy parameters
  const parameters = useMemo(() => ({
    count: 20000,
    size: 0.05,
    radius: 50,
    branches: 3,
    spin: 1,
    randomness: 0.2,
    randomnessPower: 3,
    insideColor: '#ff6030',
    outsideColor: '#1b3984',
  }), []);

  const particles = useMemo(() => {
    const positions = new Float32Array(parameters.count * 3);
    const colors = new Float32Array(parameters.count * 3);

    const colorInside = new THREE.Color(parameters.insideColor);
    const colorOutside = new THREE.Color(parameters.outsideColor);

    for (let i = 0; i < parameters.count; i++) {
      const i3 = i * 3;

      // Position logic
      const radius = Math.random() * parameters.radius;
      const spinAngle = radius * parameters.spin;
      const branchAngle = (i % parameters.branches) / parameters.branches * Math.PI * 2;

      const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius;
      const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius;
      const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius;

      positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
      positions[i3 + 1] = randomY;
      positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

      // Color logic
      const mixedColor = colorInside.clone();
      mixedColor.lerp(colorOutside, radius / parameters.radius);

      colors[i3] = mixedColor.r;
      colors[i3 + 1] = mixedColor.g;
      colors[i3 + 2] = mixedColor.b;
    }

    return { positions, colors };
  }, [parameters]);

  useFrame((state) => {
    if (points.current) {
      // Slowly rotate the whole galaxy
      points.current.rotation.y = state.clock.getElapsedTime() * 0.05;
    }
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particles.positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[particles.colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={parameters.size}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexColors={true}
      />
    </points>
  );
}

function SolarSystemMarker({ onEnterSystem }: { onEnterSystem: () => void }) {
    return (
        <group position={[15, 0, 5]}>
            <mesh onClick={onEnterSystem} onPointerOver={() => document.body.style.cursor = 'pointer'} onPointerOut={() => document.body.style.cursor = 'auto'}>
                <sphereGeometry args={[0.5, 16, 16]} />
                <meshBasicMaterial color="#ffff00" />
            </mesh>
            <mesh>
                <ringGeometry args={[0.6, 0.7, 32]} />
                <meshBasicMaterial color="#ffff00" side={THREE.DoubleSide} transparent opacity={0.5} />
            </mesh>
            <Html distanceFactor={15} zIndexRange={[100, 0]}>
                <div style={{ transform: 'translate3d(-50%, -100%, 0)', textAlign: 'center' }}>
                    <div style={{ 
                        color: '#ffff00', 
                        fontWeight: 'bold', 
                        marginBottom: '5px', 
                        textShadow: '0 0 5px black',
                        whiteSpace: 'nowrap'
                    }}>
                        You are here
                    </div>
                    <button 
                        onClick={onEnterSystem}
                        style={{ 
                            background: 'rgba(25, 118, 210, 0.9)', 
                            border: '1px solid #444', 
                            color: 'white', 
                            padding: '8px 16px', 
                            borderRadius: '20px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            boxShadow: '0 0 10px rgba(25, 118, 210, 0.5)'
                        }}
                    >
                        Enter Solar System
                    </button>
                </div>
            </Html>
            <pointLight color="yellow" intensity={2} distance={10} />
        </group>
    )
}

export default function Galaxy({ onEnterSystem }: { onEnterSystem: () => void }) {
  return (
    <div style={{ width: '100vw', height: '100vh', background: 'black' }}>
      <Canvas camera={{ position: [0, 40, 40], fov: 45 }}>
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
        <Stars radius={300} depth={60} count={20000} factor={7} saturation={0} fade speed={1} />
        <GalaxyParticles />
        <SolarSystemMarker onEnterSystem={onEnterSystem} />
      </Canvas>
    </div>
  );
}