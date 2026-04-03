import { useRef } from 'react';
import * as THREE from 'three';

interface OrbitRingProps {
  visible: boolean;
}

export function OrbitRing({ visible }: OrbitRingProps) {
  const ringRef = useRef<THREE.Mesh>(null);
  
  // 月球轨道倾角 23.5度
  const inclination = (23.5 * Math.PI) / 180;

  if (!visible) return null;

  return (
    <group rotation={[inclination, 0, 0]}>
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[8, 0.02, 16, 100]} />
        <meshBasicMaterial color="#4488ff" transparent opacity={0.5} />
      </mesh>
    </group>
  );
}
