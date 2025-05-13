import React, { useState, Suspense } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
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
  if (!isOpen || !emoji) return null; // 모달이 열려있지 않거나 이모티콘이 없으면 아무것도 표시 안함

  const keywords = emojiKeywords[emoji] || ['키워드 정보 없음']; // 선택된 이모티콘에 맞는 키워드 또는 기본 메시지

  return (
    // 모달 스타일 정의
    <div style={{
      position: 'fixed', // 화면 중앙 고정을 위해 fixed 사용
      top: '48%',
      left: '50%',
      transform: 'translate(-50%, -50%)', // 정확한 중앙 정렬
      width: '60vw', // 화면 너비의 60%
      height: '60vh', // 화면 높이의 60%
      maxWidth: '600px', // 최대 너비 제한
      maxHeight: '400px', // 최대 높이 제한
      backgroundColor: 'rgba(255, 255, 255, 0.90)',
      border: '2px solid #eee',
      borderRadius: '10px',
      boxShadow: '0 8px 13px rgba(0, 0, 0, 0.71)',
      padding: '30px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start', 
      gap: '10px',  // 내부 요소 정렬
      zIndex: 1000, // 다른 요소들 위에 표시
    }}>
      <span style={{ fontSize: '110px' }}>{emoji}</span> {/* 선택된 이모티콘 표시 */}
      <h2 style={{ textAlign: 'center', marginTop: '2px', marginBottom: '20px' }}>관련 키워드</h2>
      {/* 키워드 목록 표시 */}
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
      {/* 닫기 버튼 */}
      <button onClick={onClose} style={{
        marginTop: 'auto', // 버튼을 모달 하단으로 이동
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
  const { viewport, size } = useThree(); // 뷰포트 및 캔버스 크기 정보
  const aspect = size.width / size.height; // 화면 비율 계산
  let scaleFactor; // 저울 모델의 전체 크기 조절 계수

  // 화면 비율별 스케일 차등 적용
  if (aspect > 1) { // 가로가 더 긴 화면
    scaleFactor = viewport.height / 5.0; 
  } else { // 세로가 더 길거나 정사각형 화면
    scaleFactor = viewport.height / 6.0; 
  }

  return (
    // 그룹을 사용하여 전체 저울 모델의 크기와 초기 회전 설정
    <group 
      scale={[scaleFactor, scaleFactor, scaleFactor]}
      rotation={[-Math.PI / 12, 0, 0]} // 저울을 약간 기울여서 시작
    >
      {/* 실제 저울 3D 모델 컴포넌트 */}
      <Scale
        isHovered={props.isHovered} // 마우스 호버 상태 (mood-tracker.jsx 고유 기능으로 여기선 사용 안 함)
        onHover={props.onHover} // 호버 이벤트 핸들러 (mood-tracker.jsx 고유 기능)
        bodyProps={props.bodyProps} // 저울 본체 스타일 및 위치 props
        wingsProps={props.wingsProps} // 저울 날개 스타일 및 위치 props
        wingsLeftProps={{ position: [-0, 0, 0], scale: 1, rotation: [0, 0, 0] }}
        wingsRightProps={{ position: [0, 0, 0], scale: 1, rotation: [0, 0, 0] }}
        wingsPrimitiveOffset={props.wingsPrimitiveOffset} // 날개 내부 요소 오프셋 props
        tiltAngle={props.tiltAngle} // 저울 기울기 각도 props
        verticalMovementFactor={props.verticalMovementFactor} // 저울 수직 움직임 계수 props
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
      {/* 상단 텍스트 */}
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
      {/* 이모티콘+슬라이더 카드 */}
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
        {/* 슬라이더바 (시각적 placeholder) */}
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
      {/* 감정 배워보기 카드 */}
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
  // --- 상태 관리 ---
  const [isHovered, setIsHovered] = useState(false); // 마우스 호버 상태 (저울 인터랙션용)
  // 게임 모달 관련 상태
  const [isGameModalOpen, setIsGameModalOpen] = useState(false); // 게임 모달 표시 여부
  const [selectedEmojiForGame, setSelectedEmojiForGame] = useState(null); // 게임 모달에 표시할 선택된 이모티콘

  // --- 3D 저울 모델 스타일 및 위치 설정 --- (사용자 주석 및 값 참고)
  const bodyProps = { position: [0, 0.5, 0], scale: 1.9, rotation: [0, 0, 0] }; // 본체 위치, 크기, 회전
  const wingsProps = { position: [0, -0.02, 0], scale: 1.1, rotation: [0, 0, 0] }; // 날개 위치, 크기, 회전
  const wingsPrimitiveOffset = [0, 0, 0]; // 날개 내부 요소 오프셋 (현재 사용 안 함)

  // --- 이벤트 핸들러: 게임 모달 관련 ---
  // 이모티콘 선택 시 호출되어 게임 모달을 열고 선택된 이모티콘을 상태에 저장
  const handleEmojiSelectForGame = (emoji) => {
    setSelectedEmojiForGame(emoji);
    setIsGameModalOpen(true);
  };

  // 게임 모달의 닫기 버튼 클릭 시 호출되어 모달을 닫음
  const closeGameModal = () => {
    setIsGameModalOpen(false);
    setSelectedEmojiForGame(null);
  };

  // 예시 키워드 (이미지 참고)
  const keywords = ['기쁨', '즐거움', '행복함', '밝음', '신남', '부드러움', '통통튀는', '화창한'];

  return (
    <FullScreenContainer>
      {/* 양쪽 컬럼 프레임 추가: flex row로 배치 */}
      <div style={{ display: 'flex', width: '100%', height: '100%', justifyContent: 'space-between', alignItems: 'center', position: 'absolute', top: 0, left: 0, zIndex: 1 }}>
        {/* 왼쪽 컬럼 */}
        <EmotionColumn emoji="😀" keywords={keywords} sliderValue={30} />
        {/* 오른쪽 컬럼 */}
        <EmotionColumn emoji="😞" keywords={keywords} sliderValue={70} />
      </div>
      {/* 기존 3D 캔버스, 하단 이모티콘, 모달 등은 그대로 */}
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