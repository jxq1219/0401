import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import type { SatelliteProps } from '../types';

export function Satellite({ orbitDistance, orbitSpeed, size = 0.3, color = 'silver' }: SatelliteProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const timeRef = useRef(0);

  const inclination = 23.5 * (Math.PI / 180);

  useFrame((state, delta) => {
    timeRef.current += delta * orbitSpeed;

    if (groupRef.current) {
      const t = timeRef.current;
      const x = orbitDistance * Math.cos(t);
      const z = orbitDistance * Math.sin(t);
      const y = orbitDistance * Math.sin(t) * Math.sin(inclination);

      groupRef.current.position.set(x, y, z);
      groupRef.current.rotation.y = t;
      groupRef.current.updateMatrixWorld(true);
    }

    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 2;
      meshRef.current.rotation.x += delta * 0.5;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef}>
        <boxGeometry args={[size, size * 0.5, size * 1.5]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[size, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[size * 0.05, size * 1.2, size * 0.8]} />
        <meshStandardMaterial color="#4488ff" metalness={0.3} roughness={0.5} transparent opacity={0.8} />
      </mesh>
      <mesh position={[-size, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[size * 0.05, size * 1.2, size * 0.8]} />
        <meshStandardMaterial color="#4488ff" metalness={0.3} roughness={0.5} transparent opacity={0.8} />
      </mesh>
      <Html position={[0, size, 0]} center distanceFactor={20}>
        <div style={{
          background: 'rgba(68, 136, 255, 0.8)',
          color: 'white',
          padding: '2px 6px',
          borderRadius: '3px',
          fontSize: '8px',
          whiteSpace: 'nowrap',
          pointerEvents: 'none'
        }}>
          卫星
        </div>
      </Html>
    </group>
  );
}
