import { memo, useRef, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useTheme } from './hooks/useTheme'
import './Background3D.css'

// Low-poly floating geometry component
const FloatingGeometry = memo(({ position, scale, speed, color, geometry }) => {
  const meshRef = useRef()
  const timeOffsetRef = useRef(Math.random() * Math.PI * 2)

  useFrame(({ clock }) => {
    if (!meshRef.current) return

    // Slow floating movement in Y axis
    const time = clock.getElapsedTime() + timeOffsetRef.current
    meshRef.current.position.y = position[1] + Math.sin(time * speed) * 0.5

    // Very slow rotation
    meshRef.current.rotation.x += 0.0002
    meshRef.current.rotation.y += 0.0003
    meshRef.current.rotation.z += 0.00015
  })

  const materialColor = new THREE.Color(color)

  return (
    <mesh
      ref={meshRef}
      position={position}
      scale={scale}
      geometry={geometry}
      castShadow
      receiveShadow
    >
      <meshPhongMaterial
        color={materialColor}
        emissive={new THREE.Color(color)}
        emissiveIntensity={0.3}
        wireframe={false}
        opacity={0.7}
        transparent
        shininess={100}
      />
    </mesh>
  )
})

FloatingGeometry.displayName = 'FloatingGeometry'

// 3D Scene Component
function Background3DScene({ isDarkMode }) {
  const ambientLightRef = useRef()
  const point1Ref = useRef()
  const point2Ref = useRef()

  // Theme-aware colors
  const themeColors = {
    dark: {
      color1: '#00d4ff',
      color2: '#a855f7',
      color3: '#3b82f6',
      color4: '#06b6d4',
    },
    light: {
      color1: '#0087be',
      color2: '#7c3aed',
      color3: '#2563eb',
      color4: '#0891b2',
    },
  }

  const colors = isDarkMode ? themeColors.dark : themeColors.light

  // Pre-create reusable geometries to optimize memory
  const geometries = useMemo(() => {
    return {
      tetrahedron: new THREE.TetrahedronGeometry(0.8, 0),
      octahedron: new THREE.OctahedronGeometry(0.7, 0),
      icosahedron: new THREE.IcosahedronGeometry(0.6, 0),
    }
  }, [])

  // Pre-define floating elements
  const floatingElements = useMemo(() => {
    return [
      {
        position: [-3, 2, -4],
        scale: 0.6,
        speed: 0.3,
        color: colors.color1,
        geometry: geometries.tetrahedron,
      },
      {
        position: [4, 3, -5],
        scale: 0.8,
        speed: 0.25,
        color: colors.color2,
        geometry: geometries.octahedron,
      },
      {
        position: [0, -2, -4],
        scale: 0.5,
        speed: 0.35,
        color: colors.color3,
        geometry: geometries.icosahedron,
      },
      {
        position: [-4, -1, -3],
        scale: 0.7,
        speed: 0.28,
        color: colors.color4,
        geometry: geometries.tetrahedron,
      },
      {
        position: [3, 0, -5],
        scale: 0.65,
        speed: 0.32,
        color: colors.color2,
        geometry: geometries.octahedron,
      },
    ]
  }, [geometries, colors])

  // Animate point lights slowly
  useFrame(({ clock }) => {
    if (point1Ref.current) {
      point1Ref.current.position.x = Math.sin(clock.getElapsedTime() * 0.2) * 3
      point1Ref.current.position.z = Math.cos(clock.getElapsedTime() * 0.15) * 3
    }

    if (point2Ref.current) {
      point2Ref.current.position.x = Math.cos(clock.getElapsedTime() * 0.18) * -3
      point2Ref.current.position.z = Math.sin(clock.getElapsedTime() * 0.22) * -3
    }
  })

  return (
    <>
      {/* Soft ambient lighting */}
      <ambientLight ref={ambientLightRef} intensity={0.5} color="#ffffff" />

      {/* Dynamic point light 1 - Theme Color 1 */}
      <pointLight
        ref={point1Ref}
        position={[3, 2, 2]}
        intensity={0.6}
        color={colors.color1}
        distance={20}
        decay={1.5}
      />

      {/* Dynamic point light 2 - Theme Color 2 */}
      <pointLight
        ref={point2Ref}
        position={[-3, 1, -2]}
        intensity={0.5}
        color={colors.color2}
        distance={20}
        decay={1.5}
      />

      {/* Soft directional light for overall illumination */}
      <directionalLight position={[5, 5, 5]} intensity={0.3} color="#ffffff" />

      {/* Render all floating geometries */}
      {floatingElements.map((element, index) => (
        <FloatingGeometry key={index} {...element} />
      ))}
    </>
  )
}

// Main Background3D Component
function Background3D() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const { theme } = useTheme()
  const isDarkMode = theme === 'dark'

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="background-3d-container">
      <Canvas
        className="background-3d-canvas"
        camera={{
          position: [0, 0, 8],
          fov: isMobile ? 50 : 45,
          near: 0.1,
          far: 1000,
        }}
        dpr={[1, isMobile ? 1 : 2]} // Lower DPR on mobile for performance
        gl={{
          antialias: true,
          alpha: true,
          stencil: false,
          depth: true,
          powerPreference: 'high-performance',
        }}
        style={{ pointerEvents: 'none' }}
      >
        <Background3DScene isDarkMode={isDarkMode} />
      </Canvas>
    </div>
  )
}

export default memo(Background3D)
