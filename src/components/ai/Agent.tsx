import { useSphere } from '@react-three/cannon';
import { useFrame } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';

type AIState = 'IDLE' | 'WANDER' | 'FLEE';

interface AgentProps {
    position: [number, number, number];
    type: 'ANIMAL' | 'HUMAN';
    color: string;
}

export function Agent({ position, type, color }: AgentProps) {
    const [ref, api] = useSphere(() => ({
        mass: 1,
        position,
        args: [0.8],
        fixedRotation: true
    }));

    const [aiState, setAiState] = useState<AIState>('IDLE');
    const nextDecisionTime = useRef(0);
    const velocity = useRef([0, 0, 0]);

    // To smooth out movement
    useEffect(() => api.velocity.subscribe((v) => (velocity.current = v)), [api.velocity]);

    useFrame((state) => {
        const time = state.clock.getElapsedTime();

        // AI Decision Loop
        if (time > nextDecisionTime.current) {
            // Pick a new state
            const rand = Math.random();
            if (rand < 0.4) {
                setAiState('IDLE');
                nextDecisionTime.current = time + 1 + Math.random() * 2;
            } else if (rand < 0.9) {
                setAiState('WANDER');
                nextDecisionTime.current = time + 2 + Math.random() * 3;
            } else {
                // Occasional little sprint/flee behavior
                setAiState('FLEE');
                nextDecisionTime.current = time + 1;
            }
        }

        // Execute State
        if (aiState === 'IDLE') {
            // Dampen velocity to stop
            api.velocity.set(velocity.current[0] * 0.9, velocity.current[1], velocity.current[2] * 0.9);
        } else if (aiState === 'WANDER') {
            // Random wandering force
            // ideally we push properly, but for MVP we just set velocity gently
            // We only change direction occasionally? 
            // Simple random walk:
            if (Math.random() < 0.05) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 2;
                api.velocity.set(Math.sin(angle) * speed, velocity.current[1], Math.cos(angle) * speed);
            }
        } else if (aiState === 'FLEE') {
            // Run fast in current direction
            // const speed = 6;
            // maintain current heading but faster
            api.velocity.set(velocity.current[0] * 1.5, velocity.current[1], velocity.current[2] * 1.5);
        }
    });

    return (
        <group ref={ref as any}>
            <mesh castShadow>
                <boxGeometry args={[type === 'ANIMAL' ? 1 : 0.8, 0.8, type === 'ANIMAL' ? 1.5 : 0.8]} />
                <meshStandardMaterial color={color} />
            </mesh>
            {/* Simple "Mind" indicator */}
            <mesh position={[0, 1, 0]}>
                <sphereGeometry args={[0.1]} />
                <meshBasicMaterial color={aiState === 'IDLE' ? 'green' : aiState === 'WANDER' ? 'yellow' : 'red'} />
            </mesh>
        </group>
    );
}
