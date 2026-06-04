import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Center } from '@react-three/drei';
import { GaneshaModel } from './GaneshaModel';
import { RainParticles } from './RainParticles';
import { Plant } from './Plant';

function SceneContent({ animValues, ganeshaRef, plantRef, potRef }) {
  useFrame(() => {
    const vals = animValues.current;
    if (!vals) return;

    // 1. Update Ganesha position, rotation and scale
    if (ganeshaRef.current) {
      ganeshaRef.current.position.y = vals.ganeshaY;
      ganeshaRef.current.rotation.y = vals.ganeshaRotY;

      const s = vals.ganeshaScale;
      ganeshaRef.current.scale.set(s, s, s);

      // Update Ganesha opacity and visibility
      if (vals.ganeshaOpacity <= 0.01) {
        ganeshaRef.current.visible = false;
      } else {
        ganeshaRef.current.visible = true;
        ganeshaRef.current.traverse((child) => {
          if (child.isMesh && child.material) {
            child.material.transparent = true;
            child.material.opacity = vals.ganeshaOpacity;
            child.material.depthWrite = vals.ganeshaOpacity > 0.15;
          }
        });
      }
    }

    // 2. Update Plant scale
    if (plantRef.current) {
      const ps = vals.plantScale;
      plantRef.current.scale.set(ps, ps, ps);
    }
  });

  return (
    <>
      {/* Spiritual warm golden glow in center */}
      <ambientLight intensity={0.4} color="#ffd700" />

      {/* Main spotlight on Ganesha */}
      <spotLight
        position={[0, 6, 3]}
        angle={0.45}
        penumbra={1}
        intensity={10}
        color="#ff7b00"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      {/* Fill directional light */}
      <directionalLight
        position={[-3, 2, -2]}
        intensity={1.5}
        color="#8ec5fc"
      />

      {/* Subtle floor light to illuminate the pot */}
      <pointLight position={[0, -2.5, 2]} intensity={2} color="#ff9800" />

      {/* Dynamic rain particles mapped to scroll intensity */}
      <RainParticles count={1800} animValues={animValues} />

      {/* 3D Scene Group */}
      <group position={[0, 0.4, 0]}>

        {/* Terracotta Clay Pot */}
        <group ref={potRef} position={[0, -1.9, 0]}>
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[0.9, 0.7, 1.2, 32, 1, false]} />
            <meshStandardMaterial
              color="#ffffff" // Terracotta clay red-brown
              roughness={0.9}
              metalness={0.05}
            />
          </mesh>
          <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.95, 0.95, 0.12, 32]} />
            <meshStandardMaterial color="#8c3e21" roughness={0.8} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.55, 0]} receiveShadow>
            <circleGeometry args={[0.85, 32]} />
            <meshStandardMaterial
              color="#3d2314" // Rich soil
              roughness={1.0}
            />
          </mesh>
        </group>

        {/* Seedling Plant - starts at scale 0 */}
        <Plant ref={plantRef} position={[0, -1.35, 0]} scale={0} />

        {/* Ganesha Model */}
        <group ref={ganeshaRef} position={[0, 1.2, 0]}>
          <Center>
            <GaneshaModel
              scale={[0.13, 0.13, 0.13]}
              opacity={1}
            />
          </Center>
        </group>

      </group>
    </>
  );
}

export function Scene({ animValues, ganeshaRef, plantRef, potRef }) {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 1, pointerEvents: 'none' }}>
      <Canvas
        shadows
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <SceneContent
          animValues={animValues}
          ganeshaRef={ganeshaRef}
          plantRef={plantRef}
          potRef={potRef}
        />
      </Canvas>
    </div>
  );
}
export default Scene;
