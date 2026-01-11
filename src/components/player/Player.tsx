import { useSphere } from '@react-three/cannon';
import { useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useStore, joystickState, actionState } from '../../store/gameStore';

export function Player({ position }: { position: [number, number, number] }) {
    const { camera } = useThree();
    const [ref, api] = useSphere(() => ({
        mass: 1,
        position,
        args: [1],
        fixedRotation: true
    }));

    // State
    const [isThirdPerson, setIsThirdPerson] = useState(false);
    const velocity = useRef([0, 0, 0]);
    useEffect(() => api.velocity.subscribe((v) => (velocity.current = v)), [api.velocity]);

    // Controls
    const keys = useRef<{ [key: string]: boolean }>({});
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            keys.current[e.code] = true;
            if (e.code === 'KeyV') setIsThirdPerson((prev) => !prev);
        };
        const handleKeyUp = (e: KeyboardEvent) => keys.current[e.code] = false;

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    const { addBlock, removeBlock } = useStore();
    const raycaster = useRef(new THREE.Raycaster());
    const scene = useThree((state) => state.scene);

    // Movement Logic
    useFrame(() => {
        if (!ref.current) return;

        const position = ref.current.position;
        const altitude = position.y;

        // GRAVITY SCALING
        // Earth Gravity: -9.81
        // Space begins at ~100 blocks? Let's say 150.
        // Full Zero G at 300.

        let gravity = -9.81;
        let isSpace = false;

        if (altitude > 100) {
            const t = Math.min(1, (altitude - 100) / 200); // 0 to 1
            gravity = THREE.MathUtils.lerp(-9.81, 0, t);
            if (t > 0.8) isSpace = true;
        }

        // Apply Custom Gravity if needed (Cannon handles gravity globally usually)
        // Cannon.js global gravity is constant? Yes.
        // We can apply a counter-force to simulate reduced gravity.
        // Force = -Gravity * Mass. Global is -9.81 * 1.
        // We want Effective = gravity * 1.
        // So applied force = (Effective - Global) * Mass
        // Difference = (gravity - (-9.81)) = gravity + 9.81.
        // Example: at space (0G), diff = 0 + 9.81 = +9.81 (Upwards force canceling gravity).

        if (altitude > 100) {
            const counterForce = gravity + 9.81;
            api.applyForce([0, counterForce, 0], [0, 0, 0]);
        }

        // FLIGHT CONTROLS (Space Mode)
        // Combine Keyboard + Mobile Inputs
        const { x: joyX, y: joyY } = joystickState;

        // Calculate Forward/Right vectors
        const forward = new THREE.Vector3(0, 0, -1);
        forward.applyQuaternion(camera.quaternion);
        // In space, we fly WHERE WE LOOK (6DOF), so don't flatten Y.
        if (!isSpace) {
            forward.y = 0;
            forward.normalize();
        } else {
            forward.normalize();
        }

        const right = new THREE.Vector3(1, 0, 0);
        right.applyQuaternion(camera.quaternion);
        if (!isSpace) right.y = 0;
        right.normalize();

        const direction = new THREE.Vector3();

        if (keys.current.KeyW || joyY < -0.1) direction.add(forward);
        if (keys.current.KeyS || joyY > 0.1) direction.sub(forward);
        if (keys.current.KeyD || joyX > 0.1) direction.add(right);
        if (keys.current.KeyA || joyX < -0.1) direction.sub(right);

        // Mobile continuous joystick movement
        if (Math.abs(joyY) > 0.1) direction.add(forward.clone().multiplyScalar(-joyY));
        if (Math.abs(joyX) > 0.1) direction.add(right.clone().multiplyScalar(joyX));

        direction.normalize();

        let speed = 8;
        if (isSpace) speed = 20; // Faster in space

        const moveX = direction.x * speed;
        const moveY = isSpace ? direction.y * speed : velocity.current[1]; // Fly in Y if space
        const moveZ = direction.z * speed;

        // If in space, we override velocity directly including Y
        if (isSpace) {
            // Apply dampening so we don't drift forever? Or Newtonian?
            // For fun, let's just set velocity (Arcade space flight)
            api.velocity.set(moveX, moveY, moveZ);
        } else {
            api.velocity.set(moveX, velocity.current[1], moveZ);
            // Jump
            if ((keys.current.Space || actionState.jump) && Math.abs(velocity.current[1]) < 0.05) {
                api.velocity.set(velocity.current[0], 6, velocity.current[2]);
            }
        }

        // Camera Follow (Third Person) - Simplified for MVP
        if (isThirdPerson) {
            const targetPos = new THREE.Vector3(ref.current.position.x, ref.current.position.y + 2, ref.current.position.z);
            const offset = new THREE.Vector3(0, 2, 4);
            offset.applyQuaternion(camera.quaternion);
            const cameraPos = targetPos.clone().add(offset);
            camera.position.lerp(cameraPos, 0.1);
        } else {
            // First Person
            camera.position.x = ref.current.position.x;
            camera.position.y = ref.current.position.y + 1; // Eye level
            camera.position.z = ref.current.position.z;
        }
    });

    // Interaction Logic
    // Handle Mobile Action Buttons
    // We poll actionState in useFrame or just use checks here? 
    // Better: actions trigger callbacks. But for simplicity, let's poll or just handle click.
    // Actually, MobileControls calls triggerJump etc directly in store. 
    // We need to listen to those or poll them.
    // The store `triggerBreak` sets `actionState.break = true` for 100ms.
    // Let's check that in a separate interval or useFrame?
    // Let's do it in useFrame for responsiveness.

    useFrame(() => {
        // Poll for Mobile Actions
        if (actionState.break) {
            // Raycast center
            performRaycastAction('remove');
            actionState.break = false; // Consume
        }
        if (actionState.place) {
            performRaycastAction('add');
            actionState.place = false;
        }
    });

    const performRaycastAction = (action: 'add' | 'remove') => {
        raycaster.current.setFromCamera(new THREE.Vector2(0, 0), camera);
        const voxelMesh = scene.getObjectByName('voxel-world');
        if (!voxelMesh) return;

        const intersects = raycaster.current.intersectObject(voxelMesh);
        if (intersects.length > 0) {
            const hit = intersects[0];
            if (!hit.face) return;

            const normal = hit.face.normal.clone().transformDirection(voxelMesh.matrixWorld).round();
            if (action === 'remove') {
                const point = hit.point.clone().sub(normal.clone().multiplyScalar(0.5));
                removeBlock(point.toArray().map(Math.round) as any);
            } else {
                const point = hit.point.clone().add(normal.clone().multiplyScalar(0.5));
                addBlock(point.toArray().map(Math.round) as any);
            }
        }
    };

    // Mouse Interaction
    useEffect(() => {
        const handleMouseDown = (e: MouseEvent) => {
            if (e.button === 0 && document.pointerLockElement) performRaycastAction('remove');
            if (e.button === 2 && document.pointerLockElement) performRaycastAction('add');
        };
        window.addEventListener('mousedown', handleMouseDown);
        return () => window.removeEventListener('mousedown', handleMouseDown);
    }, [addBlock, removeBlock, camera, scene]);

    return (
        <>
            <PointerLockControls />
            <mesh ref={ref as any} castShadow>
                <sphereGeometry args={[0.5, 16, 16]} />
                <meshStandardMaterial color="orange" visible={isThirdPerson} />
                {/* Character Model Visuals would go here */}
                {isThirdPerson && <MonkeyModel />}
            </mesh>
        </>
    );
}

