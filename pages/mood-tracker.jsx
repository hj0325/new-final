import React, { useState, Suspense } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import Scale from '../src/components/Scale'; // Scale 컴포넌트 경로 확인 필요

// 간단한 스타일 컴포넌트
const FullScreenContainer = ({ children }) => (
  <div style={{
    width: '100vw',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    background: '#ffffff',
    overflow: 'hidden',
    position: 'relative'
  }}>
    {children}
  </div>
);

const IconBarPlaceholder = () => {
  const emojis = ['😀', '😮', '😐', '😖', '😠']; 
  return (
    <div style={{
      position: 'absolute',
      bottom: '7vh',
      display: 'flex',
      gap: '30px', 
    }}>
      {emojis.map((emoji, index) => (
        <div key={index} style={{
          fontSize: '130px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          {emoji}
        </div>
      ))}
    </div>
  );
}

// Canvas 내부에서 크기 조정을 담당할 새 컴포넌트
function ScaledScene(props) {
  const { viewport, size } = useThree();
  const aspect = size.width / size.height;
  let scaleFactor;

  // 화면 비율별 스케일 차등 적용 (크기 약간 더 키움)
  if (aspect > 1) { // 가로가 더 긴 화면
    scaleFactor = viewport.height / 5.0; // 기존 /5.5 에서 /5.0으로 변경
  } else { // 세로가 더 길거나 정사각형 화면
    scaleFactor = viewport.height / 6.0; // 기존 /6.5 에서 /6.0으로 변경
  }

  return (
    <group 
      scale={[scaleFactor, scaleFactor, scaleFactor]}
      rotation={[-Math.PI / 12, 0, 0]}
    >
      <Scale
        isHovered={props.isHovered}
        onHover={props.onHover}
        bodyProps={props.bodyProps}
        wingsProps={props.wingsProps}
        wingsPrimitiveOffset={props.wingsPrimitiveOffset}
        tiltAngle={props.tiltAngle}
        verticalMovementFactor={props.verticalMovementFactor}
      />
    </group>
  );
}

export default function MoodTrackerPage() {
  const [isHovered, setIsHovered] = useState(false);

  //스케일 조정하면 크기 조정 가능 (User comments and values)
  const bodyProps = { position: [0, 0.5, 0], scale: 1.9, rotation: [0, 0, 0] }; // User changed scale to 2.0
  // 날개 Y 위치를 좀 더 낮게 수정 (User values)
  const wingsProps = { position: [0, -0.02, 0], scale: 1.1, rotation: [0, 0, 0] }; 
  const wingsPrimitiveOffset = [0, 0, 0];

  return (
    <FullScreenContainer>
      <div style={{ width: '90%', height: '90%', maxWidth: '1200px', maxHeight: '900px', position: 'relative' }}>
        {/* 카메라 위치(y, z) 수정하여 더 높은 탑다운 뷰로 변경 */}
        <Canvas camera={{ position: [0, 3.5, 7], fov: 50 }}> 
          <Suspense fallback={null}>
            <ambientLight intensity={0.25} color="#FFFFFF" />
            <directionalLight 
              position={[8, 10, 5]} 
              intensity={0.2} 
              castShadow
              shadow-mapSize-width={1024}
              shadow-mapSize-height={1024}
            />
            <directionalLight 
              position={[-8, 5, -8]} 
              intensity={0.1}
              color="#E3F2FD"
            />
            <Environment preset="sunset" intensity={0.8} blur={0.5} />
            
            <ScaledScene
              isHovered={isHovered}
              onHover={setIsHovered}
              bodyProps={bodyProps}
              wingsProps={wingsProps}
              wingsPrimitiveOffset={wingsPrimitiveOffset}
              tiltAngle={Math.PI / 20}
              verticalMovementFactor={0.03}
            />
            {/* <OrbitControls /> */}
          </Suspense>
        </Canvas>
      </div>
      
      <IconBarPlaceholder />
    </FullScreenContainer>
  );
}