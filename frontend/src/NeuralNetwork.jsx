import { Canvas, useFrame } from '@react-three/fiber'
import { useRef, useMemo, useEffect } from 'react'
import * as THREE from 'three'
import { useTheme } from './hooks/useTheme'

function NeuralNetworkVisualization({ isDarkMode }) {
  const groupRef = useRef()
  const pointsRef = useRef([])
  const linesRef = useRef()

  // Theme-aware colors
  const colors = isDarkMode
    ? { line: '#00d4ff', point: '#00d4ff', glow: '#a855f7' }
    : { line: '#0087be', point: '#0087be', glow: '#7c3aed' }

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.x += 0.0003
      groupRef.current.rotation.y += 0.0005
      groupRef.current.rotation.z += 0.0002
    }
  })

  useEffect(() => {
    if (!linesRef.current) return

    // Animate connections
    const lines = linesRef.current
    let time = 0

    const animate = () => {
      time += 0.01
      const positionAttribute = lines.geometry.getAttribute('position')

      // Create flowing effect along connections
      const data = positionAttribute.array
      for (let i = 0; i < data.length; i += 3) {
        // Create wave effect
        const wave = Math.sin(time + i * 0.1) * 0.02
        positionAttribute.needsUpdate = true
      }

      requestAnimationFrame(animate)
    }

    animate()
  }, [])

  // Create neural network nodes
  const { nodes, connections } = useMemo(() => {
    const nodes = []
    const connections = []

    // Create nodes in spherical arrangement
    const layers = 5
    const nodesPerLayer = 8

    for (let layer = 0; layer < layers; layer++) {
      const radius = 1.5 + layer * 0.5
      const nodeCount = nodesPerLayer + layer * 2

      for (let i = 0; i < nodeCount; i++) {
        const angle = (i / nodeCount) * Math.PI * 2
        const y = (layer / layers) * 3 - 1.5

        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius

        nodes.push({ position: [x, y, z], layer, index: i })

        // Connect to next layer
        if (layer < layers - 1) {
          const nextLayerCount = nodesPerLayer + (layer + 1) * 2
          for (let j = 0; j < Math.min(3, nextLayerCount); j++) {
            const nextIndex = (i + j) % nextLayerCount
            const nextLayer = layer + 1
            const nextRadius = 1.5 + nextLayer * 0.5
            const nextAngle = (nextIndex / nextLayerCount) * Math.PI * 2

            const nextX = Math.cos(nextAngle) * nextRadius
            const nextY = (nextLayer / layers) * 3 - 1.5
            const nextZ = Math.sin(nextAngle) * nextRadius

            connections.push({
              start: nodes.length - 1,
              end: nodes.length,
              startPos: [x, y, z],
              endPos: [nextX, nextY, nextZ],
            })
          }
        }
      }
    }

    return { nodes, connections }
  }, [])

  // Create geometry for nodes
  const nodePositions = useMemo(
    () => new Float32Array(nodes.flatMap((n) => n.position)),
    [nodes]
  )

  // Create line geometry
  const linePositions = useMemo(() => {
    const positions = []
    connections.forEach((conn) => {
      const start = nodes[conn.start]?.position || [0, 0, 0]
      const end = nodes[conn.start + 1]?.position || [0, 0, 0]

      if (start && end) {
        positions.push(...start, ...end)
      }
    })
    return new Float32Array(positions)
  }, [connections, nodes])

  return (
    <group ref={groupRef}>
      {/* Connection lines */}
      <lineSegments>
        <bufferGeometry attach="geometry">
          <bufferAttribute
            attach="attributes-position"
            array={linePositions}
            count={linePositions.length / 3}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color={colors.line}
          transparent={true}
          opacity={0.3}
          linewidth={1}
        />
      </lineSegments>

      {/* Node points */}
      <points>
        <bufferGeometry attach="geometry">
          <bufferAttribute
            attach="attributes-position"
            array={nodePositions}
            count={nodePositions.length / 3}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.15}
          color={colors.point}
          sizeAttenuation={true}
          transparent={true}
        />
      </points>

      {/* Glowing nodes */}
      <points>
        <bufferGeometry attach="geometry">
          <bufferAttribute
            attach="attributes-position"
            array={nodePositions}
            count={nodePositions.length / 3}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.25}
          color={colors.glow}
          sizeAttenuation={true}
          transparent={true}
          opacity={0.4}
        />
      </points>

      {/* Rotating central sphere */}
      <mesh position={[0, 0, 0]}>
        <icosahedronGeometry args={[0.5, 4]} />
        <meshStandardMaterial
          color={colors.line}
          emissive={colors.line}
          emissiveIntensity={0.8}
          metalness={0.8}
          roughness={0.1}
          wireframe={true}
        />
      </mesh>
    </group>
  )
}

export default function NeuralNetworkCanvas() {
  const { theme } = useTheme()
  const isDarkMode = theme === 'dark'

  const fogColor = isDarkMode ? '#0f0f1e' : '#f5f5f7'
  const lightColor1 = isDarkMode ? '#00d4ff' : '#0087be'
  const lightColor2 = isDarkMode ? '#a855f7' : '#7c3aed'
  const lightColor3 = isDarkMode ? '#3b82f6' : '#2563eb'

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
      camera={{ position: [0, 0, 6], fov: 50 }}
    >
      <ambientLight intensity={0.6} />
      <pointLight position={[5, 5, 5]} intensity={1.5} color={lightColor1} />
      <pointLight position={[-5, -5, 5]} intensity={1} color={lightColor2} />
      <pointLight position={[0, 0, -5]} intensity={0.8} color={lightColor3} />

      <NeuralNetworkVisualization isDarkMode={isDarkMode} />

      <fog attach="fog" args={[fogColor, 2, 15]} />
    </Canvas>
  )
}
