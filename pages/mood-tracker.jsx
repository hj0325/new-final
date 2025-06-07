import React, { useState, Suspense, useRef } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Text, useGLTF, OrthographicCamera } from '@react-three/drei';
import { useRouter } from 'next/router';
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
    background: '#000000',
    overflow: 'hidden',
    position: 'relative'
  }}>
    {/* 배경 MOMO 텍스트 */}
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      fontSize: 'min(25vw, 25vh)',
      fontWeight: 'bold',
      color: 'rgba(255, 255, 255, 0.1)',
      fontFamily: 'Arial, sans-serif',
      pointerEvents: 'none',
      zIndex: 0,
      userSelect: 'none'
    }}>
      MOMO
    </div>
    {children}
  </div>
);

// --- UI 컴포넌트: 하단 이모티콘 선택 바 ---
const IconBarPlaceholder = ({ onEmojiSelect }) => {
  const emojis = ['😀', '😮', '😐', '😖', '😠']; 
  const [hoveredIndex, setHoveredIndex] = useState(null);
  
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
        <div 
          key={index} 
          style={{
          fontSize: '130px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          cursor: 'pointer',
            transition: 'all 0.3s ease',
            filter: hoveredIndex === index ? 'drop-shadow(0 0 20px #ffff00) brightness(1.5)' : 'none',
            transform: hoveredIndex === index ? 'scale(1.1)' : 'scale(1)',
          }} 
          onClick={() => onEmojiSelect(emoji)}
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {emoji}
        </div>
      ))}
    </div>
  );
}

// --- UI 컴포넌트: 게임 생성 모달 ---
const GameCreationModal = ({ isOpen, keyword, dominantEmoji, onClose }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(135deg, #B02B3A 0%, #8B1E2B 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      animation: 'fadeIn 0.3s ease-in-out'
    }}>
      {/* 배경 장식 요소들 */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '10%',
        width: '100px',
        height: '100px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '50%',
        animation: 'float 6s ease-in-out infinite'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '15%',
        right: '15%',
        width: '150px',
        height: '150px',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '50%',
        animation: 'float 8s ease-in-out infinite reverse'
      }} />
      <div style={{
        position: 'absolute',
        top: '20%',
        right: '20%',
        width: '80px',
        height: '80px',
        background: 'rgba(255, 255, 255, 0.08)',
        borderRadius: '50%',
        animation: 'float 7s ease-in-out infinite'
      }} />

      <div style={{
        width: '80vw',
        height: '70vh',
        maxWidth: '800px',
        maxHeight: '600px',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        border: '3px solid #B02B3A',
        borderRadius: '20px',
        boxShadow: '0 15px 30px rgba(0, 0, 0, 0.3)',
        padding: '40px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '30px',
        position: 'relative',
        backdropFilter: 'blur(10px)',
        animation: 'slideIn 0.4s ease-out'
      }}>
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '15px',
            right: '20px',
            background: 'none',
            border: 'none',
            fontSize: '30px',
            cursor: 'pointer',
            color: '#B02B3A',
            fontWeight: 'bold',
            transition: 'transform 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'scale(1.1)';
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'scale(1)';
          }}
        >
          ×
        </button>

        {/* 우세한 이모티콘 표시 */}
        <div style={{
          fontSize: '120px',
          marginBottom: '10px',
          textShadow: '0 4px 8px rgba(0,0,0,0.1)',
          animation: 'bounce 2s ease-in-out infinite'
        }}>
          {dominantEmoji}
        </div>

        {/* 메인 문구 */}
        <h1 style={{
          textAlign: 'center',
          fontSize: '28px',
          fontWeight: 'bold',
          color: '#B02B3A',
          margin: '0',
          lineHeight: '1.4',
          animation: 'fadeInUp 0.6s ease-out'
        }}>
          "{keyword}"의 감정 생물을 만들어 보아요!
        </h1>

        {/* 키워드 표시 */}
        <div style={{
          padding: '15px 30px',
          background: '#D2F2E9',
          borderRadius: '25px',
          fontSize: '20px',
          fontWeight: '600',
          color: '#333',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          animation: 'fadeInUp 0.8s ease-out'
        }}>
          키워드: {keyword}
        </div>

        {/* 게임 시작 버튼 */}
        <button style={{
          padding: '15px 40px',
          fontSize: '22px',
          fontWeight: 'bold',
          background: '#B02B3A',
          color: 'white',
          border: 'none',
          borderRadius: '15px',
          cursor: 'pointer',
          boxShadow: '0 6px 12px rgba(176, 43, 58, 0.3)',
          transition: 'all 0.3s ease',
          marginTop: '20px',
          animation: 'fadeInUp 1s ease-out'
        }}
        onMouseOver={(e) => {
          e.target.style.transform = 'translateY(-2px)';
          e.target.style.boxShadow = '0 8px 16px rgba(176, 43, 58, 0.4)';
        }}
        onMouseOut={(e) => {
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = '0 6px 12px rgba(176, 43, 58, 0.3)';
        }}>
          생물 만들기 시작!
        </button>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from { 
            opacity: 0;
            transform: scale(0.8);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  );
};

