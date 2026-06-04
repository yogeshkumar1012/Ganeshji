import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function RainParticles({ count = 1500, animValues }) {
  const pointsRef = useRef();

  // Create initial random rain particles spread around coordinate space
  const [positions, speeds] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 12; // X range
      pos[i * 3 + 1] = Math.random() * 10 + 2;   // Y range (starts high up)
      pos[i * 3 + 2] = (Math.random() - 0.5) * 12; // Z range
      spd[i] = Math.random() * 0.12 + 0.08;      // Individual droplet speeds
    }
    return [pos, spd];
  }, [count]);

  useFrame(() => {
    if (!pointsRef.current || !animValues.current) return;
    
    const intensity = animValues.current.rainIntensity;
    
    // Hide rain system if intensity is negligible
    if (intensity <= 0.01) {
      pointsRef.current.visible = false;
      return;
    }
    
    pointsRef.current.visible = true;
    
    // Animate material opacity based on scroll intensity
    pointsRef.current.material.opacity = 0.75 * intensity;

    const geo = pointsRef.current.geometry;
    const posAttr = geo.attributes.position;
    
    for (let i = 0; i < count; i++) {
      let y = posAttr.getY(i);
      
      // Fall speed is accelerated by the rain intensity
      y -= speeds[i] * (0.5 + intensity * 1.5);
      
      // Reset particle back to the cloud level when it reaches the bottom
      if (y < -3.0) {
        y = Math.random() * 5 + 5;
        posAttr.setX(i, (Math.random() - 0.5) * 10);
        posAttr.setZ(i, (Math.random() - 0.5) * 10);
      }
      posAttr.setY(i, y);
    }
    posAttr.needsUpdate = true;
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
        color="#bae6fd" // Soft water blue
        size={0.04}
        transparent
        opacity={0}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
export default RainParticles;
