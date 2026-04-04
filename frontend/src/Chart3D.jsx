import { Canvas, useFrame } from '@react-three/fiber'
import { Text, Html } from '@react-three/drei'
import { useMemo, useRef, useState } from 'react'

function BarChart3D({ bars = [], onSelectTopic }) {
  const groupRef = useRef()
  const [isHoveredScene, setIsHoveredScene] = useState(false)
  const [activeIndex, setActiveIndex] = useState(null)

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += isHoveredScene ? 0.006 : 0.0025
      groupRef.current.rotation.x = 0.08
    }
  })

  return (
    <group
      ref={groupRef}
      onPointerEnter={() => setIsHoveredScene(true)}
      onPointerLeave={() => {
        setIsHoveredScene(false)
        document.body.style.cursor = 'default'
      }}
    >
      {bars.map((bar, idx) => {
        const spacing = 2.3
        const x = idx * spacing - ((bars.length - 1) * spacing) / 2
        const height = Math.max(1.2, (bar.value / 100) * 5.2)
        const isActive = activeIndex === idx

        return (
          <group key={idx} position={[x, 0, 0]}>
            {/* Main bar */}
            <mesh
              position={[0, height / 2, 0]}
              scale={isActive ? [1.08, 1.05, 1.08] : [1, 1, 1]}
              onClick={(e) => {
                e.stopPropagation()
                setActiveIndex(idx)
                if (onSelectTopic) onSelectTopic(bar.fullLabel || bar.label)
              }}
              onPointerOver={(e) => {
                e.stopPropagation()
                document.body.style.cursor = 'pointer'
                setActiveIndex(idx)
              }}
              onPointerOut={(e) => {
                e.stopPropagation()
                document.body.style.cursor = 'default'
              }}
            >
              <boxGeometry args={[1.1, height, 1.1]} />
              <meshStandardMaterial
                color={bar.color}
                emissive={bar.color}
                emissiveIntensity={isActive ? 0.65 : 0.35}
                metalness={0.7}
                roughness={0.2}
              />
            </mesh>

            {/* Glow shell */}
            <mesh position={[0, height / 2, 0]}>
              <boxGeometry args={[1.25, height + 0.08, 1.25]} />
              <meshStandardMaterial
                color={bar.color}
                emissive={bar.color}
                emissiveIntensity={isActive ? 0.28 : 0.14}
                transparent
                opacity={isActive ? 0.3 : 0.18}
              />
            </mesh>

            {/* Base ring */}
            <mesh position={[0, 0.04, 0]}>
              <cylinderGeometry args={[1.25, 1.25, 0.08, 32]} />
              <meshStandardMaterial
                color={bar.color}
                emissive={bar.color}
                emissiveIntensity={0.45}
                transparent
                opacity={0.88}
              />
            </mesh>

            {/* Label below bar */}
            <Text
              position={[0, -0.45, 0]}
              fontSize={0.28}
              color="#cbd5e1"
              anchorX="center"
              anchorY="middle"
              maxWidth={2}
            >
              {bar.label}
            </Text>

            {/* Value above bar */}
            <Text
              position={[0, height + 0.45, 0]}
              fontSize={0.3}
              color={bar.color}
              anchorX="center"
              anchorY="middle"
            >
              {bar.rawCount}
            </Text>

            {/* Hover tooltip */}
            {isActive && (
              <Html position={[0, height + 1.1, 0]} center>
                <div
                  style={{
                    background: 'rgba(10, 12, 30, 0.92)',
                    color: '#fff',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    fontSize: '12px',
                    border: `1px solid ${bar.color}`,
                    boxShadow: `0 0 18px ${bar.color}55`,
                    whiteSpace: 'nowrap',
                    fontFamily: 'monospace',
                  }}
                >
                  <strong>{bar.fullLabel || bar.label}</strong>
                  <br />
                  Papers: {bar.rawCount}
                </div>
              </Html>
            )}
          </group>
        )
      })}

      {/* Ambient glow */}
      <mesh position={[0, 2.2, 0]}>
        <sphereGeometry args={[3.2, 32, 32]} />
        <meshStandardMaterial
          color="#00d4ff"
          transparent
          opacity={0.03}
          emissive="#00d4ff"
          emissiveIntensity={0.08}
        />
      </mesh>
    </group>
  )
}

export default function Chart3D({ data = [], onSelectTopic }) {
  const fallbackBars = useMemo(
    () => [
      { label: 'AI', fullLabel: 'Artificial Intelligence', value: 90, rawCount: 9, color: '#00d4ff' },
      { label: 'NLP', fullLabel: 'Natural Language Processing', value: 75, rawCount: 7, color: '#a855f7' },
      { label: 'CV', fullLabel: 'Computer Vision', value: 65, rawCount: 6, color: '#3b82f6' },
      { label: 'RL', fullLabel: 'Reinforcement Learning', value: 55, rawCount: 5, color: '#06b6d4' },
      { label: 'AGI', fullLabel: 'Artificial General Intelligence', value: 45, rawCount: 4, color: '#ec4899' },
    ],
    []
  )

  const bars = data.length > 0 ? data : fallbackBars

  return (
    <Canvas
      style={{ width: '100%', height: '100%', maxHeight: '420px' }}
      dpr={[1, 1.5]}
      camera={{ position: [0, 3, 11], fov: 48 }}
    >
      <ambientLight intensity={0.75} />
      <pointLight position={[5, 5, 5]} intensity={1.3} color="#00d4ff" />
      <pointLight position={[-5, -5, 5]} intensity={1.05} color="#a855f7" />
      <pointLight position={[0, 6, -4]} intensity={0.9} color="#3b82f6" />

      <BarChart3D bars={bars} onSelectTopic={onSelectTopic} />
    </Canvas>
  )
}