// --- UI 컴포넌트: 게임 모달 ---
const GameModal = ({ isOpen, emoji, onClose, onPositiveNegativeSelect }) => {
  const [currentKeywordInput, setCurrentKeywordInput] = React.useState('');
  const [userKeywords, setUserKeywords] = React.useState([]);

  React.useEffect(() => {
    // 모달이 열리거나 대상 이모티콘이 변경될 때 입력 상태 초기화
    if (isOpen) {
      setCurrentKeywordInput('');
      setUserKeywords([]);
    } else {
      // 모달이 닫힐 때도념のため 초기화 (선택적)
      setCurrentKeywordInput('');
      setUserKeywords([]);
    }
  }, [isOpen, emoji]); 

  if (!isOpen || !emoji) return null;

  // const originalKeywords = emojiKeywords[emoji] || ['키워드 정보 없음']; // 원래 키워드 (참고용으로 남겨둘 수 있음)

  const handleAddKeyword = () => {
    if (currentKeywordInput.trim() !== '') {
      setUserKeywords(prev => [...prev, currentKeywordInput.trim()]);
      setCurrentKeywordInput('');
    }
  };

  const handlePositiveClick = () => {
    onPositiveNegativeSelect('positive');
    onClose();
  };

  const handleNegativeClick = () => {
    onPositiveNegativeSelect('negative');
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: '48%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '60vw',
      height: 'auto', // 높이를 auto로 변경하여 내용에 따라 조절
      minHeight: '40vh', // 최소 높이 설정
      maxHeight: '70vh', // 최대 높이 설정
      overflowY: 'auto', // 내용이 많으면 스크롤
      maxWidth: '600px',
      // maxHeight: '400px', // 이 부분은 내용에 따라 유동적이므로 주석 처리 또는 삭제
      backgroundColor: 'rgba(255, 255, 255, 0.90)',
      border: '2px solid #eee',
      borderRadius: '10px',
      boxShadow: '0 8px 13px rgba(0, 0, 0, 0.71)',
      padding: '30px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      // justifyContent: 'flex-start', // 기본값으로 변경 또는 삭제
      gap: '15px', // 요소 간 간격 조정
      zIndex: 1000,
    }}>
      <span style={{ fontSize: '100px', marginBottom: '0px' }}>{emoji}</span> {/* 이모지 크기 약간 줄임 */}
      <h2 style={{ textAlign: 'center', marginTop: '0px', marginBottom: '10px', fontSize: '22px' }}>오늘의 감정 이유</h2>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '90%', marginBottom:'10px' }}>
        <input 
          type="text"
          value={currentKeywordInput}
          onChange={(e) => setCurrentKeywordInput(e.target.value)}
          placeholder="선택 이유"
          style={{
            flexGrow: 1,
            padding: '10px 15px',
            fontSize: '16px',
            borderRadius: '5px',
            border: '1px solid #ccc',
            boxSizing: 'border-box'
          }}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleAddKeyword();
            }
          }}
        />
        <button onClick={handleAddKeyword} style={{
          padding: '10px 15px',
          fontSize: '16px',
          cursor: 'pointer',
          background: '#5cb85c', // 초록색 계열 버튼
          color: 'white',
          border: 'none',
          borderRadius: '5px'
        }}>
          추가
        </button>
      </div>

      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '8px',  // 키워드 간 간격
        justifyContent: 'center', 
        width: '100%', 
        padding: '10px 0', 
        minHeight: '50px' // 키워드가 없을 때도 최소 높이 유지
      }}>
        {userKeywords.length > 0 ? userKeywords.map((keyword, index) => (
          <span key={index} style={{
            padding: '8px 15px',
            background: '#ffc0cb',
            borderRadius: '30px',
            fontSize: '18px' // 폰트 크기 통일
          }}>
            {keyword}
          </span>
        )) : (
          <span style={{color: '#888', fontSize: '16px'}}>입력한 키워드가 여기에 표시됩니다.</span>
        )}
      </div>
      
      <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
        <button onClick={handlePositiveClick} style={{
          padding: '12px 25px',
          fontSize: '18px',
        cursor: 'pointer',
        background: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '5px'
      }}>
          긍정
        </button>
        <button onClick={handleNegativeClick} style={{
          padding: '12px 25px',
          fontSize: '18px',
          cursor: 'pointer',
          background: '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '5px'
        }}>
          부정
      </button>
      </div>
    </div>
  );
};

