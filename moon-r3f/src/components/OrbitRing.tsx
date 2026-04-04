import { useMemo } from 'react';
import * as THREE from 'three';
import type { OrbitRingProps } from '../types';

export function OrbitRing({ visible, radius = 8, color = '#4488ff' }: OrbitRingProps) {
  const inclination = 23.5 * (Math.PI / 180);

  const geometry = useMemo(() => {
    return new THREE.TorusGeometry(radius, 0.02, 16, 128);
  }, [radius]);

  if (!visible) return null;

  return (
    <mesh
      geometry={geometry}
      rotation={[inclination, 0, 0]}
    >
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.6}
      />
    </mesh>
  );
}