function MonkeyModel() {
    // Placeholder for the character visual based on era
    const currentEra = useStore(state => state.currentEra);

    return (
        <group position={[0, 0, 0]}>
            {currentEra === 'PRIMITIVE' && <PrimitiveCharacter />}
            {currentEra === 'ANCIENT' && <AncientCharacter />}
            {currentEra === 'INDUSTRIAL' && <IndustrialCharacter />}
            {currentEra === 'FUTURISTIC' && <FuturisticCharacter />}
        </group>
    );
}

// PRIMITIVE - Ape-like character
function PrimitiveCharacter() {
    return (
        <group>
            {/* Body - hunched forward */}
            <mesh position={[0, -0.1, -0.1]}>
                <boxGeometry args={[0.9, 0.9, 0.7]} />
                <meshStandardMaterial color="#8b4513" roughness={0.9} />
            </mesh>
            {/* Head */}
            <mesh position={[0, 0.6, -0.1]}>
                <boxGeometry args={[0.7, 0.6, 0.6]} />
                <meshStandardMaterial color="#8b4513" roughness={0.9} />
            </mesh>
            {/* Eyes */}
            <mesh position={[0.2, 0.6, 0.2]}>
                <boxGeometry args={[0.15, 0.15, 0.05]} />
                <meshStandardMaterial color="#1a1a1a" />
            </mesh>
            <mesh position={[-0.2, 0.6, 0.2]}>
                <boxGeometry args={[0.15, 0.15, 0.05]} />
                <meshStandardMaterial color="#1a1a1a" />
            </mesh>
            {/* Arms - longer */}
            <mesh position={[0.5, 0, -0.3]}>
                <boxGeometry args={[0.2, 0.8, 0.2]} />
                <meshStandardMaterial color="#6d3a1a" />
            </mesh>
            <mesh position={[-0.5, 0, -0.3]}>
                <boxGeometry args={[0.2, 0.8, 0.2]} />
                <meshStandardMaterial color="#6d3a1a" />
            </mesh>
        </group>
    );
}

