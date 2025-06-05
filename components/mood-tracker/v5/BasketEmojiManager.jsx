import React, { useMemo } from 'react';
import BasketEmoji3D from './BasketEmoji3D';
import OverflowEmojiManager from './OverflowEmojiManager';

const BasketEmojiManager = ({ 
  leftCount = 0, 
  rightCount = 0, 
  leftEmojiTypes = [], 
  rightEmojiTypes = [],
  emojiScale = 0.2,
  emojiSpacing = 0.3,
  basketHeight = 1.2,
  basketCapacity = 10,
  leftBasketX = -2,
  rightBasketX = 1,
  randomnessRange = 0.1,
  animationSpeed = 0.5,
  bobAmplitude = 0.03,
  zPositionRange = 0.2,
  zPositionOffset = 0.0
}) => {
  
  // 실제 바구니 내부 이모티콘과 넘치는 이모티콘 계산
  const leftBasketCount = Math.min(leftCount, basketCapacity);
  const leftOverflowCount = Math.max(0, leftCount - basketCapacity);
  const rightBasketCount = Math.min(rightCount, basketCapacity);
  const rightOverflowCount = Math.max(0, rightCount - basketCapacity);
  
  // 바구니의 실제 크기 (ScaledScene의 스케일링 고려)
  const ACTUAL_BASKET_RADIUS = 0.3; // 실제 바구니 반지름 (약간 여유를 둠)
  const SAFE_MARGIN = 0.05; // 여유 공간
  const USABLE_RADIUS = ACTUAL_BASKET_RADIUS - SAFE_MARGIN;
  
  // 왼쪽 바구니 이모티콘들 생성
  const leftEmojis = useMemo(() => {
    const emojis = [];
    
    for (let i = 0; i < leftBasketCount; i++) {
      const emojiType = leftEmojiTypes[i % leftEmojiTypes.length] || '😀';
      
      // 원형 배치로 변경 - 바구니는 원형이므로
      const layer = Math.floor(i / 6); // 한 층에 최대 6개
      const indexInLayer = i % 6;
      const anglePerItem = (Math.PI * 2) / Math.max(1, Math.min(6, leftBasketCount - layer * 6));
      const angle = indexInLayer * anglePerItem;
      
      // 층별로 반지름 줄이기
      const layerRadius = USABLE_RADIUS * (1 - layer * 0.3);
      const actualRadius = Math.max(0.05, layerRadius); // 최소 반지름 보장
      
      // 원형 배치 좌표 계산
      const localX = Math.cos(angle) * actualRadius;
      const localZ = Math.sin(angle) * actualRadius;
      
      // 랜덤 요소를 매우 작게 제한
      const smallRandomness = Math.min(randomnessRange * 0.2, 0.03);
      const randomX = (Math.random() - 0.5) * smallRandomness;
      const randomZ = (Math.random() - 0.5) * smallRandomness;
      
      // 최종 위치 계산 (바구니 중심 기준)
      const x = leftBasketX + localX + randomX;
      const z = zPositionOffset + localZ + randomZ;
      const y = basketHeight + (layer * 0.15); // 층간 높이 차이
      
      // 바구니 경계 체크 - 반지름을 벗어나면 중심으로 끌어당김
      const distanceFromCenter = Math.sqrt(
        Math.pow(x - leftBasketX, 2) + Math.pow(z - zPositionOffset, 2)
      );
      
      let finalX = x;
      let finalZ = z;
      
      if (distanceFromCenter > USABLE_RADIUS) {
        const ratio = USABLE_RADIUS / distanceFromCenter;
        finalX = leftBasketX + (x - leftBasketX) * ratio;
        finalZ = zPositionOffset + (z - zPositionOffset) * ratio;
      }
      
      emojis.push({
        id: `left-${i}`,
        emoji: emojiType,
        position: [finalX, y, finalZ]
      });
    }
    return emojis;
  }, [leftBasketCount, leftEmojiTypes, basketHeight, leftBasketX, randomnessRange, zPositionOffset]);

  // 오른쪽 바구니 이모티콘들 생성
  const rightEmojis = useMemo(() => {
    const emojis = [];
    
    for (let i = 0; i < rightBasketCount; i++) {
      const emojiType = rightEmojiTypes[i % rightEmojiTypes.length] || '😀';
      
      // 원형 배치로 변경 - 바구니는 원형이므로
      const layer = Math.floor(i / 6); // 한 층에 최대 6개
      const indexInLayer = i % 6;
      const anglePerItem = (Math.PI * 2) / Math.max(1, Math.min(6, rightBasketCount - layer * 6));
      const angle = indexInLayer * anglePerItem;
      
      // 층별로 반지름 줄이기
      const layerRadius = USABLE_RADIUS * (1 - layer * 0.3);
      const actualRadius = Math.max(0.05, layerRadius); // 최소 반지름 보장
      
      // 원형 배치 좌표 계산
      const localX = Math.cos(angle) * actualRadius;
      const localZ = Math.sin(angle) * actualRadius;
      
      // 랜덤 요소를 매우 작게 제한
      const smallRandomness = Math.min(randomnessRange * 0.2, 0.03);
      const randomX = (Math.random() - 0.5) * smallRandomness;
      const randomZ = (Math.random() - 0.5) * smallRandomness;
      
      // 최종 위치 계산 (바구니 중심 기준)
      const x = rightBasketX + localX + randomX;
      const z = zPositionOffset + localZ + randomZ;
      const y = basketHeight + (layer * 0.15); // 층간 높이 차이
      
      // 바구니 경계 체크 - 반지름을 벗어나면 중심으로 끌어당김
      const distanceFromCenter = Math.sqrt(
        Math.pow(x - rightBasketX, 2) + Math.pow(z - zPositionOffset, 2)
      );
      
      let finalX = x;
      let finalZ = z;
      
      if (distanceFromCenter > USABLE_RADIUS) {
        const ratio = USABLE_RADIUS / distanceFromCenter;
        finalX = rightBasketX + (x - rightBasketX) * ratio;
        finalZ = zPositionOffset + (z - zPositionOffset) * ratio;
      }
      
      emojis.push({
        id: `right-${i}`,
        emoji: emojiType,
        position: [finalX, y, finalZ]
      });
    }
    return emojis;
  }, [rightBasketCount, rightEmojiTypes, basketHeight, rightBasketX, randomnessRange, zPositionOffset]);

  return (
    <>
      {/* 왼쪽 바구니 이모티콘들 */}
      {leftEmojis.map((emojiData) => (
        <BasketEmoji3D
          key={emojiData.id}
          emoji={emojiData.emoji}
          position={emojiData.position}
          basketSide="left"
          scale={emojiScale}
          animationSpeed={animationSpeed}
          bobAmplitude={bobAmplitude}
        />
      ))}
      
      {/* 오른쪽 바구니 이모티콘들 */}
      {rightEmojis.map((emojiData) => (
        <BasketEmoji3D
          key={emojiData.id}
          emoji={emojiData.emoji}
          position={emojiData.position}
          basketSide="right"
          scale={emojiScale}
          animationSpeed={animationSpeed}
          bobAmplitude={bobAmplitude}
        />
      ))}
      
      {/* 넘침 효과 */}
      <OverflowEmojiManager
        leftOverflowCount={leftOverflowCount}
        rightOverflowCount={rightOverflowCount}
        leftEmojiTypes={leftEmojiTypes}
        rightEmojiTypes={rightEmojiTypes}
        emojiScale={emojiScale}
        leftBasketX={leftBasketX}
        rightBasketX={rightBasketX}
      />
    </>
  );
};

export default BasketEmojiManager; 