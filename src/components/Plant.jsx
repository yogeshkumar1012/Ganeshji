import React from 'react';

export function Plant({ scale = 0, ...props }) {
  // Map scale to an array to scale uniformly
  const scaleVector = [scale, scale, scale];

  return (
    <group scale={scaleVector} {...props}>

      {/* Main stem */}
      <mesh castShadow position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.04, 0.07, 0.8, 12]} />
        <meshStandardMaterial color="#4caf50" roughness={0.6} />
      </mesh>

      {/* Left leaf */}
      <group position={[-0.05, 0.35, 0]} rotation={[0, 0, 0.6]}>
        <mesh castShadow position={[-0.15, 0, 0]} scale={[1.8, 1, 0.2]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="#66bb6a" roughness={0.5} />
        </mesh>
      </group>

      {/* Right leaf */}
      <group position={[0.05, 0.5, 0]} rotation={[0, 0, -0.6]}>
        <mesh castShadow position={[0.15, 0, 0]} scale={[1.8, 1, 0.2]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="#66bb6a" roughness={0.5} />
        </mesh>
      </group>

      {/* Top blooming bud */}
      <mesh castShadow position={[0, 0.8, 0]} scale={[1.2, 1.5, 1.2]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#81c784" roughness={0.5} />
      </mesh>

      {/* Small glowing flower/light effect on top */}
      <mesh position={[0, 0.85, 0]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshBasicMaterial color="#a5d6a7" />
      </mesh>
    </group>
  );
}
