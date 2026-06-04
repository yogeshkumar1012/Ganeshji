import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Center } from '@react-three/drei';
import * as THREE from 'three';
import { GaneshaModel } from './GaneshaModel';
import { RainParticles } from './RainParticles';
import { Plant } from './Plant';

// Dissolving particles that break away from Ganesha during the melting process
function DissolveParticles({ count = 250, animValues }) {
  const pointsRef = useRef();

  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Clustered initial positions around Ganesha's base inside the pot
      const theta = Math.random() * Math.PI * 2;
      const r = Math.random() * 0.6;
      pos[i * 3] = Math.cos(theta) * r;
      pos[i * 3 + 1] = -1.45 + (Math.random() - 0.5) * 0.7; // Y range inside pot
      pos[i * 3 + 2] = Math.sin(theta) * r;

      // Random outward drift velocity
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 0.02 + 0.005;
      vel[i * 3] = Math.cos(angle) * speed * 1.5;          // X speed
      vel[i * 3 + 1] = (Math.random() - 0.25) * speed * 2; // Y speed (drifting)
      vel[i * 3 + 2] = Math.sin(angle) * speed * 1.5;      // Z speed
    }
    return [pos, vel];
  }, [count]);

  useFrame(() => {
    if (!pointsRef.current || !animValues.current) return;

    // Connect particle animation progress to the color blend stage (dissolve phase)
    const progress = animValues.current.ganeshaColorBlend;

    if (progress <= 0.05 || progress >= 0.95) {
      pointsRef.current.visible = false;
      return;
    }

    pointsRef.current.visible = true;
    const geo = pointsRef.current.geometry;
    const posAttr = geo.attributes.position;

    for (let i = 0; i < count; i++) {
      const startX = positions[i * 3];
      const startY = positions[i * 3 + 1];
      const startZ = positions[i * 3 + 2];

      // Disperse coordinates further outwards as the melt progress advances
      posAttr.setX(i, startX + velocities[i * 3] * progress * 65);
      posAttr.setY(i, startY + velocities[i * 3 + 1] * progress * 65);
      posAttr.setZ(i, startZ + velocities[i * 3 + 2] * progress * 65);
    }
    posAttr.needsUpdate = true;

    // Fade opacity up in middle and decay to 0 at the end
    const opacity = Math.sin(progress * Math.PI) * 0.85;
    pointsRef.current.material.opacity = opacity;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#8d6e63" // Wet clay color
        size={0.06}
        transparent
        opacity={0}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// React useMemo helper wrapper since SceneContent is a standard functional component
import { useMemo } from 'react';

function SceneContent({ animValues, ganeshaRef, plantRef, potRef, clayRef }) {
  useFrame(() => {
    const vals = animValues.current;
    if (!vals) return;

    // 1. Update Ganesha position, rotation and scales (Y squishes, X/Z spreads slightly during melt)
    if (ganeshaRef.current) {
      ganeshaRef.current.position.y = vals.ganeshaY;

      // Spin upright around vertical axis on scroll + apply starting Y angle offset
      ganeshaRef.current.rotation.y = vals.ganeshaRotY + 0.3;

      // Constant X tilt to see Ganesha from a slight top-down angle, Z is 0 (no sideways lean)
      ganeshaRef.current.rotation.x = 0.15;
      ganeshaRef.current.rotation.z = 0;

      ganeshaRef.current.scale.set(vals.ganeshaScaleX, vals.ganeshaScaleY, vals.ganeshaScaleZ);

      // Update Ganesha opacity, visibility and clay color blend
      if (vals.ganeshaOpacity <= 0.01) {
        ganeshaRef.current.visible = false;
      } else {
        ganeshaRef.current.visible = true;
        ganeshaRef.current.traverse((child) => {
          if (child.isMesh && child.material) {
            child.material.transparent = true;
            child.material.opacity = vals.ganeshaOpacity;
            child.material.depthWrite = vals.ganeshaOpacity > 0.15;

            // Blend gold texture to a wet mud color
            if (vals.ganeshaColorBlend > 0) {
              if (!child.userData.originalColor) {
                child.userData.originalColor = child.material.color.clone();
              }
              const targetColor = new THREE.Color("#6d4c41"); // Mud clay brown
              child.material.color.copy(child.userData.originalColor).lerp(targetColor, vals.ganeshaColorBlend);

              // Fade out glowing/emissive spiritual intensity
              if (child.material.emissive) {
                if (child.userData.originalEmissiveIntensity === undefined) {
                  child.userData.originalEmissiveIntensity = child.material.emissiveIntensity || 0;
                }
                child.material.emissiveIntensity = child.userData.originalEmissiveIntensity * (1 - vals.ganeshaColorBlend);
              }
            } else {
              // Reset to original color when not dissolving
              if (child.userData.originalColor) {
                child.material.color.copy(child.userData.originalColor);
              }
              if (child.material.emissive && child.userData.originalEmissiveIntensity !== undefined) {
                child.material.emissiveIntensity = child.userData.originalEmissiveIntensity;
              }
            }
          }
        });
      }
    }

    // 2. Update Clay Cylinder inside the Pot (scales Y upward from the bottom: Y = -0.75 relative to pot)
    if (clayRef.current) {
      const cs = vals.clayScale;
      clayRef.current.scale.set(1, cs, 1);
      // Cylinder height is 1.2 (exactly 80% of pot's 1.5 height).
      // Center is shifted to keep the base flat at the bottom of the pot.
      clayRef.current.position.y = -0.75 + (cs * 1.2 / 2);
      clayRef.current.visible = cs > 0.01;
    }

    // 3. Update Plant scale
    if (plantRef.current) {
      const ps = vals.plantScale;
      plantRef.current.scale.set(ps, ps, ps);
    }
  });

  return (
    <>
      {/* Soft background ambient lighting */}
      <ambientLight intensity={0.45} color="#ffffff" />

      {/* Main spotlight on Ganesha */}
      <spotLight
        position={[0, 6, 3]}
        angle={0.45}
        penumbra={1}
        intensity={100}
        color="#ffffff"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      {/* Fill directional light */}
      <directionalLight
        position={[-3, 2, -2]}
        intensity={1.2}
        color="#8ec5fc"
      />

      {/* Subtle floor light to illuminate the pot */}
      <pointLight position={[0, -2.5, 2]} intensity={2.5} color="#ff9800" />

      {/* Dynamic rain particles mapped to scroll intensity (constrained to pot column) */}
      <RainParticles count={1800} animValues={animValues} />

      {/* Breaking clay particles emitted during dissolution */}
      <DissolveParticles count={300} animValues={animValues} />

      {/* 3D Scene Group */}
      <group position={[0, 0.4, 0]}>

        {/* Enlarged Transparent Glass Pot */}
        <group ref={potRef} position={[0, -1.9, 0]}>
          {/* Main pot body: transparent, with standard material to fix WebGL alpha-sorting bugs */}
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[1.3, 1.0, 1.5, 32, 1, false]} />
            <meshStandardMaterial
              color="#eef2f6"
              transparent={true}
              opacity={0.25}
              roughness={0.1}
              metalness={0.15}
            />
          </mesh>

          {/* Pot top rim */}
          <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[1.35, 1.35, 0.15, 32]} />
            <meshStandardMaterial
              color="#eef2f6"
              transparent={true}
              opacity={0.3}
              roughness={0.08}
              metalness={0.15}
            />
          </mesh>

          {/* Clay cylinder that rises up inside the empty pot on Visarjan.
              Top radius is set to 1.20 and bottom to 0.90 to keep it securely inside the glass walls.
              Height is 1.20 (80% of pot's 1.50 height). */}
          <mesh ref={clayRef} position={[0, -0.75, 0]} scale={[1, 0, 1]} castShadow receiveShadow>
            <cylinderGeometry args={[1.2, 0.9, 1.2, 32]} />
            <meshStandardMaterial
              color="#6d4c41" // Rich brown wet clay
              roughness={0.9}
              metalness={0.05}
            />
          </mesh>
        </group>

        {/* Seedling Plant - sprouts from the clay level of the pot when filled to 80% (Y = -1.45) */}
        <Plant ref={plantRef} position={[0, -1.45, 0]} scale={0} />

        {/* Ganesha Model Wrapper for centering, scaling, and positioning */}
        <group ref={ganeshaRef} position={[0, 1.2, 0]}>
          <Center>
            {/* Inner group stands Ganesha upright, parent ref controls position and scroll-Y spin */}
            <group rotation={[-Math.PI / 2, 0, 0]}>
              <GaneshaModel
                scale={[0.13, 0.13, 0.13]}
                opacity={1}
              />
            </group>
          </Center>
        </group>

      </group>
    </>
  );
}

export function Scene({ animValues, ganeshaRef, plantRef, potRef, clayRef }) {
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
          clayRef={clayRef}
        />
      </Canvas>
    </div>
  );
}
export default Scene;
