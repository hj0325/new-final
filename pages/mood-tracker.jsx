import React, { useState, Suspense, useRef } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Text, useGLTF, OrthographicCamera } from '@react-three/drei';
import Scale from '../components/Scale'; // Scale 컴포넌트 경로 확인 필요

// --- 데이터 정의: 이모티콘별 키워드 ---
const emojiKeywords = {
  '😀': ['행복', '기쁨', '웃음', '긍정', '즐거움'],
  '😮': ['놀람', '충격', '경악', '어머나', '세상에'],
  '😐': ['무표정', '보통', '그저그럼', '심드렁', '평온'],
  '😖': ['괴로움', '혼란', '좌절', '스트레스', '찡그림'],
  '😠': ['화남', '분노', '짜증', '불만', '격분'],
};

// --- 스타일 컴포넌트: 전체 화면 컨테이너 ---
const FullScreenContainer = ({ children }) => (
  <div style={{
    width: '100vw',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: '10px',
    alignItems: 'center',
    background: '#ffffff',
    overflow: 'hidden',
    position: 'relative'
  }}>
    {children}
  </div>
);

// --- UI 컴포넌트: 하단 이모티콘 선택 바 ---
const IconBarPlaceholder = ({ onEmojiSelect }) => {
  const emojis = ['😀', '😮', '😐', '😖', '😠']; 
  return (
    <div style={{
      position: 'absolute',
      bottom: '7vh',
      left: 0,
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      gap: '30px',
      zIndex: 20,
    }}>
      {emojis.map((emoji, index) => (
        <div key={index} style={{
          fontSize: '130px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          cursor: 'pointer',
        }} onClick={() => onEmojiSelect(emoji)}>
          {emoji}
        </div>
      ))}
    </div>
  );
}

// --- UI 컴포넌트: 게임 모달 (이모티콘 클릭 시 표시) ---
const GameModal = ({ isOpen, emoji, onClose }) => {
  if (!isOpen || !emoji) return null;

  const keywords = emojiKeywords[emoji] || ['키워드 정보 없음'];

  return (
    <div style={{
      position: 'fixed',
      top: '48%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '60vw',
      height: '60vh',
      maxWidth: '600px',
      maxHeight: '400px',
      backgroundColor: 'rgba(255, 255, 255, 0.90)',
      border: '2px solid #eee',
      borderRadius: '10px',
      boxShadow: '0 8px 13px rgba(0, 0, 0, 0.71)',
      padding: '30px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start', 
      gap: '10px',
      zIndex: 1000,
    }}>
      <span style={{ fontSize: '110px' }}>{emoji}</span>
      <h2 style={{ textAlign: 'center', marginTop: '2px', marginBottom: '20px' }}>관련 키워드</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', justifyContent: 'center' }}>
        {keywords.map((keyword, index) => (
          <span key={index} style={{
            padding: '8px 15px',
            background: '#ffc0cb',
            borderRadius: '30px',
            fontSize: '25px'
          }}>
            {keyword}
          </span>
        ))}
      </div>
      <button onClick={onClose} style={{
        marginTop: 'auto',
        padding: '10px 20px',
        fontSize: '16px',
        cursor: 'pointer',
        background: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '5px'
      }}>
        닫기
      </button>
    </div>
  );
};

// --- 3D 씬 컴포넌트: 저울 모델 및 크기 조정 로직 ---
function ScaledScene(props) {
  const { viewport, size } = useThree();
  const aspect = size.width / size.height;
  let scaleFactor;

  if (aspect > 1) {
    scaleFactor = viewport.height / 5.0; 
  } else {
    scaleFactor = viewport.height / 6.0; 
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
        wingsLeftProps={{ position: [-0, 0, 0], scale: 1, rotation: [0, 0, 0] }}
        wingsRightProps={{ position: [0, 0, 0], scale: 1, rotation: [0, 0, 0] }}
        wingsPrimitiveOffset={props.wingsPrimitiveOffset}
        tiltAngle={props.tiltAngle}
        verticalMovementFactor={props.verticalMovementFactor}
      />
    </group>
  );
}