// ANCIENT - Upright human with simple clothing
function AncientCharacter() {
    return (
        <group>
            {/* Body - upright */}
            <mesh position={[0, 0, 0]}>
                <boxGeometry args={[0.8, 1, 0.6]} />
                <meshStandardMaterial color="#E0AC69" roughness={0.8} />
            </mesh>
            {/* Tunic/cloth */}
            <mesh position={[0, -0.2, 0]}>
                <boxGeometry args={[0.85, 0.7, 0.65]} />
                <meshStandardMaterial color="#8B7355" roughness={0.9} />
            </mesh>
            {/* Head */}
            <mesh position={[0, 0.7, 0]}>
                <boxGeometry args={[0.6, 0.6, 0.6]} />
                <meshStandardMaterial color="#E0AC69" roughness={0.8} />
            </mesh>
            {/* Eyes */}
            <mesh position={[0.15, 0.75, 0.31]}>
                <boxGeometry args={[0.1, 0.1, 0.05]} />
                <meshStandardMaterial color="white" />
            </mesh>
            <mesh position={[-0.15, 0.75, 0.31]}>
                <boxGeometry args={[0.1, 0.1, 0.05]} />
                <meshStandardMaterial color="white" />
            </mesh>
            {/* Arms */}
            <mesh position={[0.45, 0.1, 0]}>
                <boxGeometry args={[0.2, 0.7, 0.2]} />
                <meshStandardMaterial color="#E0AC69" />
            </mesh>
            <mesh position={[-0.45, 0.1, 0]}>
                <boxGeometry args={[0.2, 0.7, 0.2]} />
                <meshStandardMaterial color="#E0AC69" />
            </mesh>
        </group>
    );
}

