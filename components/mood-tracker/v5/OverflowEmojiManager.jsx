import React, { useMemo } from 'react';
import OverflowEmoji3D from './OverflowEmoji3D';

const OverflowEmojiManager = ({ 
  leftOverflowCount = 0, 
  rightOverflowCount = 0, 
  leftEmojiTypes = [], 
  rightEmojiTypes = [],
  emojiScale = 0.15,
  leftBasketX = -2,
  rightBasketX = 1
}) => {
  
  // 왼쪽 바구니 넘치는 이모티콘들 생성
  const leftOverflowEmojis = useMemo(() => {
    const emojis = [];
    for (let i = 0; i < leftOverflowCount; i++) {
      const emojiType = leftEmojiTypes[i % leftEmojiTypes.length] || '😀';
      // 왼쪽 바구니 가장자리에서 랜덤하게 생성
      const x = leftBasketX + (Math.random() - 0.5) * 1.0; // 바구니 위치 기반
      const y = 2.5 + Math.random() * 0.5; // 바구니 위쪽에서 시작
      const z = (Math.random() - 0.5) * 0.5;
      
      emojis.push({
        id: `left-overflow-${i}`,
        emoji: emojiType,
        position: [x, y, z],
        initialVelocity: {
          x: (Math.random() - 0.5) * 2, // 좌우로 퍼짐
          y: Math.random() * 1, // 위로 튀어오름
          z: (Math.random() - 0.5) * 1
        }
      });
    }
    return emojis;
  }, [leftOverflowCount, leftEmojiTypes, leftBasketX]);

  // 오른쪽 바구니 넘치는 이모티콘들 생성
  const rightOverflowEmojis = useMemo(() => {
    const emojis = [];
    for (let i = 0; i < rightOverflowCount; i++) {
      const emojiType = rightEmojiTypes[i % rightEmojiTypes.length] || '😀';
      // 오른쪽 바구니 가장자리에서 랜덤하게 생성
      const x = rightBasketX + (Math.random() - 0.5) * 1.0; // 바구니 위치 기반
      const y = 2.5 + Math.random() * 0.5; // 바구니 위쪽에서 시작
      const z = (Math.random() - 0.5) * 0.5;
      
      emojis.push({
        id: `right-overflow-${i}`,
        emoji: emojiType,
        position: [x, y, z],
        initialVelocity: {
          x: (Math.random() - 0.5) * 2, // 좌우로 퍼짐
          y: Math.random() * 1, // 위로 튀어오름
          z: (Math.random() - 0.5) * 1
        }
      });
    }
    return emojis;
  }, [rightOverflowCount, rightEmojiTypes, rightBasketX]);

  return (
    <>
      {/* 왼쪽 바구니 넘치는 이모티콘들 */}
      {leftOverflowEmojis.map((emojiData) => (
        <OverflowEmoji3D
          key={emojiData.id}
          emoji={emojiData.emoji}
          position={emojiData.position}
          initialVelocity={emojiData.initialVelocity}
          basketSide="left"
          scale={emojiScale}
        />
      ))}
      
      {/* 오른쪽 바구니 넘치는 이모티콘들 */}
      {rightOverflowEmojis.map((emojiData) => (
        <OverflowEmoji3D
          key={emojiData.id}
          emoji={emojiData.emoji}
          position={emojiData.position}
          initialVelocity={emojiData.initialVelocity}
          basketSide="right"
          scale={emojiScale}
        />
      ))}
    </>
  );
};

export default OverflowEmojiManager; 