// --- 감정 컬럼(프레임) 컴포넌트 ---
function EmotionColumn({ emoji = '😀', keywords = [], sliderValue = 50, onSliderChange }) {
  return (
    <div style={{
      width: 260,
      minWidth: 220,
      minHeight: '100vh',
      background: '#B02B3A',
      borderRadius: 30,
      padding: '24px 12px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 24,
      boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
    }}>
      <div style={{
        width: '100%',
        background: '#D2F2E9',
        color: '#222',
        fontWeight: 700,
        fontSize: 22,
        borderRadius: 12,
        textAlign: 'center',
        padding: '10px 0',
        marginTop: 22, 
        marginBottom: 1
      }}>감정 무게</div>
      <div style={{
        width: '90%',
        background: 'white',
        borderRadius: 18,
        boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '18px 0 18px 0',
        marginBottom: 30
      }}>
        <div style={{ fontSize: 60, marginBottom: 10 }}>{emoji}</div>
        <div style={{ width: '80%', height: 18, background: '#BFE2D6', borderRadius: 9, position: 'relative', margin: '10px 0' }}>
          <div style={{
            position: 'absolute',
            left: `calc(${sliderValue}% - 18px)`,
            top: -7,
            width: 32,
            height: 32,
            background: '#E94B5A',
            borderRadius: '50%',
            boxShadow: '0 2px 6px rgba(0,0,0,0.13)',
            border: '3px solid #fff',
            transition: 'left 0.2s'
          }} />
        </div>
      </div>
      <div style={{
        width: '90%',
        background: 'white',
        borderRadius: 18,
        boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
        padding: '16px 10px',
        marginBottom: 8,
        fontSize: 18,
        color: '#222',
        textAlign: 'left',
        minHeight: 90,
        display: 'flex',
        flexDirection: 'column',
        gap: 4
      }}>
        <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 6 }}>감정 배워보기</div>
        <div>
          {keywords.map((k, i) => (
            <span key={i} style={{ marginRight: 8 }}>{k}</span>
          ))}
        </div>
      </div>
      <div style={{ flex: 1 }} />
      <button
        style={{
          width: '90%',
          background: 'white',
          color: '#B02B3A',
          border: 'none',
          borderRadius: 18,
          fontWeight: 700,
          fontSize: 20,
          padding: '12px 0',
          marginTop: 'auto',
          marginBottom: 40,
          boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
          cursor: 'pointer'
        }}
      >만들기 시작</button>
    </div>
  );
}

