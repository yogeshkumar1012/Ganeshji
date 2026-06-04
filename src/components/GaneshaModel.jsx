import React, { useRef, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';

export function GaneshaModel({ opacity = 1, ...props }) {
  // Load the gltf model from the public folder
  const { scene } = useGLTF('/models/scene.gltf');

  // Traverse the scene meshes and set up transparency for the dissolution effect
  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          child.material.transparent = true;
          child.material.opacity = opacity;
          child.material.depthWrite = opacity > 0.15;
        }
      }
    });
  }, [scene, opacity]);

  return <primitive object={scene} {...props} />;
}

// Preload the model to avoid pop-in lagging
useGLTF.preload('/models/scene.gltf');
