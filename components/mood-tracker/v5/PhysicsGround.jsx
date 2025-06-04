import React from 'react';
import { RigidBody } from '@react-three/rapier';

const PhysicsGround = () => {
  return (
    <>
      {/* 바닥 (보이지 않는 충돌체) */}
      <RigidBody type="fixed" position={[0, -2, 0]}>
        <mesh>
          <boxGeometry args={[20, 0.1, 20]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      </RigidBody>
      
      {/* 왼쪽 벽 */}
      <RigidBody type="fixed" position={[-8, 2, 0]}>
        <mesh>
          <boxGeometry args={[0.1, 10, 20]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      </RigidBody>
      
      {/* 오른쪽 벽 */}
      <RigidBody type="fixed" position={[8, 2, 0]}>
        <mesh>
          <boxGeometry args={[0.1, 10, 20]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      </RigidBody>
      
      {/* 뒷벽 */}
      <RigidBody type="fixed" position={[0, 2, -8]}>
        <mesh>
          <boxGeometry args={[20, 10, 0.1]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      </RigidBody>
      
      {/* 앞벽 */}
      <RigidBody type="fixed" position={[0, 2, 8]}>
        <mesh>
          <boxGeometry args={[20, 10, 0.1]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      </RigidBody>
    </>
  );
};

export default PhysicsGround; 