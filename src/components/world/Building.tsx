import { useStore } from '../../store/gameStore';
import type { Era } from '../../store/gameStore';

interface BuildingProps {
    position: [number, number, number];
    era: Era;
    type?: 'primary' | 'secondary';
}

export function Building({ position, era, type = 'primary' }: BuildingProps) {
    const currentEra = useStore((state) => state.currentEra);
    const isVisible = getEraIndex(currentEra) >= getEraIndex(era);

    if (!isVisible) return null;

    return (
        <group position={position}>
            {era === 'PRIMITIVE' && <PrimitiveBuilding type={type} />}
            {era === 'ANCIENT' && <AncientBuilding type={type} />}
            {era === 'INDUSTRIAL' && <IndustrialBuilding type={type} />}
            {era === 'FUTURISTIC' && <FuturisticBuilding type={type} />}
        </group>
    );
}

function getEraIndex(era: Era): number {
    const eras: Era[] = ['PRIMITIVE', 'ANCIENT', 'INDUSTRIAL', 'FUTURISTIC'];
    return eras.indexOf(era);
}

// PRIMITIVE ERA - Wooden huts and stone structures
function PrimitiveBuilding({ type }: { type: 'primary' | 'secondary' }) {
    if (type === 'primary') {
        // Wooden hut
        return (
            <group>
                {/* Base */}
                <mesh position={[0, 0.5, 0]} castShadow>
                    <boxGeometry args={[3, 1, 3]} />
                    <meshStandardMaterial color="#8B4513" roughness={0.9} />
                </mesh>
                {/* Roof */}
                <mesh position={[0, 1.5, 0]} castShadow>
                    <coneGeometry args={[2.2, 1.5, 4]} />
                    <meshStandardMaterial color="#654321" roughness={1} />
                </mesh>
                {/* Door */}
                <mesh position={[0, 0.5, 1.51]}>
                    <boxGeometry args={[0.6, 0.8, 0.1]} />
                    <meshStandardMaterial color="#3d2817" />
                </mesh>
            </group>
        );
    } else {
        // Stone circle
        return (
            <group>
                {[0, 1, 2, 3, 4, 5].map((i) => {
                    const angle = (i / 6) * Math.PI * 2;
                    const x = Math.cos(angle) * 2;
                    const z = Math.sin(angle) * 2;
                    return (
                        <mesh key={i} position={[x, 0.75, z]} castShadow>
                            <boxGeometry args={[0.5, 1.5, 0.5]} />
                            <meshStandardMaterial color="#808080" roughness={1} />
                        </mesh>
                    );
                })}
            </group>
        );
    }
}

// ANCIENT ERA - Stone temples and pyramids
function AncientBuilding({ type }: { type: 'primary' | 'secondary' }) {
    if (type === 'primary') {
        // Small pyramid
        return (
            <group>
                {/* Base layers */}
                <mesh position={[0, 0.25, 0]} castShadow>
                    <boxGeometry args={[4, 0.5, 4]} />
                    <meshStandardMaterial color="#C2B280" roughness={0.9} />
                </mesh>
                <mesh position={[0, 0.75, 0]} castShadow>
                    <boxGeometry args={[3, 0.5, 3]} />
                    <meshStandardMaterial color="#D3BC8D" roughness={0.9} />
                </mesh>
                {/* Top pyramid */}
                <mesh position={[0, 2, 0]} castShadow>
                    <coneGeometry args={[1.5, 2.5, 4]} />
                    <meshStandardMaterial color="#E4D5B7" roughness={0.9} />
                </mesh>
            </group>
        );
    } else {
        // Stone pillars
        return (
            <group>
                <mesh position={[-1, 1, 0]} castShadow>
                    <cylinderGeometry args={[0.3, 0.3, 2, 8]} />
                    <meshStandardMaterial color="#A9A9A9" roughness={0.9} />
                </mesh>
                <mesh position={[1, 1, 0]} castShadow>
                    <cylinderGeometry args={[0.3, 0.3, 2, 8]} />
                    <meshStandardMaterial color="#A9A9A9" roughness={0.9} />
                </mesh>
                {/* Top beam */}
                <mesh position={[0, 2.2, 0]} castShadow>
                    <boxGeometry args={[2.5, 0.4, 0.4]} />
                    <meshStandardMaterial color="#A9A9A9" roughness={0.9} />
                </mesh>
            </group>
        );
    }
}

