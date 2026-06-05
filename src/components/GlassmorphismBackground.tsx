'use client'

import { Suspense, useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { MeshTransmissionMaterial, Float, Environment } from '@react-three/drei'
import * as THREE from 'three'

function GlassShape({
  geometry,
  position,
  color,
  scale = 1,
  speed = 1,
}: {
  geometry: React.ReactNode
  position: [number, number, number]
  color: string
  scale?: number
  speed?: number
}) {
  const meshRef = useRef<THREE.Mesh>(null!)

  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    if (meshRef.current) {
      meshRef.current.rotation.x = time * 0.1 * speed
      meshRef.current.rotation.y = time * 0.15 * speed
    }
  })

  return (
    <Float
      speed={speed * 0.8}
      rotationIntensity={0.3}
      floatIntensity={0.5}
      floatingRange={[-0.3, 0.3]}
    >
      <mesh ref={meshRef} position={position} scale={scale}>
        {geometry}
        <MeshTransmissionMaterial
          backside
          samples={4}
          thickness={1.5}
          chromaticAberration={0.15}
          anisotropy={0.3}
          distortion={0.4}
          distortionScale={0.5}
          temporalDistortion={0.1}
          clearcoat={1}
          color={color}
          attenuationColor={color}
          attenuationDistance={2}
          ior={1.8}
          transmission={0.95}
          opacity={1}
          roughness={0.1}
        />
      </mesh>
    </Float>
  )
}

function Scene() {
  const shapes = useMemo(
    () => [
      {
        geometry: <sphereGeometry args={[1, 64, 64]} />,
        position: [-3.5, 1.5, -2] as [number, number, number],
        color: '#38bdf8',
        scale: 1.2,
        speed: 0.8,
      },
      {
        geometry: <torusKnotGeometry args={[0.6, 0.2, 128, 32]} />,
        position: [3.8, -1, -3] as [number, number, number],
        color: '#818cf8',
        scale: 1.0,
        speed: 0.6,
      },
      {
        geometry: <icosahedronGeometry args={[0.8, 0]} />,
        position: [2.5, 2.2, -1] as [number, number, number],
        color: '#c084fc',
        scale: 0.9,
        speed: 1.0,
      },
      {
        geometry: <sphereGeometry args={[1, 64, 64]} />,
        position: [-2.2, -2, -1.5] as [number, number, number],
        color: '#22d3ee',
        scale: 0.7,
        speed: 0.7,
      },
      {
        geometry: <torusGeometry args={[0.7, 0.25, 32, 64]} />,
        position: [0.5, 0, -4] as [number, number, number],
        color: '#a78bfa',
        scale: 1.1,
        speed: 0.5,
      },
    ],
    []
  )

  return (
    <>
      <color attach="background" args={['#020617']} />
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={2} color="#38bdf8" />
      <pointLight position={[-10, -10, -10]} intensity={1.5} color="#818cf8" />
      <pointLight position={[0, 5, -5]} intensity={1} color="#c084fc" />
      <Environment preset="city" />

      {shapes.map((shape, index) => (
        <GlassShape key={index} {...shape} />
      ))}
    </>
  )
}

export default function GlassmorphismBackground() {
  return (
    <div className="canvas-container">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 6], fov: 45 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  )
}
