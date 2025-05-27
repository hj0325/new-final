import React from 'react';
import ScaleEmoji3D from './ScaleEmoji3D';

function ScaleEmojis({ leftCount = 0, rightCount = 0, leftEmojiType = '😀', rightEmojiType = '😀' }) {
  // 저울 날개 위치 설정
  const SCALE_WING_Y = 0.3; // 저울 날개 바구니 바닥 높이 (큰 이모티콘용)
  const LEFT_WING_X = -1.8; // 좌측 날개 중심
  const RIGHT_WING_X = 1.8; // 우측 날개 중심
  const EMOJI_SPACING = 0.3; // 이모티콘 간격 (크기에 맞게 조정)
  const EMOJI_SCALE = 2.5; // 이모티콘 크기 (하단 이모티콘과 동일하게)

  // 좌측 이모티콘들 생성
  const leftEmojis = [];
  for (let i = 0; i < leftCount; i++) {
    let x, z, y;
    
    if (leftCount === 1) {
      // 1개일 때는 중앙에 배치
      x = LEFT_WING_X;
      z = 0;
      y = SCALE_WING_Y;
    } else if (leftCount === 2) {
      // 2개일 때는 앞뒤로 배치
      x = LEFT_WING_X;
      z = (i === 0) ? -0.1 : 0.1;
      y = SCALE_WING_Y;
    } else if (leftCount <= 4) {
      // 4개 이하일 때는 일렬로 배치 (큰 이모티콘용)
      const spacing = EMOJI_SPACING * 0.3; // 더 좁은 간격
      const startX = LEFT_WING_X - ((leftCount - 1) * spacing) / 2;
      x = startX + i * spacing;
      z = (i % 2) * 0.1 - 0.05; // 바구니 안쪽으로
      y = SCALE_WING_Y + (i % 2) * 0.05;
    } else {
      // 5개 이상일 때는 원형으로 배치 (큰 이모티콘용)
      const angle = (i / leftCount) * Math.PI * 2;
      const radius = Math.min(0.2, leftCount * 0.03); // 바구니 크기에 맞게 더 작게
      x = LEFT_WING_X + Math.cos(angle) * radius;
      z = Math.sin(angle) * radius;
      y = SCALE_WING_Y + (i % 3) * 0.03;
    }

    leftEmojis.push(
      <ScaleEmoji3D
        key={`left-${i}`}
        position={[x, y, z]}
        scale={EMOJI_SCALE}
        emojiType={leftEmojiType}
      />
    );
  }

  // 우측 이모티콘들 생성
  const rightEmojis = [];
  for (let i = 0; i < rightCount; i++) {
    let x, z, y;
    
    if (rightCount === 1) {
      // 1개일 때는 중앙에 배치
      x = RIGHT_WING_X;
      z = 0;
      y = SCALE_WING_Y;
    } else if (rightCount === 2) {
      // 2개일 때는 앞뒤로 배치
      x = RIGHT_WING_X;
      z = (i === 0) ? -0.1 : 0.1;
      y = SCALE_WING_Y;
    } else if (rightCount <= 4) {
      // 4개 이하일 때는 일렬로 배치 (큰 이모티콘용)
      const spacing = EMOJI_SPACING * 0.3; // 더 좁은 간격
      const startX = RIGHT_WING_X - ((rightCount - 1) * spacing) / 2;
      x = startX + i * spacing;
      z = (i % 2) * 0.1 - 0.05; // 바구니 안쪽으로
      y = SCALE_WING_Y + (i % 2) * 0.05;
    } else {
      // 5개 이상일 때는 원형으로 배치 (큰 이모티콘용)
      const angle = (i / rightCount) * Math.PI * 2;
      const radius = Math.min(0.2, rightCount * 0.03); // 바구니 크기에 맞게 더 작게
      x = RIGHT_WING_X + Math.cos(angle) * radius;
      z = Math.sin(angle) * radius;
      y = SCALE_WING_Y + (i % 3) * 0.03;
    }

    rightEmojis.push(
      <ScaleEmoji3D
        key={`right-${i}`}
        position={[x, y, z]}
        scale={EMOJI_SCALE}
        emojiType={rightEmojiType}
      />
    );
  }

  return (
    <group>
      {leftEmojis}
      {rightEmojis}
    </group>
  );
}

export default ScaleEmojis; 