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
  
  // 왼쪽 바구니 이모티콘들 생성
  const leftEmojis = useMemo(() => {
    const emojis = [];
    // 이모티콘 크기에 따른 spacing과 randomness 조정
    const adjustedSpacing = emojiSpacing * (1 / Math.max(emojiScale, 0.5)); // 크기가 클수록 간격을 줄임
    const adjustedRandomness = randomnessRange * (1 / Math.max(emojiScale, 0.5)); // 크기가 클수록 랜덤 범위를 줄임
    
    for (let i = 0; i < leftBasketCount; i++) {
      const emojiType = leftEmojiTypes[i % leftEmojiTypes.length] || '😀';
      // 바구니 내부 격자 배치 계산
      const row = Math.floor(i / 3); // 한 줄에 3개씩
      const col = i % 3;
      
      // 바구니 중심을 기준으로 위치 계산 (크기 고려)
      const centerOffset = (col - 1) * adjustedSpacing; // -1, 0, 1 패턴으로 중심 기준
      const x = leftBasketX + centerOffset + (Math.random() - 0.5) * adjustedRandomness;
      const y = basketHeight + (row * adjustedSpacing);
      const z = (Math.random() - 0.5) * zPositionRange + zPositionOffset;
      
      emojis.push({
        id: `left-${i}`,
        emoji: emojiType,
        position: [x, y, z]
      });
    }
    return emojis;
  }, [leftBasketCount, leftEmojiTypes, emojiSpacing, basketHeight, leftBasketX, randomnessRange, zPositionRange, zPositionOffset, emojiScale]);

  // 오른쪽 바구니 이모티콘들 생성
  const rightEmojis = useMemo(() => {
    const emojis = [];
    // 이모티콘 크기에 따른 spacing과 randomness 조정
    const adjustedSpacing = emojiSpacing * (1 / Math.max(emojiScale, 0.5)); // 크기가 클수록 간격을 줄임
    const adjustedRandomness = randomnessRange * (1 / Math.max(emojiScale, 0.5)); // 크기가 클수록 랜덤 범위를 줄임
    
    for (let i = 0; i < rightBasketCount; i++) {
      const emojiType = rightEmojiTypes[i % rightEmojiTypes.length] || '😀';
      // 바구니 내부 격자 배치 계산
      const row = Math.floor(i / 3); // 한 줄에 3개씩
      const col = i % 3;
      
      // 바구니 중심을 기준으로 위치 계산 (크기 고려)
      const centerOffset = (col - 1) * adjustedSpacing; // -1, 0, 1 패턴으로 중심 기준
      const x = rightBasketX + centerOffset + (Math.random() - 0.5) * adjustedRandomness;
      const y = basketHeight + (row * adjustedSpacing);
      const z = (Math.random() - 0.5) * zPositionRange + zPositionOffset;
      
      emojis.push({
        id: `right-${i}`,
        emoji: emojiType,
        position: [x, y, z]
      });
    }
    return emojis;
  }, [rightBasketCount, rightEmojiTypes, emojiSpacing, basketHeight, rightBasketX, randomnessRange, zPositionRange, zPositionOffset, emojiScale]);

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