import React from 'react';
import { useThree } from '@react-three/fiber';
import Scale from '../../Scale'; // Adjusted path

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

export default ScaledScene; 