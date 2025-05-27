import React from 'react';
import { RigidBody } from '@react-three/rapier';

function BasketColliders() {
  // 저울 바구니 위치 (실제 저울 좌표에 맞춤)
  const LEFT_BASKET_X = -0.38 * 1.9; // 실제 좌측 날개 위치
  const RIGHT_BASKET_X = 0.38 * 1.9; // 실제 우측 날개 위치
  const BASKET_Y = (0.5 + 0.2) * 1.9; // bodyProps.position.y + 날개 상대위치.y * scale
  const BASKET_RADIUS = 0.4; // 실제 저울 날개 크기에 맞춤
  const BASKET_HEIGHT = 0.3; // 바구니 깊이

  return (
    <group>
      {/* 좌측 바구니 충돌체 */}
      <RigidBody 
        type="fixed" 
        position={[LEFT_BASKET_X, BASKET_Y, 0]}
        colliders="trimesh"
      >
        {/* 바구니 바닥 */}
        <mesh visible={false}>
          <cylinderGeometry args={[BASKET_RADIUS, BASKET_RADIUS, 0.1]} />
        </mesh>
      </RigidBody>
      
      {/* 좌측 바구니 벽 (실린더 벽) */}
      <RigidBody 
        type="fixed" 
        position={[LEFT_BASKET_X, BASKET_Y + BASKET_HEIGHT/2, 0]}
        colliders="trimesh"
      >
        <mesh visible={false}>
          <cylinderGeometry args={[BASKET_RADIUS + 0.05, BASKET_RADIUS + 0.05, BASKET_HEIGHT, 16, 1, true]} />
        </mesh>
      </RigidBody>

      {/* 우측 바구니 충돌체 */}
      <RigidBody 
        type="fixed" 
        position={[RIGHT_BASKET_X, BASKET_Y, 0]}
        colliders="trimesh"
      >
        {/* 바구니 바닥 */}
        <mesh visible={false}>
          <cylinderGeometry args={[BASKET_RADIUS, BASKET_RADIUS, 0.1]} />
        </mesh>
      </RigidBody>
      
      {/* 우측 바구니 벽 (실린더 벽) */}
      <RigidBody 
        type="fixed" 
        position={[RIGHT_BASKET_X, BASKET_Y + BASKET_HEIGHT/2, 0]}
        colliders="trimesh"
      >
        <mesh visible={false}>
          <cylinderGeometry args={[BASKET_RADIUS + 0.05, BASKET_RADIUS + 0.05, BASKET_HEIGHT, 16, 1, true]} />
        </mesh>
      </RigidBody>

      {/* 바닥 충돌체 (이모티콘이 무한히 떨어지지 않도록) */}
      <RigidBody 
        type="fixed" 
        position={[0, -2, 0]}
        colliders="cuboid"
      >
        <mesh visible={false}>
          <boxGeometry args={[20, 0.1, 20]} />
        </mesh>
      </RigidBody>
    </group>
  );
}

export default BasketColliders; 