// --- 메인 페이지 컴포넌트: MoodTrackerPage ---
export default function MoodTrackerPage() {
  const [showLanding, setShowLanding] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isGameModalOpen, setIsGameModalOpen] = useState(false);
  const [selectedEmojiForGame, setSelectedEmojiForGame] = useState(null);

  const bodyProps = { position: [0, 0.5, 0], scale: 1.9, rotation: [0, 0, 0] };
  const wingsProps = { position: [0, -0.02, 0], scale: 1.1, rotation: [0, 0, 0] };
  const wingsPrimitiveOffset = [0, 0, 0];

  const handleEmojiSelectForGame = (emoji) => {
    setSelectedEmojiForGame(emoji);
    setIsGameModalOpen(true);
  };

  const closeGameModal = () => {
    setIsGameModalOpen(false);
    setSelectedEmojiForGame(null);
  };

  const handlePlayClick = () => {
    setShowLanding(false);
  };

  const keywords = ['기쁨', '즐거움', '행복함', '밝음', '신남', '부드러움', '통통튀는', '화창한'];

  // --- 첫 화면 3D 모델 애니메이션 컴포넌트 ---
  const EMOTION_MODEL_PATHS = [
    '/models/emotion1.gltf',
    '/models/emotion2.gltf',
    '/models/emotion3.gltf',
    '/models/emotion4.gltf',
    '/models/emotion5.gltf',
  ];
  const NUM_FALLING_MODELS = 100; // 화면을 채울 모델 개수 증가
  const FALLING_MODEL_SCALE = 40; // 떨어지는 모델 크기 증가
  const FALL_SPEED_MIN = 0.005; // 이 값들은 이제 직접 사용되지 않음 (중력 기반으로 변경)
  const FALL_SPEED_MAX = 0.015; // 이 값들은 이제 직접 사용되지 않음

  EMOTION_MODEL_PATHS.forEach(path => useGLTF.preload(path));

  function FallingEmotionModel({ modelPath, initialX, initialY, viewportHeight, modelScale }) {
    const ref = React.useRef();
    const { scene } = useGLTF(modelPath);
    const clonedScene = React.useMemo(() => scene.clone(), [scene]);
    
    const [isHovered, setIsHovered] = useState(false);
    const velocity = useRef({ x: 0, y: 0 }); // X, Y 속도
    const [rotationSpeed] = useState(() => (Math.random() - 0.5) * 0.02);
    const [xPos] = useState(initialX);


    useFrame((state, delta) => {
      if (ref.current) {
        const currentVel = velocity.current;
        const G_ACCEL = 0.0003;
        const HOVER_SIDE_STRENGTH = 0.15; // 호버 시 좌우로 밀리는 힘 강도
        const HOVER_UP_STRENGTH = 0.0008; // 호버 시 위로 밀리는 힘 강도 (중력 약간 상쇄)
        const X_DAMPING = 0.92; // X축 이동 감속

        // 중력 적용 (아래로 떨어지는 속도 증가)
        currentVel.y += G_ACCEL * 80 * delta;

        if (isHovered) {
          // 호버 시 X축으로 랜덤하게 밀기
          currentVel.x += (Math.random() - 0.5) * HOVER_SIDE_STRENGTH * 60 * delta;
          // 호버 시 Y축 하강 속도 약간 줄이기 (위로 밀리는 효과)
          currentVel.y -= HOVER_UP_STRENGTH * 60 * delta;
        }

        // 위치 업데이트
        ref.current.position.x += currentVel.x * 60 * delta;
        ref.current.position.y -= currentVel.y * 60 * delta; // Y 속도가 양수일 때 아래로 이동

        // X축 감속
        currentVel.x *= X_DAMPING;

        // 회전
        ref.current.rotation.y += rotationSpeed * 60 * delta;
        ref.current.rotation.x += rotationSpeed * 0.5 * 60 * delta;

        // 화면 하단 도달 시 리셋
        if (ref.current.position.y < -viewportHeight / 2 - modelScale * 2) { // 여유값은 modelScale에 비례하게
          ref.current.position.y = viewportHeight / 2 + modelScale * 2 + Math.random() * viewportHeight * 0.3;
          ref.current.position.x = (Math.random() - 0.5) * state.viewport.width * 0.9;
          currentVel.x = 0;
          currentVel.y = 0; // 속도 초기화
          setIsHovered(false); // 호버 상태도 리셋
        }
      }
    });

    return (
      <primitive
        ref={ref}
        object={clonedScene}
        scale={modelScale}
        position={[xPos, initialY, 0]} // Z 위치 0으로 고정
        onPointerOver={(event) => { 
          event.stopPropagation(); 
          setIsHovered(true); 
        }}
        onPointerOut={() => setIsHovered(false)}
      />
    );
  }

  function FallingModelsScene() {
    const { viewport } = useThree();
    const models = [];

    for (let i = 0; i < NUM_FALLING_MODELS; i++) {
      const modelPath = EMOTION_MODEL_PATHS[i % EMOTION_MODEL_PATHS.length];
      // 초기 Y 위치를 화면 상단 너머로 더 넓게 분산시키고, X 위치도 화면 전체에 걸쳐 랜덤하게 분산
      const initialModelX = (Math.random() - 0.5) * viewport.width * 1.2; // X 범위를 약간 넓게
      const initialModelY = viewport.height / 2 + FALLING_MODEL_SCALE + (i % (NUM_FALLING_MODELS / 5)) * (FALLING_MODEL_SCALE * 1.8) + Math.random() * FALLING_MODEL_SCALE;


      models.push(
        <FallingEmotionModel
          key={`${modelPath}-${i}`} // 고유한 key 제공
          modelPath={modelPath}
          initialX={initialModelX}
          initialY={initialModelY}
          viewportHeight={viewport.height}
          modelScale={FALLING_MODEL_SCALE}
        />
      );
    }

    return (
      <>
        <ambientLight intensity={0.7} />
        <directionalLight position={[0, 10, 10]} intensity={1} />
        <directionalLight position={[0, -10, -5]} intensity={0.3} />
        {models}
      </>
    );
  }

  if (showLanding) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: '#B02B3A',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '80px',
          left: 0,
          width: '100%',
          height: '20vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1,
          color: 'rgba(255, 255, 255, 0.66)',
          fontSize: 'calc(min(30vw, 35vh))',
          fontWeight: 'bold',
          fontFamily: 'Arial, sans-serif',
          textAlign: 'center',
          pointerEvents: 'none',
          textTransform: 'uppercase'
        }}>
          MoMo
        </div>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 2 }}>
          <Canvas>
            <OrthographicCamera
              makeDefault
              position={[0, 0, 100]} 
              zoom={25}
            />
            <Suspense fallback={null}>
              <FallingModelsScene />
            </Suspense>
          </Canvas>
        </div>
        <button
          onClick={handlePlayClick}
          style={{
            padding: '50px 100px',
            fontSize: '60px',
            cursor: 'pointer',
            background: 'white',
            color: '#B02B3A',
            border: '5px solid white',
            borderRadius: '25px',
            fontWeight: 'bold',
            boxShadow: '0 12px 24px rgba(0,0,0,0.4)',
            zIndex: 3,
            position: 'absolute',
            bottom: '100px',
            left: '50%',
            transform: 'translateX(-50%)'
          }}
        >
          Play
        </button>
      </div>
    );
  }

  return (
    <FullScreenContainer>
      <div style={{ display: 'flex', width: '100%', height: '100%', justifyContent: 'space-between', alignItems: 'center', position: 'absolute', top: 0, left: 0, zIndex: 1 }}>
        <EmotionColumn emoji="😀" keywords={keywords} sliderValue={30} />
        <EmotionColumn emoji="😞" keywords={keywords} sliderValue={70} />
      </div>
      <div style={{ width: '90%', height: '90%', maxWidth: '1200px', maxHeight: '900px', position: 'relative', zIndex: 2 }}>
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
          </Suspense>
        </Canvas>
      </div>
      <IconBarPlaceholder onEmojiSelect={handleEmojiSelectForGame} />
      <GameModal isOpen={isGameModalOpen} emoji={selectedEmojiForGame} onClose={closeGameModal} />
    </FullScreenContainer>
  );
}