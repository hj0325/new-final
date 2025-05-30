/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
*/

import React, { useRef } from 'react'
import { useGLTF } from '@react-three/drei'

export default function Calumn() {
  const { scene } = useGLTF('/Calumn.gltf')
  return <primitive object={scene} scale={1} position={[0, 0, 0]} />
}

useGLTF.preload('/Calumn.gltf')
