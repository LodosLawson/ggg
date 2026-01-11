import { usePlane } from '@react-three/cannon';
import { useRef, useMemo } from 'react';
import { useStore } from '../../store/gameStore';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// export function Planet({ radius = 20 }: PlanetProps) { // radius unused
export function Planet() {
    const [ref] = usePlane(() => ({
        rotation: [-Math.PI / 2, 0, 0],
        position: [0, 0, 0],
        type: 'Static'
    }));

    const { worldHealth } = useStore(); // damageWorld unused
    const coreRef = useRef<THREE.Mesh>(null);

    // Calculate health percentage
    const healthPercent = worldHealth / 1000000;
    const isDestroyed = worldHealth <= 0;
    const isCritical = healthPercent < 0.3;

    // Generate random cracks based on damage
    const cracks = useMemo(() => {
        const crackCount = Math.floor((1 - healthPercent) * 20);
        return Array.from({ length: crackCount }, () => ({
            x: (Math.random() - 0.5) * 80,
            z: (Math.random() - 0.5) * 80,
            rotation: Math.random() * Math.PI,
            scale: 0.5 + Math.random() * 1.5
        }));
    }, [Math.floor(healthPercent * 10)]); // Update every 10% damage

    // Pulsing core effect
    useFrame((state) => {
        if (coreRef.current && isCritical) {
            const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.5 + 0.5;
            coreRef.current.scale.setScalar(1 + pulse * 0.3);
        }
    });

    // Auto damage for testing (remove in production)
    // useFrame(() => {
    //     if (worldHealth > 0 && Math.random() < 0.001) {
    //         damageWorld(100);
    //     }
    // });

    return (
        <group>
            {/* The main ground */}
            {!isDestroyed && (
                <mesh ref={ref as any} receiveShadow>
                    <planeGeometry args={[100, 100]} />
                    <meshStandardMaterial
                        color={
                            healthPercent > 0.7 ? "#4ead4e" :
                                healthPercent > 0.4 ? "#8b7d3a" :
                                    healthPercent > 0.2 ? "#8b4513" :
                                        "#4a2511"
                        }
                        roughness={1}
                    />
                </mesh>
            )}

            {/* Cracks and damage visualization */}
            {!isDestroyed && cracks.map((crack, idx) => (
                <mesh
                    key={idx}
                    position={[crack.x, 0.05, crack.z]}
                    rotation={[-Math.PI / 2, 0, crack.rotation]}
                    receiveShadow
                >
                    <planeGeometry args={[crack.scale * 4, crack.scale * 0.5]} />
                    <meshStandardMaterial
                        color="#1a1a1a"
                        emissive={isCritical ? "#ff3300" : "#000000"}
                        emissiveIntensity={isCritical ? 0.5 : 0}
                    />
                </mesh>
            ))}

            {/* Voxel decorations */}
            {!isDestroyed && (
                <>
                    <VoxelChunk position={[-10, 0, -10]} color="#5e4e3e" />
                    <VoxelChunk position={[10, 0, 5]} color="#5e4e3e" />
                    <VoxelChunk position={[-15, 0, 8]} color="#6e5e4e" />
                </>
            )}

            {/* Core Magma (only visible if destroyed or via cracks) */}
            <mesh ref={coreRef} position={[0, isDestroyed ? 0 : -5, 0]}>
                <sphereGeometry args={[isDestroyed ? 50 : (isCritical ? 15 : 10)]} />
                <meshStandardMaterial
                    color={isDestroyed || isCritical ? "#ff2200" : "#333"}
                    emissive={isDestroyed || isCritical ? "#ff0000" : "#000"}
                    emissiveIntensity={isDestroyed ? 3 : isCritical ? 1.5 : 0}
                />
            </mesh>

            {/* Destruction particles */}
            {isDestroyed && <DestructionParticles />}
        </group>
    );
}

function VoxelChunk({ position, color }: { position: [number, number, number], color: string }) {
    return (
        <group position={position}>
            <mesh position={[0, 0.5, 0]} castShadow>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color={color} />
            </mesh>
            <mesh position={[0, 1.5, 0]} castShadow>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color={color} />
            </mesh>
        </group>
    );
}

function DestructionParticles() {
    const particlesRef = useRef<THREE.Points>(null);

    const particles = useMemo(() => {
        const count = 200;
        const positions = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 100;
            positions[i * 3 + 1] = Math.random() * 50;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
        }

        return positions;
    }, []);

    useFrame(() => {
        if (particlesRef.current) {
            particlesRef.current.rotation.y += 0.001;
            // Float particles upward
            const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
            for (let i = 0; i < positions.length; i += 3) {
                positions[i + 1] += 0.1;
                if (positions[i + 1] > 100) positions[i + 1] = 0;
            }
            particlesRef.current.geometry.attributes.position.needsUpdate = true;
        }
    });

    return (
        <points ref={particlesRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={particles.length / 3}
                    array={particles}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.5}
                color="#ff4400"
            />
        </points>
    );
}
