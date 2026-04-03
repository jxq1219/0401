import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SatelliteProps {
  orbitDistance?: number;
  orbitSpeed?: number;
}

export function Satellite({ orbitDistance = 8, orbitSpeed = 0.5 }: SatelliteProps) {
  const satelliteRef = useRef<THREE.Group>(null);
  const angleRef = useRef(0);

  // 月球轨道倾角 23.5度
  const inclination = (23.5 * Math.PI) / 180;

  // 计算卫星位置的函数
  const calculatePosition = (time: number): THREE.Vector3 => {
    const angle = time * orbitSpeed;
    const x = orbitDistance * Math.cos(angle);
    const z = orbitDistance * Math.sin(angle);
    const y = orbitDistance * Math.sin(angle) * Math.sin(inclination);
    return new THREE.Vector3(x, y, z);
  };

  useFrame((state, delta) => {
    if (satelliteRef.current) {
      angleRef.current += delta * orbitSpeed;
      const position = calculatePosition(angleRef.current);
      satelliteRef.current.position.copy(position);

      // 让卫星面向月球
      satelliteRef.current.lookAt(0, 0, 0);
    }
  });

  return (
    <group ref={satelliteRef}>
      {/* 卫星主体 */}
      <mesh castShadow>
        <boxGeometry args={[0.3, 0.3, 0.3]} />
        <meshStandardMaterial
          color="silver"
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* 太阳能板 */}
      <mesh position={[0.4, 0, 0]}>
        <boxGeometry args={[0.5, 0.02, 0.3]} />
        <meshStandardMaterial
          color="#1a1a2e"
          metalness={0.5}
          roughness={0.3}
        />
      </mesh>
      <mesh position={[-0.4, 0, 0]}>
        <boxGeometry args={[0.5, 0.02, 0.3]} />
        <meshStandardMaterial
          color="#1a1a2e"
          metalness={0.5}
          roughness={0.3}
        />
      </mesh>

      {/* 信号指示灯 */}
      <mesh position={[0, 0.2, 0]}>
        <sphereGeometry args={[0.03]} />
        <meshStandardMaterial
          color="#00ff00"
          emissive="#00ff00"
          emissiveIntensity={0.8}
        />
      </mesh>
    </group>
  );
}
