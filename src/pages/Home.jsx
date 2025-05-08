import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import { Suspense, useState } from 'react'
import Ax from '../components/Ax'
import Calumn from '../components/Calumn'

function Scene() {
  const [isAxHovered, setIsAxHovered] = useState(false)

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <Ax isHovered={isAxHovered} onHover={setIsAxHovered} />
      <Calumn />
      <OrbitControls />
    </>
  )
}

export default function Home() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas camera={{ position: [0, 2, 5] }}>
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  )
} 