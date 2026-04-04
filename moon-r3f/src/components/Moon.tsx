import { useRef, useMemo } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import type { MoonProps, MarkerData } from '../types';

function generateMoonGeometry(radius: number, segments: number): THREE.SphereGeometry {
  const geometry = new THREE.SphereGeometry(radius, segments, segments);
  const positions = geometry.attributes.position.array as Float32Array;
  const vertex = new THREE.Vector3();

  const craters = [
    { pos: new THREE.Vector3(0.3, 0.8, 0.5).normalize(), depth: 0.12, radius: 0.25 },
    { pos: new THREE.Vector3(-0.5, 0.6, 0.6).normalize(), depth: 0.10, radius: 0.20 },
    { pos: new THREE.Vector3(0.7, 0.2, 0.7).normalize(), depth: 0.14, radius: 0.30 },
    { pos: new THREE.Vector3(-0.6, -0.3, 0.7).normalize(), depth: 0.08, radius: 0.15 },
    { pos: new THREE.Vector3(0.1, -0.7, 0.7).normalize(), depth: 0.10, radius: 0.22 },
    { pos: new THREE.Vector3(0.8, -0.2, 0.5).normalize(), depth: 0.09, radius: 0.18 },
    { pos: new THREE.Vector3(-0.3, 0.5, -0.8).normalize(), depth: 0.11, radius: 0.20 },
    { pos: new THREE.Vector3(0.5, 0.5, -0.7).normalize(), depth: 0.07, radius: 0.12 },
    { pos: new THREE.Vector3(-0.2, -0.6, -0.8).normalize(), depth: 0.13, radius: 0.25 },
    { pos: new THREE.Vector3(0.4, -0.4, -0.8).normalize(), depth: 0.08, radius: 0.16 },
  ];

  for (let i = 0; i < positions.length; i += 3) {
    vertex.set(positions[i], positions[i + 1], positions[i + 2]);
    const originalLength = vertex.length();
    const normalizedVertex = vertex.clone().normalize();

    let displacement = 0;

    for (const crater of craters) {
      const distance = normalizedVertex.distanceTo(crater.pos);
      if (distance < crater.radius) {
        const factor = 1 - (distance / crater.radius);
        const smoothFactor = factor * factor * (3 - 2 * factor);
        displacement -= crater.depth * smoothFactor;
      }
    }

    const noise = (Math.sin(i * 0.1) * 0.5 + Math.cos(i * 0.07) * 0.5) * 0.02;
    displacement += noise;

    const newLength = originalLength + displacement;
    normalizedVertex.multiplyScalar(newLength);

    positions[i] = normalizedVertex.x;
    positions[i + 1] = normalizedVertex.y;
    positions[i + 2] = normalizedVertex.z;
  }

  geometry.computeVertexNormals();
  return geometry;
}

export function Moon({ rotationSpeed, roughness, metalness, clearcoat, onMark, markers }: MoonProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => generateMoonGeometry(5, 128), []);

  const glowMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        c: { value: 0.1 },
        p: { value: 4.5 },
        glowColor: { value: new THREE.Color(0xaaaaaa) },
        viewVector: { value: new THREE.Vector3(0, 0, 1) }
      },
      vertexShader: `
        uniform vec3 viewVector;
        varying float intensity;
        void main() {
          vec3 vNormal = normalize(normalMatrix * normal);
          vec3 vNormel = normalize(normalMatrix * viewVector);
          intensity = pow(0.7 - dot(vNormal, vNormel), 2.0);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        varying float intensity;
        void main() {
          vec3 glow = glowColor * intensity;
          gl_FragColor = vec4(glow, intensity * 0.6);
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true
    });
  }, []);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += rotationSpeed * delta;
      meshRef.current.updateMatrixWorld();
    }
    if (glowRef.current) {
      glowMaterial.uniforms.viewVector.value = new THREE.Vector3().subVectors(
        state.camera.position,
        glowRef.current.position
      );
    }
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    const point = e.point;
    const marker: MarkerData = {
      id: Date.now(),
      position: [point.x, point.y, point.z],
      label: `标记 ${markers.length + 1}`
    };
    onMark(marker);
  };

  return (
    <group>
      <mesh
        ref={meshRef}
        geometry={geometry}
        onClick={handleClick}
      >
        <meshPhysicalMaterial
          color="#b8b8b8"
          roughness={roughness}
          metalness={metalness}
          clearcoat={clearcoat}
          clearcoatRoughness={0.4}
          vertexColors={false}
        />
      </mesh>

      <mesh ref={glowRef} scale={1.15} geometry={geometry} material={glowMaterial} />

      {markers.map((marker) => (
        <group key={marker.id} position={marker.position}>
          <mesh position={[0, 0.3, 0]}>
            <coneGeometry args={[0.05, 0.3, 8]} />
            <meshBasicMaterial color="#ff4444" />
          </mesh>
          <mesh position={[0, 0.15, 0]}>
            <cylinderGeometry args={[0.01, 0.01, 0.3, 8]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <Html position={[0, 0.5, 0]} center distanceFactor={15}>
            <div style={{
              background: 'rgba(0,0,0,0.8)',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '10px',
              whiteSpace: 'nowrap',
              pointerEvents: 'none'
            }}>
              {marker.label}
            </div>
          </Html>
        </group>
      ))}
    </group>
  );
}