// --- UI 컴포넌트: 첫 화면 텍스트 입력 모달 ---
const TextInputModal = ({ isOpen, onClose, currentText, onTextChange, onSubmit }) => {
  if (!isOpen) return null;

  const handleSubmit = () => {
    onSubmit(currentText);
    onClose();
  };

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
      justifyContent: 'space-between', // 요소들 사이에 공간 배분
      gap: '20px',
      zIndex: 1001, // GameModal보다 위에, 또는 다른 모달과 겹치지 않게
    }}>
      <h2 style={{ textAlign: 'center', marginTop: '10px', marginBottom: '10px', fontSize: '30px', color: '#333' }}>
        오늘의 무게 단어
      </h2>
      <textarea
        value={currentText}
        onChange={(e) => onTextChange(e.target.value)}
        placeholder="단어 입력"
        style={{
          width: '90%',
          height: '100px', // 높이 조절
          padding: '30px',
          fontSize: '30px',
          borderRadius: '8px',
          border: '1px solid #ccc',
          resize: 'none', // 사용자가 크기 조절 못하게
          boxSizing: 'border-box',
          textAlign: 'center',
        }}
      />
      <button onClick={handleSubmit} style={{
        padding: '12px 25px',
        fontSize: '18px',
        cursor: 'pointer',
        background: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        alignSelf: 'center', // 버튼 중앙 정렬
      }}>
        확인
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
function EmotionColumn({ emoji = '😀', keywords = [], sliderValue = 50, onSliderChange, onStartGame }) {
  const handleSliderClick = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const sliderWidth = rect.width;
    const newValue = Math.max(0, Math.min(100, (clickX / sliderWidth) * 100));
    if (onSliderChange) {
      onSliderChange(newValue);
    }
  };

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
        <div 
          style={{ 
            width: '80%', 
            height: 18, 
            background: '#BFE2D6', 
            borderRadius: 9, 
            position: 'relative', 
            margin: '10px 0',
            cursor: 'pointer'
          }}
          onClick={handleSliderClick}
        >
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
            transition: 'left 0.2s',
            cursor: 'pointer'
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
        <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 6 }}>감정 끝말잇기</div>
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
        onClick={onStartGame}
      >만들기 시작</button>
    </div>
  );
}

