import { useRef, useCallback, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import type { MarkerData } from '../types';

interface MoonProps {
  rotationSpeed: number;
  roughness: number;
  metalness: number;
  clearcoat: number;
  onMark: (marker: MarkerData) => void;
  markers: MarkerData[];
}

// 生成月球表面坑洼和顶点颜色的函数
function generateMoonSurfaceWithColors(radius: number, segments: number): { geometry: THREE.SphereGeometry; colors: Float32Array } {
  const geometry = new THREE.SphereGeometry(radius, segments, segments);
  const positions = geometry.attributes.position.array as Float32Array;
  const colors = new Float32Array(positions.length);
  const vertex = new THREE.Vector3();
  const color = new THREE.Color();

  // 陨石坑数据：位置(归一化向量) + 深度 + 半径
  const craters = [
    { pos: new THREE.Vector3(0.3, 0.8, 0.5), depth: 0.15, radius: 0.25 },
    { pos: new THREE.Vector3(-0.5, 0.6, 0.6), depth: 0.12, radius: 0.2 },
    { pos: new THREE.Vector3(0.7, 0.2, 0.7), depth: 0.18, radius: 0.3 },
    { pos: new THREE.Vector3(-0.3, -0.4, 0.9), depth: 0.1, radius: 0.18 },
    { pos: new THREE.Vector3(0.6, -0.6, 0.5), depth: 0.14, radius: 0.22 },
    { pos: new THREE.Vector3(-0.8, 0.3, 0.5), depth: 0.16, radius: 0.28 },
    { pos: new THREE.Vector3(0.2, 0.9, 0.4), depth: 0.08, radius: 0.15 },
    { pos: new THREE.Vector3(-0.6, -0.7, 0.4), depth: 0.11, radius: 0.19 },
    { pos: new THREE.Vector3(0.9, 0.1, 0.4), depth: 0.13, radius: 0.21 },
    { pos: new THREE.Vector3(-0.2, 0.4, -0.9), depth: 0.17, radius: 0.26 },
    { pos: new THREE.Vector3(0.4, -0.3, -0.9), depth: 0.09, radius: 0.16 },
    { pos: new THREE.Vector3(-0.7, -0.2, -0.7), depth: 0.15, radius: 0.24 },
    { pos: new THREE.Vector3(0.1, -0.9, 0.4), depth: 0.12, radius: 0.2 },
    { pos: new THREE.Vector3(-0.4, 0.7, -0.6), depth: 0.1, radius: 0.17 },
    { pos: new THREE.Vector3(0.8, -0.4, 0.4), depth: 0.14, radius: 0.23 },
    { pos: new THREE.Vector3(-0.1, 0.5, 0.85), depth: 0.11, radius: 0.19 },
    { pos: new THREE.Vector3(0.5, -0.8, 0.3), depth: 0.13, radius: 0.21 },
    { pos: new THREE.Vector3(-0.9, -0.1, 0.4), depth: 0.1, radius: 0.18 },
    { pos: new THREE.Vector3(0.3, 0.3, 0.9), depth: 0.09, radius: 0.16 },
    { pos: new THREE.Vector3(-0.5, 0.8, -0.3), depth: 0.12, radius: 0.2 },
  ];

  // 对每个顶点应用坑洼效果和颜色
  for (let i = 0; i < positions.length; i += 3) {
    vertex.set(positions[i], positions[i + 1], positions[i + 2]);
    const originalLength = vertex.length();
    const normalizedVertex = vertex.clone().normalize();

    let displacement = 0;
    let craterInfluence = 0;

    // 应用每个陨石坑的影响
    for (const crater of craters) {
      const distance = normalizedVertex.distanceTo(crater.pos);
      if (distance < crater.radius) {
        // 使用平滑函数创建坑洼边缘
        const factor = 1 - (distance / crater.radius);
        const smoothFactor = factor * factor * (3 - 2 * factor); // smoothstep
        displacement -= crater.depth * smoothFactor;
        craterInfluence = Math.max(craterInfluence, smoothFactor);
      }
    }

    // 添加一些随机噪点模拟小坑洼
    const noise = (Math.random() - 0.5) * 0.025;
    displacement += noise;

    // 应用位移
    const newLength = originalLength + displacement;
    normalizedVertex.multiplyScalar(newLength);

    positions[i] = normalizedVertex.x;
    positions[i + 1] = normalizedVertex.y;
    positions[i + 2] = normalizedVertex.z;

    // 计算颜色 - 使用更自然的月球色调
    // 基础颜色：月球灰 #b8b8b8
    const baseColor = new THREE.Color(0xb8b8b8);

    // 陨石坑颜色：稍深的灰色 #8a8a8a（不要太黑）
    const craterColor = new THREE.Color(0x8a8a8a);

    // 高地颜色：稍亮的灰色 #d0d0d0
    const highlandColor = new THREE.Color(0xd0d0d0);

    if (craterInfluence > 0) {
      // 在陨石坑内：轻微变暗，不要太突兀
      color.copy(baseColor).lerp(craterColor, craterInfluence * 0.4);
    } else if (displacement > 0.01) {
      // 高地：轻微变亮
      color.copy(baseColor).lerp(highlandColor, Math.min(displacement * 3, 0.2));
    } else {
      // 平坦区域：基础色
      color.copy(baseColor);
    }

    // 添加非常细微的随机颜色变化，模拟月球表面纹理
    const colorNoise = (Math.random() - 0.5) * 0.03;
    color.r += colorNoise;
    color.g += colorNoise;
    color.b += colorNoise;

    colors[i] = color.r;
    colors[i + 1] = color.g;
    colors[i + 2] = color.b;
  }

  geometry.computeVertexNormals();
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  return { geometry, colors };
}

export function Moon({ rotationSpeed, roughness, metalness, clearcoat, onMark, markers }: MoonProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { camera, raycaster, pointer, scene } = useThree();

  // 生成带坑洼和颜色的月球几何体
  const moonData = useMemo(() => {
    return generateMoonSurfaceWithColors(5, 128);
  }, []);

  // 调试：确认月球已添加到场景
  useEffect(() => {
    if (meshRef.current) {
      console.log('✅ 月球Mesh已创建（带表面坑洼和颜色）');
      console.log('月球位置:', meshRef.current.position);
      console.log('月球半径: 5');
      console.log('场景对象数:', scene.children.length);
    }
  }, [scene]);

  // 自转动画
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += rotationSpeed * delta;
    }
  });

  // 点击检测
  const handleClick = useCallback((event: THREE.Event<MouseEvent>) => {
    event.stopPropagation();

    if (!meshRef.current) return;

    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObject(meshRef.current);

    if (intersects.length > 0) {
      const point = intersects[0].point;
      const normal = intersects[0].face?.normal || new THREE.Vector3(0, 1, 0);

      // 计算经纬度（半径为5）
      const lat = Math.asin(point.y / 5) * (180 / Math.PI);
      const lon = Math.atan2(point.z, point.x) * (180 / Math.PI);

      const marker: MarkerData = {
        id: Date.now().toString(),
        position: point.clone().add(normal.multiplyScalar(0.1)),
        lat,
        lon
      };

      onMark(marker);
    }
  }, [camera, raycaster, pointer, onMark]);

  return (
    <group position={[0, 0, 0]}>
      {/* 月球主体 - 带表面坑洼和顶点颜色 */}
      <mesh
        ref={meshRef}
        onClick={handleClick}
        castShadow
        receiveShadow
        position={[0, 0, 0]}
        geometry={moonData.geometry}
      >
        <meshStandardMaterial
          vertexColors
          roughness={roughness}
          metalness={metalness}
          emissive="#111111"
          emissiveIntensity={0.1}
          flatShading={false}
        />
      </mesh>

      {/* 标记点 */}
      {markers.map((marker) => (
        <group key={marker.id} position={marker.position}>
          <mesh>
            <boxGeometry args={[0.2, 0.4, 0.05]} />
            <meshStandardMaterial color="red" emissive="red" emissiveIntensity={0.5} />
          </mesh>
          <Html distanceFactor={10}>
            <div style={{
              color: 'white',
              fontSize: '12px',
              background: 'rgba(0,0,0,0.7)',
              padding: '4px 8px',
              borderRadius: '4px',
              whiteSpace: 'nowrap'
            }}>
              Lat: {marker.lat.toFixed(2)}°, Lon: {marker.lon.toFixed(2)}°
            </div>
          </Html>
        </group>
      ))}
    </group>
  );
}
