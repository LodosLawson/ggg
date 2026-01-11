import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Stars, Float, Text, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface GalaxySceneProps {
    onSelectPlanet: (data: any) => void;
}

export function GalaxyScene({ onSelectPlanet }: GalaxySceneProps) {
    const sunRef = useRef<THREE.Group>(null);
    const planetRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (sunRef.current) {
            sunRef.current.rotation.y += 0.001;
        }
        if (planetRef.current) {
            const time = state.clock.getElapsedTime();
            // Orbit logic - adjusted to keep planet more visible
            const orbitRadius = 20;
            planetRef.current.position.x = Math.sin(time * 0.3) * orbitRadius;
            planetRef.current.position.z = Math.cos(time * 0.3) * orbitRadius;
            planetRef.current.position.y = Math.sin(time * 0.15) * 3; // Slight vertical orbit
            planetRef.current.rotation.y += 0.01;
        }
    });

    return (
        <>
            <ambientLight intensity={0.2} />
            <pointLight position={[0, 0, 0]} intensity={2} color="#ffaa00" distance={100} decay={2} />
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

            {/* The Sun */}
            <group ref={sunRef}>
                <mesh>
                    <sphereGeometry args={[4, 32, 32]} />
                    <meshStandardMaterial emissive="#ffdd00" emissiveIntensity={2} color="#ffaa00" />
                </mesh>
                <pointLight intensity={5} />
            </group>

            {/* Orbiting Planet (The Game World) */}
            <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
                <group
                    position={[20, 0, 0]}
                    onClick={() => onSelectPlanet({ type: 'terran' })}
                    onPointerOver={() => document.body.style.cursor = 'pointer'}
                    onPointerOut={() => document.body.style.cursor = 'auto'}
                >
                    <mesh ref={planetRef}>
                        <sphereGeometry args={[3, 24, 24]} /> {/* Larger, smoother sphere */}
                        <meshStandardMaterial
                            color="#44aaee"
                            roughness={0.7}
                            metalness={0.2}
                            emissive="#224477"
                            emissiveIntensity={0.3}
                            flatShading
                        />
                    </mesh>
                    {/* Atmospheric glow */}
                    <mesh scale={1.1}>
                        <sphereGeometry args={[3, 24, 24]} />
                        <meshBasicMaterial color="#44aaee" transparent opacity={0.1} />
                    </mesh>
                    <Text
                        position={[0, 4, 0]}
                        fontSize={1.2}
                        color="white"
                        anchorX="center"
                        anchorY="middle"
                    >
                        Genesis World
                    </Text>
                </group>
            </Float>

            {/* Background Planets (Visual only) */}
            <mesh position={[-20, 5, -20]}>
                <sphereGeometry args={[1.5, 16, 16]} />
                <meshStandardMaterial color="#aa4444" roughness={0.9} flatShading />
            </mesh>

            <OrbitControls
                enablePan={false}
                maxDistance={50}
                minDistance={5}
                autoRotate
                autoRotateSpeed={0.5}
            />
        </>
    );
}
