import React, { useState, useEffect, useRef } from 'react';
import FallingEmoji3D from './FallingEmoji3D';
import BasketColliders from './BasketColliders';

function FallingEmojiManager({ 
  leftCount = 0, 
  rightCount = 0, 
  leftEmojiTypes = [], // 배열로 변경
  rightEmojiTypes = [] // 배열로 변경
}) {
  const [leftEmojis, setLeftEmojis] = useState([]);
  const [rightEmojis, setRightEmojis] = useState([]);
  const emojiIdCounter = useRef(0);

  // 저울 바구니 위치 설정 (실제 저울 좌표에 맞춤)
  // Scale 컴포넌트에서 날개 위치: [-0.38, 0.2, 0], [0.38, 0.2, 0]
  // bodyProps scale: 1.9, position: [0, 0.5, 0]
  const LEFT_BASKET_X = -0.38 * 1.9; // 실제 좌측 날개 위치
  const RIGHT_BASKET_X = 0.38 * 1.9; // 실제 우측 날개 위치
  const DROP_HEIGHT = 6; // 더 높은 위치에서 떨어뜨리기
  const EMOJI_SCALE = 0.8; // 원래 크기로 복원

  // 좌측 이모티콘 개수 변화 감지
  useEffect(() => {
    const currentLeftCount = leftEmojis.length;
    
    if (leftCount > currentLeftCount && leftEmojiTypes.length > 0) {
      // 이모티콘 추가 - 하나씩 떨어뜨리기
      const newEmojis = [];
      for (let i = currentLeftCount; i < leftCount; i++) {
        const emojiId = emojiIdCounter.current++;
        // 바구니 중앙에 정확히 떨어지도록 랜덤 범위 최소화
        const randomX = LEFT_BASKET_X + (Math.random() - 0.5) * 0.05;
        const randomZ = (Math.random() - 0.5) * 0.05;
        const delay = (i - currentLeftCount) * 200; // 200ms 간격으로 떨어뜨리기
        
        // 랜덤하게 이모티콘 타입 선택
        const randomEmojiType = leftEmojiTypes[Math.floor(Math.random() * leftEmojiTypes.length)];
        
        setTimeout(() => {
          setLeftEmojis(prev => [...prev, {
            id: emojiId,
            position: [randomX, DROP_HEIGHT, randomZ],
            type: randomEmojiType
          }]);
        }, delay);
      }
    } else if (leftCount < currentLeftCount) {
      // 이모티콘 제거
      setLeftEmojis(prev => prev.slice(0, leftCount));
    }
  }, [leftCount, leftEmojiTypes]);

  // 우측 이모티콘 개수 변화 감지
  useEffect(() => {
    const currentRightCount = rightEmojis.length;
    
    if (rightCount > currentRightCount && rightEmojiTypes.length > 0) {
      // 이모티콘 추가 - 하나씩 떨어뜨리기
      for (let i = currentRightCount; i < rightCount; i++) {
        const emojiId = emojiIdCounter.current++;
        // 바구니 중앙에 정확히 떨어지도록 랜덤 범위 최소화
        const randomX = RIGHT_BASKET_X + (Math.random() - 0.5) * 0.05;
        const randomZ = (Math.random() - 0.5) * 0.05;
        const delay = (i - currentRightCount) * 200; // 200ms 간격으로 떨어뜨리기
        
        // 랜덤하게 이모티콘 타입 선택
        const randomEmojiType = rightEmojiTypes[Math.floor(Math.random() * rightEmojiTypes.length)];
        
        setTimeout(() => {
          setRightEmojis(prev => [...prev, {
            id: emojiId,
            position: [randomX, DROP_HEIGHT, randomZ],
            type: randomEmojiType
          }]);
        }, delay);
      }
    } else if (rightCount < currentRightCount) {
      // 이모티콘 제거
      setRightEmojis(prev => prev.slice(0, rightCount));
    }
  }, [rightCount, rightEmojiTypes]);

  return (
    <group>
      {/* 바구니 충돌체 */}
      <BasketColliders />
      
      {/* 좌측 떨어지는 이모티콘들 */}
      {leftEmojis.map((emoji) => (
        <FallingEmoji3D
          key={`left-${emoji.id}`}
          startPosition={emoji.position}
          scale={EMOJI_SCALE}
          emojiType={emoji.type}
        />
      ))}
      
      {/* 우측 떨어지는 이모티콘들 */}
      {rightEmojis.map((emoji) => (
        <FallingEmoji3D
          key={`right-${emoji.id}`}
          startPosition={emoji.position}
          scale={EMOJI_SCALE}
          emojiType={emoji.type}
        />
      ))}
    </group>
  );
}

export default FallingEmojiManager; 