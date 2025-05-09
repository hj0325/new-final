import { Suspense, useState, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, Html } from '@react-three/drei';
import { a, useSpring } from '@react-spring/three';
import * as THREE from 'three';
import Scale from '../components/Scale';

// --- Configuration ---
// IMPORTANT: Adjust this Y-offset based on your Body.gltf's height and desired pivot point
const BODY_PIVOT_Y_OFFSET = 1.5;
const TILT_ANGLE = Math.PI / 12; // Approx 15 degrees tilt

// --- GLTF Model Loaders ---
function BodyModel(props) {
  const { scene } = useGLTF('/Body.gltf');
  return <primitive object={scene} {...props} />;
}

function WingsModel({ onPlateClick, ...props }) {
  const { scene } = useGLTF('/Wings.gltf');
  // The entire Wings.gltf model will be clickable.
  // We determine which side was clicked based on the click position relative to the model's center.
  return (
    <primitive
      object={scene}
      onPointerDown={(event) => {
        event.stopPropagation();
        // Assuming event.object is a mesh within Wings.gltf
        // Convert the world click point to the local coordinate system of the clicked mesh
        const localPoint = event.object.worldToLocal(event.point.clone());
        
        // Determine if the click was on the "left" or "right" side
        // based on the local x-coordinate, assuming the wings spread along the x-axis
        // and the model's origin is at its center.
        const isLeftSideClicked = localPoint.x < 0;
        onPlateClick(isLeftSideClicked ? 'left' : 'right');
      }}
      {...props}
    />
  );
}

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

const IconBarPlaceholder = ({ onSelectIcon }) => {
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
          fontSize: '130px', // 스타일 유지
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          cursor: 'pointer',
        }} onClick={() => onSelectIcon(emoji)}>
          {emoji}
        </div>
      ))}
    </div>
  );
};

// 저울에 이모티콘을 올리기 위한 상태 관리
function ScaledScene({ 
  selectedIcon,
  bodyProps,
  wingsProps,
  wingsPrimitiveOffset,
  tiltAngle,
  verticalMovementFactor
}) {
  const [iconsOnScale, setIconsOnScale] = useState([]);
  const { viewport, size } = useThree();
  const aspect = size.width / size.height;
  let scaleFactor;

  if (aspect > 1) {
    scaleFactor = viewport.height / 5.0;
  } else {
    scaleFactor = viewport.height / 6.0;
  }

  const handleIconDrop = (event) => {
    if (selectedIcon) {
      const newIconData = {
        emoji: selectedIcon,
        position: [-0.5 - iconsOnScale.length * 0.3, 0.2, 0] 
      };
      setIconsOnScale(prevState => [...prevState, newIconData]);
    }
  };

  return (
    <group scale={[scaleFactor, scaleFactor, scaleFactor]} rotation={[-Math.PI / 12, 0, 0]} onPointerDown={handleIconDrop}>
      <Scale 
        bodyProps={bodyProps}
        wingsProps={wingsProps}
        wingsPrimitiveOffset={wingsPrimitiveOffset}
        tiltAngle={tiltAngle}
        verticalMovementFactor={verticalMovementFactor}
      />
      {iconsOnScale.map((iconData, index) => (
        <Html key={index} position={iconData.position} transform>
          <div style={{ fontSize: '30px', userSelect: 'none' }}> 
            {iconData.emoji}
          </div>
        </Html>
      ))}
    </group>
  );
}

export default function MoodTrackerPage() {
  const [selectedIcon, setSelectedIcon] = useState(null);

  // Props for the Scale component, derived from mood-tracker.jsx
  const bodyProps = { position: [0, 0.5, 0], scale: 1.9 };
  const wingsProps = { position: [0, -0.02, 0], scale: 1.1 }; 
  const wingsPrimitiveOffset = [0, 0, 0];
  const tiltAngle = Math.PI / 20;
  const verticalMovementFactor = 0.03;

  return (
    <FullScreenContainer>
      <div style={{ width: '90%', height: '90%', maxWidth: '1200px', maxHeight: '900px', position: 'relative' }}> {/* 스타일 유지 */}
        <Canvas camera={{ position: [0, 3.5, 7], fov: 50 }}> {/* 설정 유지 */}
          <Suspense fallback={null}>
            <ambientLight intensity={0.25} color="#FFFFFF" /> {/* 설정 유지 */}
            <directionalLight position={[8, 10, 5]} intensity={0.2} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024}/> {/* 설정 유지 */}
            <directionalLight position={[-8, 5, -8]} intensity={0.1} color="#E3F2FD" /> {/* 설정 유지 */}
            <Environment preset="sunset" intensity={0.8} blur={0.5} /> {/* 설정 유지 */}
            <ScaledScene 
              selectedIcon={selectedIcon} 
              bodyProps={bodyProps}
              wingsProps={wingsProps}
              wingsPrimitiveOffset={wingsPrimitiveOffset}
              tiltAngle={tiltAngle}
              verticalMovementFactor={verticalMovementFactor}
            />
            <OrbitControls /> {/* 설정 유지 */}
          </Suspense>
        </Canvas>
      </div>
      <IconBarPlaceholder onSelectIcon={setSelectedIcon} />
    </FullScreenContainer>
  );
}

// Preload GLTF files for better performance
useGLTF.preload('/Body.gltf');
useGLTF.preload('/Wings.gltf'); 