// INDUSTRIAL ERA - Factories and smokestacks
function IndustrialBuilding({ type }: { type: 'primary' | 'secondary' }) {
    if (type === 'primary') {
        // Factory building
        return (
            <group>
                {/* Main building */}
                <mesh position={[0, 1, 0]} castShadow>
                    <boxGeometry args={[4, 2, 3]} />
                    <meshStandardMaterial color="#4A4A4A" roughness={0.7} metalness={0.3} />
                </mesh>
                {/* Roof */}
                <mesh position={[0, 2.3, 0]} castShadow>
                    <boxGeometry args={[4.2, 0.3, 3.2]} />
                    <meshStandardMaterial color="#2F2F2F" roughness={0.8} />
                </mesh>
                {/* Windows */}
                <mesh position={[0, 1.2, 1.51]}>
                    <boxGeometry args={[0.6, 0.4, 0.05]} />
                    <meshStandardMaterial color="#87CEEB" emissive="#4A90A4" emissiveIntensity={0.2} />
                </mesh>
                <mesh position={[1, 1.2, 1.51]}>
                    <boxGeometry args={[0.6, 0.4, 0.05]} />
                    <meshStandardMaterial color="#87CEEB" emissive="#4A90A4" emissiveIntensity={0.2} />
                </mesh>
            </group>
        );
    } else {
        // Smokestack
        return (
            <group>
                <mesh position={[0, 1.5, 0]} castShadow>
                    <cylinderGeometry args={[0.4, 0.5, 3, 8]} />
                    <meshStandardMaterial color="#696969" roughness={0.8} metalness={0.2} />
                </mesh>
                {/* Smoke particle hint */}
                <mesh position={[0, 3.2, 0]}>
                    <sphereGeometry args={[0.3, 8, 8]} />
                    <meshBasicMaterial color="#555555" transparent opacity={0.3} />
                </mesh>
            </group>
        );
    }
}

// FUTURISTIC ERA - Glass towers and energy domes
function FuturisticBuilding({ type }: { type: 'primary' | 'secondary' }) {
    if (type === 'primary') {
        // Glass tower
        return (
            <group>
                {/* Base */}
                <mesh position={[0, 0.2, 0]} castShadow>
                    <boxGeometry args={[3, 0.4, 3]} />
                    <meshStandardMaterial color="#1E1E1E" roughness={0.3} metalness={0.8} />
                </mesh>
                {/* Tower */}
                <mesh position={[0, 2, 0]} castShadow>
                    <boxGeometry args={[2, 3.5, 2]} />
                    <meshStandardMaterial
                        color="#4ECDC4"
                        roughness={0.1}
                        metalness={0.9}
                        transparent
                        opacity={0.7}
                        emissive="#00CED1"
                        emissiveIntensity={0.3}
                    />
                </mesh>
                {/* Top antenna */}
                <mesh position={[0, 4, 0]}>
                    <cylinderGeometry args={[0.05, 0.05, 0.8, 8]} />
                    <meshStandardMaterial color="#FFFFFF" emissive="#00FFFF" emissiveIntensity={0.5} />
                </mesh>
                {/* Energy glow */}
                <mesh position={[0, 4.5, 0]}>
                    <sphereGeometry args={[0.2, 16, 16]} />
                    <meshBasicMaterial color="#00FFFF" />
                </mesh>
            </group>
        );
    } else {
        // Energy dome
        return (
            <group>
                <mesh position={[0, 1, 0]}>
                    <sphereGeometry args={[1.5, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
                    <meshStandardMaterial
                        color="#9B59B6"
                        transparent
                        opacity={0.3}
                        emissive="#8E44AD"
                        emissiveIntensity={0.4}
                        side={2} // DoubleSide
                    />
                </mesh>
                {/* Base ring */}
                <mesh position={[0, 0.05, 0]}>
                    <torusGeometry args={[1.5, 0.1, 8, 32]} />
                    <meshStandardMaterial color="#7D3C98" emissive="#6C3483" emissiveIntensity={0.5} />
                </mesh>
            </group>
        );
    }
}