// INDUSTRIAL - Worker with hat
function IndustrialCharacter() {
    return (
        <group>
            {/* Body */}
            <mesh position={[0, 0, 0]}>
                <boxGeometry args={[0.8, 1, 0.6]} />
                <meshStandardMaterial color="#4A4A4A" roughness={0.7} />
            </mesh>
            {/* Worker vest */}
            <mesh position={[0, 0.1, 0.31]}>
                <boxGeometry args={[0.7, 0.8, 0.05]} />
                <meshStandardMaterial color="#D4AF37" roughness={0.6} />
            </mesh>
            {/* Head */}
            <mesh position={[0, 0.7, 0]}>
                <boxGeometry args={[0.6, 0.6, 0.6]} />
                <meshStandardMaterial color="#E0AC69" roughness={0.8} />
            </mesh>
            {/* Hard hat */}
            <mesh position={[0, 1.1, 0]}>
                <cylinderGeometry args={[0.4, 0.35, 0.3, 8]} />
                <meshStandardMaterial color="#FFD700" roughness={0.5} metalness={0.3} />
            </mesh>
            {/* Eyes */}
            <mesh position={[0.15, 0.75, 0.31]}>
                <boxGeometry args={[0.1, 0.1, 0.05]} />
                <meshStandardMaterial color="white" />
            </mesh>
            <mesh position={[-0.15, 0.75, 0.31]}>
                <boxGeometry args={[0.1, 0.1, 0.05]} />
                <meshStandardMaterial color="white" />
            </mesh>
            {/* Arms */}
            <mesh position={[0.45, 0.1, 0]}>
                <boxGeometry args={[0.2, 0.7, 0.2]} />
                <meshStandardMaterial color="#696969" />
            </mesh>
            <mesh position={[-0.45, 0.1, 0]}>
                <boxGeometry args={[0.2, 0.7, 0.2]} />
                <meshStandardMaterial color="#696969" />
            </mesh>
        </group>
    );
}

// FUTURISTIC - Armored suit with glow
function FuturisticCharacter() {
    return (
        <group>
            {/* Armor body */}
            <mesh position={[0, 0, 0]}>
                <boxGeometry args={[0.85, 1.1, 0.65]} />
                <meshStandardMaterial
                    color="#1E1E1E"
                    roughness={0.2}
                    metalness={0.9}
                    emissive="#00CED1"
                    emissiveIntensity={0.2}
                />
            </mesh>
            {/* Chest plate accent */}
            <mesh position={[0, 0.2, 0.33]}>
                <boxGeometry args={[0.5, 0.6, 0.05]} />
                <meshStandardMaterial
                    color="#4ECDC4"
                    roughness={0.1}
                    metalness={0.95}
                    emissive="#00FFFF"
                    emissiveIntensity={0.4}
                />
            </mesh>
            {/* Helmet */}
            <mesh position={[0, 0.75, 0]}>
                <boxGeometry args={[0.65, 0.65, 0.65]} />
                <meshStandardMaterial
                    color="#2F2F2F"
                    roughness={0.1}
                    metalness={0.9}
                />
            </mesh>
            {/* Visor */}
            <mesh position={[0, 0.75, 0.33]}>
                <boxGeometry args={[0.5, 0.25, 0.05]} />
                <meshStandardMaterial
                    color="#00FFFF"
                    transparent
                    opacity={0.7}
                    emissive="#00CED1"
                    emissiveIntensity={0.6}
                />
            </mesh>
            {/* Shoulder pads */}
            <mesh position={[0.5, 0.5, 0]}>
                <boxGeometry args={[0.3, 0.3, 0.3]} />
                <meshStandardMaterial color="#1E1E1E" roughness={0.3} metalness={0.8} />
            </mesh>
            <mesh position={[-0.5, 0.5, 0]}>
                <boxGeometry args={[0.3, 0.3, 0.3]} />
                <meshStandardMaterial color="#1E1E1E" roughness={0.3} metalness={0.8} />
            </mesh>
            {/* Arms */}
            <mesh position={[0.45, 0, 0]}>
                <boxGeometry args={[0.22, 0.8, 0.22]} />
                <meshStandardMaterial color="#2F2F2F" roughness={0.2} metalness={0.9} />
            </mesh>
            <mesh position={[-0.45, 0, 0]}>
                <boxGeometry args={[0.22, 0.8, 0.22]} />
                <meshStandardMaterial color="#2F2F2F" roughness={0.2} metalness={0.9} />
            </mesh>
        </group>
    );
}
