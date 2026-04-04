import { Canvas, useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'

function Document() {
  const documentRef = useRef()
  const particlesRef = useRef()

  useFrame(() => {
    if (documentRef.current) {
      documentRef.current.rotation.y += 0.003
      documentRef.current.rotation.z += 0.001
    }
    if (particlesRef.current) {
      particlesRef.current.rotation.z += 0.002
    }
  })

  return (
    <group>
      {/* Floating Document */}
      <group ref={documentRef}>
        {/* Pages */}
        <mesh position={[0, 0.05, 0]}>
          <boxGeometry args={[2, 2.5, 0.1]} />
          <meshStandardMaterial
            color="#00d4ff"
            emissive="#00d4ff"
            emissiveIntensity={0.5}
            metalness={0.7}
            roughness={0.1}
            wireframe={true}
          />
        </mesh>

        {/* Document back */}
        <mesh position={[0, 0.05, -0.15]}>
          <boxGeometry args={[2, 2.5, 0.05]} />
          <meshStandardMaterial
            color="#a855f7"
            emissive="#a855f7"
            emissiveIntensity={0.3}
            metalness={0.6}
            roughness={0.2}
          />
        </mesh>

        {/* Accent lines */}
        {[0, 0.5, 1, 1.5].map((y) => (
          <mesh key={y} position={[0, y, 0.06]}>
            <boxGeometry args={[1.8, 0.05, 0.02]} />
            <meshStandardMaterial
              color="#3b82f6"
              emissive="#3b82f6"
              emissiveIntensity={0.6}
            />
          </mesh>
        ))}
      </group>

      {/* Orbiting particles */}
      <group ref={particlesRef}>
        {[...Array(12)].map((_, i) => {
          const angle = (i / 12) * Math.PI * 2
          const x = Math.cos(angle) * 3
          const z = Math.sin(angle) * 3
          return (
            <mesh key={i} position={[x, Math.sin(angle) * 0.5, z]}>
              <sphereGeometry args={[0.1, 8, 8]} />
              <meshStandardMaterial
                color={i % 2 === 0 ? '#00d4ff' : '#a855f7'}
                emissive={i % 2 === 0 ? '#00d4ff' : '#a855f7'}
                emissiveIntensity={0.8}
              />
            </mesh>
          )
        })}
      </group>

      {/* Central glow */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[2.5, 32, 32]} />
        <meshStandardMaterial
          color="#00d4ff"
          transparent={true}
          opacity={0.1}
          emissive="#00d4ff"
          emissiveIntensity={0.2}
        />
      </mesh>
    </group>
  )
}

export default function HolographicDoc() {
  return (
    <Canvas
      style={{
        width: '100%',
        height: '100%',
      }}
      dpr={[1, 2]}
      camera={{ position: [0, 0, 6], fov: 50 }}
    >
      <ambientLight intensity={0.8} />
      <pointLight position={[3, 3, 3]} intensity={1.5} color="#00d4ff" />
      <pointLight position={[-3, -3, 3]} intensity={1.2} color="#a855f7" />

      <Document />
    </Canvas>
  )
}
