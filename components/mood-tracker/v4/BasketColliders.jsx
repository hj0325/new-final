import React from 'react';
import { RigidBody } from '@react-three/rapier';
import { useControls } from 'leva';

function BasketColliders() {
  // 바구니 충돌체 설정을 실시간으로 조정
  const {
    leftBasketX,
    rightBasketX,
    basketY,
    basketRadius,
    basketHeight,
    basketWallThickness,
    showColliders
  } = useControls('Basket Colliders', {
    leftBasketX: { value: -0.38 * 1.9, min: -3, max: 0, step: 0.01 },
    rightBasketX: { value: 0.38 * 1.9, min: 0, max: 3, step: 0.01 },
    basketY: { value: (0.5 + 0.2) * 1.9, min: 0, max: 5, step: 0.01 },
    basketRadius: { value: 0.4, min: 0.1, max: 1, step: 0.01 },
    basketHeight: { value: 0.3, min: 0.1, max: 1, step: 0.01 },
    basketWallThickness: { value: 0.05, min: 0.01, max: 0.2, step: 0.01 },
    showColliders: { value: false }
  });

  return (
    <group>
      {/* 좌측 바구니 충돌체 */}
      <RigidBody 
        type="fixed" 
        position={[leftBasketX, basketY, 0]}
        colliders="trimesh"
      >
        {/* 바구니 바닥 */}
        <mesh visible={showColliders}>
          <cylinderGeometry args={[basketRadius, basketRadius, 0.1]} />
          {showColliders && <meshBasicMaterial color="red" transparent opacity={0.5} />}
        </mesh>
      </RigidBody>
      
      {/* 좌측 바구니 벽 (실린더 벽) */}
      <RigidBody 
        type="fixed" 
        position={[leftBasketX, basketY + basketHeight/2, 0]}
        colliders="trimesh"
      >
        <mesh visible={showColliders}>
          <cylinderGeometry args={[basketRadius + basketWallThickness, basketRadius + basketWallThickness, basketHeight, 16, 1, true]} />
          {showColliders && <meshBasicMaterial color="red" transparent opacity={0.3} />}
        </mesh>
      </RigidBody>

      {/* 우측 바구니 충돌체 */}
      <RigidBody 
        type="fixed" 
        position={[rightBasketX, basketY, 0]}
        colliders="trimesh"
      >
        {/* 바구니 바닥 */}
        <mesh visible={showColliders}>
          <cylinderGeometry args={[basketRadius, basketRadius, 0.1]} />
          {showColliders && <meshBasicMaterial color="blue" transparent opacity={0.5} />}
        </mesh>
      </RigidBody>
      
      {/* 우측 바구니 벽 (실린더 벽) */}
      <RigidBody 
        type="fixed" 
        position={[rightBasketX, basketY + basketHeight/2, 0]}
        colliders="trimesh"
      >
        <mesh visible={showColliders}>
          <cylinderGeometry args={[basketRadius + basketWallThickness, basketRadius + basketWallThickness, basketHeight, 16, 1, true]} />
          {showColliders && <meshBasicMaterial color="blue" transparent opacity={0.3} />}
        </mesh>
      </RigidBody>

      {/* 바닥 충돌체 (이모티콘이 무한히 떨어지지 않도록) */}
      <RigidBody 
        type="fixed" 
        position={[0, -2, 0]}
        colliders="cuboid"
      >
        <mesh visible={showColliders}>
          <boxGeometry args={[20, 0.1, 20]} />
          {showColliders && <meshBasicMaterial color="gray" transparent opacity={0.3} />}
        </mesh>
      </RigidBody>
    </group>
  );
}

export default BasketColliders; 