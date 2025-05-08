import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment } from '@react-three/drei';

// Model 컴포넌트: GLTF 파일을 로드하고 scene을 반환합니다.
function Model({ url, ...props }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} {...props} />;
}

export default function HomePage() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: 'lightgray' }}>
      <Canvas camera={{ position: [0, 2, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />
        <Suspense fallback={null}>
          {/* public 폴더에 있는 모델 파일을 지정합니다. */}
          <Model url="/Body.gltf" scale={1} position={[0, 0, 0]} />
          <Model url="/Wings.gltf" scale={1} position={[0, 0, 0]} /> {/* 필요에 따라 위치 조정 */}
          <Environment preset="sunset" /> {/* 배경 및 환경광 추가 */}
        </Suspense>
        <OrbitControls />
      </Canvas>
    </div>
  );
}

// GLTF 파일 로드를 위해 useGLTF.preload를 사용할 수 있습니다.
// 예를 들어, Body.gltf와 Wings.gltf를 미리 로드하려면:
useGLTF.preload('/Body.gltf');
useGLTF.preload('/Wings.gltf'); 