// --- 메인 페이지 컴포넌트: MoodTrackerPage ---
export default function MoodTrackerPage() {
  const router = useRouter();
  const [showLanding, setShowLanding] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isGameModalOpen, setIsGameModalOpen] = useState(false);
  const [selectedEmojiForGame, setSelectedEmojiForGame] = useState(null);
  const [isTextInputModalOpen, setIsTextInputModalOpen] = useState(false); // 텍스트 입력 모달 상태
  const [userInputText, setUserInputText] = useState(''); // 사용자 입력 텍스트 상태
  const [leftSliderValue, setLeftSliderValue] = useState(30); // 왼쪽 슬라이더 값
  const [rightSliderValue, setRightSliderValue] = useState(70); // 오른쪽 슬라이더 값
  const [isGameCreationModalOpen, setIsGameCreationModalOpen] = useState(false); // 게임 생성 모달 상태
  const [showColumns, setShowColumns] = useState(false); // 양쪽 칼럼 표시 상태

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
    // setShowLanding(false); // 직접 화면 전환하는 대신 모달 열기
    setIsTextInputModalOpen(true);
  };

  const handleTextInputSubmit = (text) => {
    setUserInputText(text);
    // 모달의 onClose가 호출되므로 여기서는 isTextInputModalOpen을 false로 설정할 필요 없음
    setShowLanding(false); // 메인 화면으로 전환
  };

  const handleStartGame = () => {
    // 슬라이더 값이 더 큰 이모티콘 결정
    const dominantEmoji = leftSliderValue > rightSliderValue ? '😀' : '😞';
    setIsGameCreationModalOpen(true);
  };

  const closeGameCreationModal = () => {
    setIsGameCreationModalOpen(false);
  };

  // 슬라이더 값이 더 큰 이모티콘 결정
  const dominantEmoji = leftSliderValue > rightSliderValue ? '😀' : '😞';

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
        <TextInputModal
          isOpen={isTextInputModalOpen}
          onClose={() => setIsTextInputModalOpen(false)}
          currentText={userInputText}
          onTextChange={setUserInputText}
          onSubmit={handleTextInputSubmit}
        />
      </div>
    );
  }

  // 현재 날짜와 시간 가져오기
  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const dayName = dayNames[now.getDay()];
    const hour = now.getHours();
    const minute = now.getMinutes().toString().padStart(2, '0');
    
    return `${year}년 ${month}월 ${day}일 (${dayName}) 오후 ${hour}:${minute}`;
  };

  return (
    <FullScreenContainer>
      {/* 상단 헤더 정보 */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '90%',
        maxWidth: '1200px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 100,
        padding: '0 20px'
      }}>
        {/* 왼쪽: 제목 */}
        <div style={{
          color: 'white',
          fontSize: '18px',
          fontWeight: '600'
        }}>
          이모티콘을 이용해 오늘의 감정 무게를 측정하고 기록하세요
        </div>
        
        {/* 오른쪽: 오늘의 감정 기록하기와 날짜 */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '5px'
        }}>
          <div style={{
            color: 'white',
            fontSize: '18px',
            fontWeight: '600'
          }}>
            오늘의 감정 기록하기
          </div>
          <div style={{
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '14px'
          }}>
            {getCurrentDateTime()}
          </div>
        </div>
      </div>

      {userInputText && (
        <div style={{
          position: 'absolute',
          top: '80px', // 상단 헤더 아래로 이동
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '12px 25px',
          background: 'rgba(255, 255, 255, 0.85)',
          borderRadius: '12px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
          fontSize: '20px',
          fontWeight: '500',
          color: '#333',
          zIndex: 100,
          textAlign: 'center',
          minWidth: '200px',
          maxWidth: '80%',
        }}>
          {userInputText}
        </div>
      )}
      {showColumns && (
      <div style={{ display: 'flex', width: '100%', height: '100%', justifyContent: 'space-between', alignItems: 'center', position: 'absolute', top: 0, left: 0, zIndex: 1 }}>
        <EmotionColumn emoji="😀" keywords={keywords} sliderValue={leftSliderValue} onSliderChange={setLeftSliderValue} onStartGame={handleStartGame} />
        <EmotionColumn emoji="😞" keywords={keywords} sliderValue={rightSliderValue} onSliderChange={setRightSliderValue} onStartGame={handleStartGame} />
      </div>
      )}
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
              <GameModal isOpen={isGameModalOpen} emoji={selectedEmojiForGame} onClose={closeGameModal} onPositiveNegativeSelect={(type) => {
          // 긍정/부정 버튼 클릭 시 양쪽 칼럼 표시
          setShowColumns(true);
          console.log(`Selected ${type} emotion: ${selectedEmojiForGame}`);
        }} />
      <GameCreationModal
        isOpen={isGameCreationModalOpen}
        keyword={userInputText}
        dominantEmoji={dominantEmoji}
        onClose={closeGameCreationModal}
      />
    </FullScreenContainer>
  );
}