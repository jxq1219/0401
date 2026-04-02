import { useState, useCallback, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  PerspectiveCamera,
  OrbitControls,
  Stars
} from '@react-three/drei';
import * as THREE from 'three';
import { Moon } from './Moon';
import { OrbitRing } from './OrbitRing';
import { Satellite } from './Satellite';
import type { MarkerData } from '../types';

// 调试信息组件
function DebugInfo() {
  const { camera, scene } = useThree();

  useEffect(() => {
    console.log('=== 调试信息 ===');
    console.log('场景中的对象:', scene.children.map(c => c.type));
    console.log('相机位置:', camera.position);
  }, []);

  useFrame(() => {
    // 每60帧打印一次相机位置
    if (Math.random() < 0.01) {
      console.log('相机位置:', camera.position.toArray());
    }
  });

  return null;
}

export function Scene() {
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [showOrbit, setShowOrbit] = useState(true);
  const controlsRef = useRef<any>(null);

  const handleMark = useCallback((marker: MarkerData) => {
    setMarkers(prev => [...prev, marker]);
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
        fontSize: '12px'
      }}>
        <label>
          <input
            type="checkbox"
            checked={showOrbit}
            onChange={(e) => setShowOrbit(e.target.checked)}
          />
          显示轨道
        </label>
        <div style={{ marginTop: '5px' }}>
          标记点数量: {markers.length}
        </div>
        <div style={{ marginTop: '5px', fontSize: '10px', color: '#aaa' }}>
          左键拖拽旋转 | 滚轮缩放 | 点击月球标记
        </div>
        <div style={{ marginTop: '5px', fontSize: '10px', color: '#0f0' }}>
          ✅ 月球已加载 | 半径: 5单位
        </div>
      </div>

      <Canvas
        shadows
        style={{ width: '100vw', height: '100vh', background: '#222222' }}
        gl={{
          antialias: true,
          shadowMap: { enabled: true }
        }}
      >
        {/* 雾效果 - 营造层次感 */}
        <fog attach="fog" args={['#222222', 10, 100]} />

        {/* 调试信息 */}
        <DebugInfo />

        {/* 相机配置 - 确保对准月球 */}
        <PerspectiveCamera
          makeDefault
          position={[0, 0, 20]}
          fov={60}
          near={0.1}
          far={1000}
        />

        {/* 轨道控制器 - 必须启用update */}
        <OrbitControls
          ref={controlsRef}
          enableDamping
          dampingFactor={0.05}
          enablePan={false}
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 1.5}
          minDistance={10}
          maxDistance={100}
          target={[0, 0, 0]}
        />

        {/* 坐标轴辅助线 - 红(X)绿(Y)蓝(Z) */}
        <primitive object={new THREE.AxesHelper(10)} />

        {/* 地面参考网格 - 防止漂浮感 */}
        <primitive object={new THREE.GridHelper(50, 50, 0x444444, 0x222222)} position={[0, -10, 0]} />

        {/* 星空背景 */}
        <Stars
          radius={100}
          depth={50}
          count={1000}
          factor={4}
          saturation={0}
          fade
          speed={1}
        />

        {/* 环境光 - 强度0.6确保基础可见度 */}
        <ambientLight intensity={0.6} color="#ffffff" />

        {/* 主光源（太阳光）- 强度1.0 */}
        <directionalLight
          position={[5, 10, 7]}
          intensity={1.0}
          color="#ffffff"
          castShadow
          shadow-mapSize={[2048, 2048]}
        />

        {/* 辅助光 - 补光 */}
        <pointLight
          position={[-10, 0, -10]}
          intensity={0.5}
          color="#ffeedd"
          distance={100}
        />

        {/* 月球组件 - 半径5，确保可见 */}
        <Moon
          rotationSpeed={0.005}
          roughness={0.8}
          metalness={0.1}
          clearcoat={0.1}
          onMark={handleMark}
          markers={markers}
        />

        {/* 轨道环 */}
        <OrbitRing visible={showOrbit} />

        {/* 卫星 */}
        <Satellite orbitDistance={15} orbitSpeed={0.3} />
      </Canvas>
    </>
  );
}
