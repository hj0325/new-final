import React, { useMemo, useRef, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';
import { useDrag } from '@use-gesture/react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

// Preload models - this helps in reducing initial load time when component mounts
// It's good practice to list all potential models if known beforehand.
const EMOTION_MODEL_PATHS = [
  '/models/emotion1.gltf',
  '/models/emotion2.gltf',
  '/models/emotion3.gltf',
  '/models/emotion4.gltf',
  '/models/emotion5.gltf',
];
EMOTION_MODEL_PATHS.forEach(path => useGLTF.preload(path));

function Emoji3D({ modelPath, initialPosition = [0, 0, 0], scale = 0.5, onClick, onDrop, emojiId, draggable = true }) {
  const { scene } = useGLTF(modelPath);
  const clonedScene = useMemo(() => scene.clone(true), [scene]);
  const rigidBodyRef = useRef();
  const [isDragging, setIsDragging] = useState(false);
  const { size, viewport, camera } = useThree();
  const aspect = size.width / size.height;

  const bind = useDrag(({ active, movement: [mx, my], event, first, last, memo }) => {
    if (!draggable) return;
    setIsDragging(active);
    if (active && rigidBodyRef.current) {
      let previousPosition;
      if (first) { // On drag start
        // memo will store the initial world position of the object
        const currentRigidBodyPos = rigidBodyRef.current.translation();
        previousPosition = new THREE.Vector3(currentRigidBodyPos.x, currentRigidBodyPos.y, currentRigidBodyPos.z);
      } else {
        previousPosition = memo;
      }

      // Project mouse position to a plane at the object's Z depth
      const mousePlanePos = new THREE.Vector3();
      mousePlanePos.set(
        (event.clientX / size.width) * 2 - 1,
        -(event.clientY / size.height) * 2 + 1,
        0.5 // NDC Z coordinate
      );
      mousePlanePos.unproject(camera);
      const dir = mousePlanePos.sub(camera.position).normalize();
      const distance = (previousPosition.z - camera.position.z) / dir.z;
      const newWorldPos = camera.position.clone().add(dir.multiplyScalar(distance));
      
      // Calculate the delta from the initial drag point in world space
      // This requires knowing the initial point where drag started in world space
      // and the current mouse point in world space.
      
      // For simplicity, let's try a simpler delta based on screen movement for now,
      // and refine if this isn't smooth enough.
      // The viewport.width / size.width gives a factor to convert screen pixels to world units at z=0.
      // We need to adjust this for the object's actual depth.
      const factor = (viewport.width / size.width) * (previousPosition.z / camera.near); // Approximate adjustment for depth
      // A more robust solution might involve projecting the initial and current mouse points
      // to the object's Z plane and calculating the world-space delta there.

      // If this is the first drag event, memoize the initial position
      if (first) {
         memo = rigidBodyRef.current.translation();
      }

      // Calculate new position based on initial position (memo) and screen delta (mx, my)
      // This translation needs to be relative to the camera's orientation if it's not fixed
      // For a fixed camera, we can map screen dx/dy to world dx/dy
      const worldDx = mx * (viewport.width / size.width);
      const worldDy = -my * (viewport.height / size.height); // Y is inverted
      
      // We need to find the initial world position (memo) and add worldDx, worldDy
      // This is still not perfect as it doesn't account for camera perspective fully.
      // A common approach: map screen coords to a plane intersecting the object.
      
      // Let's use the setNextKinematicTranslation with a calculated new position
      // The current `pos` from unprojection is where the mouse *is* on the plane,
      // not the delta. We need to apply the *movement* (mx, my).

      // On the first frame of drag, record the initial position in `memo`
      if (first) {
        const currentPosVec = rigidBodyRef.current.translation();
        memo = { x: currentPosVec.x, y: currentPosVec.y, z: currentPosVec.z, screenX: event.clientX, screenY: event.clientY };
      }

      // Calculate the change in screen coordinates
      const screenDeltaX = event.clientX - memo.screenX;
      const screenDeltaY = event.clientY - memo.screenY;

      // Convert screen delta to world delta at the object's depth
      // This requires knowing the size of a pixel in world units at that depth
      // This is a simplification and might need adjustment based on camera FOV / type
      const worldUnitsPerPixelX = viewport.width / size.width;
      const worldUnitsPerPixelY = viewport.height / size.height;

      const newX = memo.x + screenDeltaX * worldUnitsPerPixelX;
      const newY = memo.y - screenDeltaY * worldUnitsPerPixelY; // Screen Y is often inverted in 3D

      rigidBodyRef.current.setNextKinematicTranslation({ x: newX, y: newY, z: memo.z });

    } else if (last && onDrop && isDragging) { // Drag ended (use `last` from useDrag)
        if (rigidBodyRef.current) {
            const finalPosition = rigidBodyRef.current.translation();
            onDrop(emojiId, finalPosition); 
        }
        setIsDragging(false); // Reset dragging state
    }
    return memo;
  }, {
    enabled: draggable,
  });

  const handleClick = (event) => {
    event.stopPropagation();
    if (onClick && !isDragging && draggable) {
      onClick();
    }
  };

  return (
    <RigidBody
      {...(draggable ? bind() : {})}
      ref={rigidBodyRef}
      type={draggable ? "kinematicPosition" : "fixed"}
      position={initialPosition}
      colliders="cuboid"
      scale={Array.isArray(scale) ? scale : [scale, scale, scale]}
      onClick={handleClick} 
      name={`emoji-${emojiId}`} 
    >
      <primitive 
        object={clonedScene} 
        scale={[1,1,1]} // Scale is handled by RigidBody
      />
    </RigidBody>
  );
}

export default Emoji3D; 