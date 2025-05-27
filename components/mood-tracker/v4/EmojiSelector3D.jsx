import React from 'react';
import Emoji3D from './Emoji3D';
import { useControls } from 'leva';
import * as THREE from 'three'; // THREE.MathUtils.degToRad 사용을 위해 import

const EMOTION_MODEL_PATHS = [
  { path: '/models/emotion1.gltf', id: 'joy' },      // 😀
  { path: '/models/emotion2.gltf', id: 'surprise' }, // 😮
  { path: '/models/emotion3.gltf', id: 'neutral' },  // 😐
  { path: '/models/emotion4.gltf', id: 'sadness' },  // 😖 (assuming this maps to a sad/distress model)
  { path: '/models/emotion5.gltf', id: 'anger' },    // 😠
];

function EmojiSelector3D({ onEmojiClick }) {
  const { 
    emojiScale, 
    emojiYPosition, // 이 변수가 전체 이모지 그룹의 Y축 (수직) 위치를 담당합니다.
    emojiZPosition, 
    emojiSpacing, 
    groupRotationX,
    groupRotationY,
    groupRotationZ 
  } = useControls('Emoji Settings', {
    emojiScale: { value: 0.93, min: 0.1, max: 3, step: 0.01, label: '크기' },
    emojiYPosition: { value: 0.3, min: -5, max: 5, step: 0.1, label: '수직 위치 (전체 그룹)' },
    emojiZPosition: { value: 4.7, min: -5, max: 10, step: 0.1, label: '깊이 위치 (Z축)' },
    emojiSpacing: { value: 0.10, min: 0.1, max: 5, step: 0.05, label: '좌우 간격' },
    groupRotationX: { value: -23, min: -180, max: 180, step: 1, label: '그룹 X축 회전 (각도)' },
    groupRotationY: { value: 0, min: -180, max: 180, step: 1, label: '그룹 Y축 회전 (각도)' },
    groupRotationZ: { value: 0, min: -180, max: 180, step: 1, label: '그룹 Z축 회전 (각도)' },
  });

  const totalWidth = (EMOTION_MODEL_PATHS.length - 1) * emojiSpacing;
  const startX = -totalWidth / 2;

  return (
    <group 
      rotation={[
        THREE.MathUtils.degToRad(groupRotationX),
        THREE.MathUtils.degToRad(groupRotationY),
        THREE.MathUtils.degToRad(groupRotationZ),
      ]}
    >
      {EMOTION_MODEL_PATHS.map((emoji, index) => (
        <Emoji3D
          key={emoji.id}
          emojiId={emoji.id}
          modelPath={emoji.path}
          initialPosition={[
            startX + index * emojiSpacing, 
            emojiYPosition, // 여기에서 수직 위치가 적용됩니다.
            emojiZPosition
          ]}
          scale={emojiScale}
          onClick={onEmojiClick}
        />
      ))}
    </group>
  );
}

export default EmojiSelector3D; 