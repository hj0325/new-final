import React, { useState, useEffect, useRef } from 'react';
import { useControls } from 'leva';
import FallingEmoji3D from './FallingEmoji3D';
import BasketColliders from './BasketColliders';

function FallingEmojiManager({ 
  leftCount = 0, 
  rightCount = 0, 
  leftEmojiTypes = [], // 배열로 변경
  rightEmojiTypes = [], // 배열로 변경
  onEmojiLanded = null // 이모티콘이 바구니에 도달했을 때 콜백
}) {
  const [leftEmojis, setLeftEmojis] = useState([]);
  const [rightEmojis, setRightEmojis] = useState([]);
  const emojiIdCounter = useRef(0);

  // useControls를 사용하여 실시간 조정 가능한 값들
  const {
    leftBasketX,
    rightBasketX,
    basketY,
    dropHeight,
    emojiScale,
    randomXRange,
    randomZRange,
    dropDelay
  } = useControls('Emoji Drop Settings', {
    leftBasketX: { value: -0.38 * 1.9, min: -3, max: 0, step: 0.01 },
    rightBasketX: { value: 0.38 * 1.9, min: 0, max: 3, step: 0.01 },
    basketY: { value: (0.5 + 0.2) * 1.9, min: 0, max: 5, step: 0.01 },
    dropHeight: { value: 6.3, min: 3, max: 15, step: 0.1 },
    emojiScale: { value: 0.99, min: 0.1, max: 2, step: 0.01 },
    randomXRange: { value: 0.05, min: 0, max: 0.5, step: 0.01 },
    randomZRange: { value: 0.10, min: 0, max: 0.5, step: 0.01 },
    dropDelay: { value: 200, min: 50, max: 1000, step: 10 }
  });

  // 시각적 디버깅을 위한 바구니 위치 표시 컨트롤
  const { showBasketHelpers } = useControls('Debug Helpers', {
    showBasketHelpers: { value: true }
  });

  // 이모티콘이 바구니에 도달했을 때 처리하는 함수
  const handleEmojiLanded = (landedInfo) => {
    const { emojiType, basket, position } = landedInfo;
    
    // 상위 컴포넌트에 알림
    if (onEmojiLanded) {
      onEmojiLanded(landedInfo);
    }

    // 해당 이모티콘을 상태에서 제거 (약간의 지연 후)
    setTimeout(() => {
      if (basket === 'left') {
        setLeftEmojis(prev => prev.slice(1)); // 첫 번째 이모티콘 제거
      } else if (basket === 'right') {
        setRightEmojis(prev => prev.slice(1)); // 첫 번째 이모티콘 제거
      }
    }, 1500); // 사라짐 애니메이션이 완료된 후 제거
  };

  // 좌측 이모티콘 개수 변화 감지
  useEffect(() => {
    const currentLeftCount = leftEmojis.length;
    
    if (leftCount > currentLeftCount && leftEmojiTypes.length > 0) {
      // 이모티콘 추가 - 하나씩 떨어뜨리기
      const newEmojis = [];
      for (let i = currentLeftCount; i < leftCount; i++) {
        const emojiId = emojiIdCounter.current++;
        // 바구니 중앙에 정확히 떨어지도록 랜덤 범위 조정 가능
        const randomX = leftBasketX + (Math.random() - 0.5) * randomXRange;
        const randomZ = (Math.random() - 0.5) * randomZRange;
        const delay = (i - currentLeftCount) * dropDelay;
        
        // 랜덤하게 이모티콘 타입 선택
        const randomEmojiType = leftEmojiTypes[Math.floor(Math.random() * leftEmojiTypes.length)];
        
        setTimeout(() => {
          setLeftEmojis(prev => [...prev, {
            id: emojiId,
            position: [randomX, dropHeight, randomZ],
            type: randomEmojiType
          }]);
        }, delay);
      }
    } else if (leftCount < currentLeftCount) {
      // 이모티콘 제거
      setLeftEmojis(prev => prev.slice(0, leftCount));
    }
  }, [leftCount, leftEmojiTypes, leftBasketX, dropHeight, randomXRange, randomZRange, dropDelay]);

  // 우측 이모티콘 개수 변화 감지
  useEffect(() => {
    const currentRightCount = rightEmojis.length;
    
    if (rightCount > currentRightCount && rightEmojiTypes.length > 0) {
      // 이모티콘 추가 - 하나씩 떨어뜨리기
      for (let i = currentRightCount; i < rightCount; i++) {
        const emojiId = emojiIdCounter.current++;
        // 바구니 중앙에 정확히 떨어지도록 랜덤 범위 조정 가능
        const randomX = rightBasketX + (Math.random() - 0.5) * randomXRange;
        const randomZ = (Math.random() - 0.5) * randomZRange;
        const delay = (i - currentRightCount) * dropDelay;
        
        // 랜덤하게 이모티콘 타입 선택
        const randomEmojiType = rightEmojiTypes[Math.floor(Math.random() * rightEmojiTypes.length)];
        
        setTimeout(() => {
          setRightEmojis(prev => [...prev, {
            id: emojiId,
            position: [randomX, dropHeight, randomZ],
            type: randomEmojiType
          }]);
        }, delay);
      }
    } else if (rightCount < currentRightCount) {
      // 이모티콘 제거
      setRightEmojis(prev => prev.slice(0, rightCount));
    }
  }, [rightCount, rightEmojiTypes, rightBasketX, dropHeight, randomXRange, randomZRange, dropDelay]);

  return (
    <group>
      {/* 바구니 충돌체 */}
      <BasketColliders />
      
      {/* 시각적 디버깅 헬퍼: 바구니 위치 표시 */}
      {showBasketHelpers && (
        <>
          {/* 좌측 바구니 위치 표시 */}
          <mesh position={[leftBasketX, basketY, 0]}>
            <cylinderGeometry args={[0.4, 0.4, 0.1]} />
            <meshBasicMaterial color="red" transparent opacity={0.3} />
          </mesh>
          <mesh position={[leftBasketX, dropHeight, 0]}>
            <sphereGeometry args={[0.1]} />
            <meshBasicMaterial color="yellow" />
          </mesh>
          
          {/* 우측 바구니 위치 표시 */}
          <mesh position={[rightBasketX, basketY, 0]}>
            <cylinderGeometry args={[0.4, 0.4, 0.1]} />
            <meshBasicMaterial color="blue" transparent opacity={0.3} />
          </mesh>
          <mesh position={[rightBasketX, dropHeight, 0]}>
            <sphereGeometry args={[0.1]} />
            <meshBasicMaterial color="yellow" />
          </mesh>
        </>
      )}
      
      {/* 좌측 떨어지는 이모티콘들 */}
      {leftEmojis.map((emoji) => (
        <FallingEmoji3D
          key={`left-${emoji.id}`}
          startPosition={emoji.position}
          scale={emojiScale}
          emojiType={emoji.type}
          onLanded={handleEmojiLanded}
        />
      ))}
      
      {/* 우측 떨어지는 이모티콘들 */}
      {rightEmojis.map((emoji) => (
        <FallingEmoji3D
          key={`right-${emoji.id}`}
          startPosition={emoji.position}
          scale={emojiScale}
          emojiType={emoji.type}
          onLanded={handleEmojiLanded}
        />
      ))}
    </group>
  );
}

export default FallingEmojiManager; 