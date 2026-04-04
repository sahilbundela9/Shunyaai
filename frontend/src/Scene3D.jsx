import { Canvas, useFrame } from '@react-three/fiber'
import { useRef, useEffect } from 'react'
import * as THREE from 'three'


function RotatingCube() {
  const cubeRef = useRef()

  useFrame(() => {
    if (cubeRef.current) {
      cubeRef.current.rotation.x += 0.005
      cubeRef.current.rotation.y += 0.01
    }
  })

  return (
    <mesh ref={cubeRef}>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial
        color="#00d4ff"
        emissive="#00d4ff"
        emissiveIntensity={0.4}
        metalness={0.8}
        roughness={0.2}
      />
    </mesh>
  )
}

function FloatingOrb() {
  const orbRef = useRef()
  const timeRef = useRef(0)

  useFrame(() => {
    if (orbRef.current) {
      timeRef.current += 0.01
      orbRef.current.position.y = Math.sin(timeRef.current) * 0.5
      orbRef.current.position.x = Math.cos(timeRef.current * 0.7) * 0.8
      orbRef.current.rotation.x += 0.002
    }
  })

  return (
    <mesh ref={orbRef} position={[0, 0, -3]}>
      <sphereGeometry args={[1, 64, 64]} />
      <meshStandardMaterial
        color="#a855f7"
        emissive="#a855f7"
        emissiveIntensity={0.6}
        metalness={0.7}
        roughness={0.1}
      />
    </mesh>
  )
}

function CameraController() {
  useFrame(({ camera }) => {
    camera.position.x = Math.sin(Date.now() * 0.0001) * 2
    camera.position.z = 8 + Math.cos(Date.now() * 0.00005)
    camera.lookAt(0, 0, 0)
  })

  return null
}

export default function Scene3D() {
  return (
    <Canvas
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
      }}
      dpr={[1, 2]}
      camera={{ position: [0, 0, 8], fov: 75 }}
    >
      <CameraController />

      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#00d4ff" />
      <pointLight position={[-10, -10, 10]} intensity={0.8} color="#a855f7" />
      <pointLight position={[0, 0, 5]} intensity={0.6} color="#3b82f6" />

      <RotatingCube />
      <FloatingOrb />

      <fog attach="fog" args={['#0f0f1e', 5, 20]} />
    </Canvas>
  )
}
