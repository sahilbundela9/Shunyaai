//dataorb
import { Canvas, useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'

function RotatingOrb() {
  const orbRef = useRef()
  const particlesRef = useRef()

  useFrame(() => {
    if (orbRef.current) {
      orbRef.current.rotation.x += 0.003
      orbRef.current.rotation.y += 0.005
      orbRef.current.rotation.z += 0.002
    }
    if (particlesRef.current) {
      particlesRef.current.rotation.x -= 0.001
      particlesRef.current.rotation.y -= 0.002
    }
  })

  return (
    <group>
      {/* Outer rotating ring */}
      <group ref={orbRef}>
        <mesh>
          <torusGeometry args={[1.2, 0.1, 16, 100]} />
          <meshStandardMaterial
            color="#00d4ff"
            emissive="#00d4ff"
            emissiveIntensity={0.6}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
      </group>

      {/* Inner sphere */}
      <mesh ref={orbRef}>
        <icosahedronGeometry args={[0.6, 3]} />
        <meshStandardMaterial
          color="#a855f7"
          emissive="#a855f7"
          emissiveIntensity={0.5}
          metalness={0.9}
          roughness={0.1}
          wireframe={false}
        />
      </mesh>

      {/* Orbiting particles */}
      <group ref={particlesRef}>
        {[...Array(8)].map((_, i) => {
          const angle = (i / 8) * Math.PI * 2
          const x = Math.cos(angle) * 1.5
          const z = Math.sin(angle) * 1.5
          return (
            <mesh key={i} position={[x, 0, z]}>
              <sphereGeometry args={[0.08, 8, 8]} />
              <meshStandardMaterial
                color={i % 2 === 0 ? '#00d4ff' : '#3b82f6'}
                emissive={i % 2 === 0 ? '#00d4ff' : '#3b82f6'}
                emissiveIntensity={0.8}
              />
            </mesh>
          )
        })}
      </group>
    </group>
  )
}

export default function DataOrb() {
  return (
    <Canvas
      style={{
        width: '100%',
        height: '100%',
      }}
      dpr={[1, 2]}
      camera={{ position: [0, 0, 3], fov: 50 }}
    >
      <ambientLight intensity={0.7} />
      <pointLight position={[2, 2, 2]} intensity={1.2} color="#00d4ff" />
      <pointLight position={[-2, -2, 2]} intensity={0.8} color="#a855f7" />

      <RotatingOrb />
    </Canvas>
  )
}
