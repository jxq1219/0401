import { useState, useRef, useCallback, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Stars } from '@react-three/drei';
import { useControls } from 'leva';
import * as THREE from 'three';
import { Moon } from './Moon';
import { OrbitRing } from './OrbitRing';
import { Satellite } from './Satellite';
import type { MarkerData } from '../types';

function DebugInfo() {
  const { camera, scene } = useThree();

  useEffect(() => {
    console.log('=== 场景初始化 ===');
    console.log('场景对象数量:', scene.children.length);
    console.log('相机初始位置:', camera.position);
  }, []);

  useFrame(() => {
    if (camera) {
      camera.updateMatrixWorld();
    }
  });

  return null;
}

export function Scene() {
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const controlsRef = useRef<any>(null);

  const { showOrbit, lightIntensity, rotationSpeedMultiplier, roughness, metalness, clearcoat, showAxes } = useControls('月球控制', {
    showOrbit: { label: '显示轨道', value: true },
    lightIntensity: { label: '光照强度', value: 1.0, min: 0.1, max: 2.0, step: 0.1 },
    rotationSpeedMultiplier: { label: '自转速度', value: 1.0, min: 0.5, max: 2.0, step: 0.1 },
    roughness: { label: '粗糙度', value: 0.8, min: 0, max: 1, step: 0.05 },
    metalness: { label: '金属度', value: 0.1, min: 0, max: 1, step: 0.05 },
    clearcoat: { label: 'Clearcoat', value: 0.1, min: 0, max: 1, step: 0.05 },
    showAxes: { label: '显示坐标轴', value: true },
  });

  const handleMark = useCallback((marker: MarkerData) => {
    setMarkers(prev => [...prev, marker]);
  }, []);

  const clearMarkers = useCallback(() => {
    setMarkers([]);
  }, []);

  return (
    <>
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        zIndex: 100,
        color: 'white',
        background: 'rgba(0,0,0,0.7)',
        padding: '10px',
        borderRadius: '5px',
        fontFamily: 'Arial, sans-serif',
        fontSize: '12px',
        maxWidth: '250px'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '14px' }}>
          🌙 3D 月球场景
        </div>
        <div style={{ marginBottom: '4px' }}>
          📍 标记数量: {markers.length}
        </div>
        <div style={{ marginBottom: '4px' }}>
          🖱️ 点击月球添加标记
        </div>
        <div style={{ marginBottom: '4px' }}>
          🔄 鼠标拖拽旋转视角
        </div>
        <div style={{ marginBottom: '8px' }}>
          🔍 滚轮缩放
        </div>
        <button
          onClick={clearMarkers}
          style={{
            background: '#ff4444',
            color: 'white',
            border: 'none',
            padding: '5px 10px',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '11px'
          }}
        >
          清除所有标记
        </button>
        <div style={{ marginTop: '10px', fontSize: '10px', color: '#aaa' }}>
          💡 右侧 Leva 面板可调整参数
        </div>
      </div>

      <Canvas
        shadows
        style={{ width: '100vw', height: '100vh', background: '#000011' }}
        gl={{
          antialias: true,
          shadowMap: { enabled: true }
        }}
      >
        <DebugInfo />

        <PerspectiveCamera
          makeDefault
          position={[0, 0, 15]}
          fov={60}
          near={0.1}
          far={1000}
        />

        <OrbitControls
          ref={controlsRef}
          enableDamping
          dampingFactor={0.05}
          enablePan={false}
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 1.5}
          minDistance={8}
          maxDistance={50}
          target={[0, 0, 0]}
        />

        {showAxes && (
          <primitive object={new THREE.AxesHelper(10)} />
        )}

        <Stars
          radius={100}
          depth={50}
          count={3000}
          factor={4}
          saturation={0}
          fade
          speed={0.5}
        />

        <ambientLight intensity={0.3 * lightIntensity} color="#ffffff" />

        <directionalLight
          position={[5, 10, 7]}
          intensity={1.0 * lightIntensity}
          color="#ffffff"
          castShadow
          shadow-mapSize={[2048, 2048]}
        />

        <spotLight
          position={[5, 10, 5]}
          intensity={0.5 * lightIntensity}
          angle={0.3}
          penumbra={0.5}
          color="#ffeedd"
          distance={50}
          castShadow
        />

        <pointLight
          position={[-10, 0, -10]}
          intensity={0.3 * lightIntensity}
          color="#ffeedd"
          distance={100}
        />

        <Moon
          rotationSpeed={0.1 * rotationSpeedMultiplier}
          roughness={roughness}
          metalness={metalness}
          clearcoat={clearcoat}
          onMark={handleMark}
          markers={markers}
        />

        <OrbitRing visible={showOrbit} radius={8} color="#4488ff" />

        <Satellite orbitDistance={8} orbitSpeed={0.3} size={0.3} />
      </Canvas>
    </>
  );
}
