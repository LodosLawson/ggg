// import { useRef } from 'react'; // Unused
import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Sky, Stars } from '@react-three/drei';
import * as THREE from 'three';

export function DynamicSky() {
    // Fog and Background handled by FogController
    // Rotating Sun (Day/Night Cycle)
    const sunRef = useRef(new THREE.Vector3());
    useFrame(({ clock }) => {
        const time = clock.getElapsedTime() * 0.1; // Speed of day
        // Circle around Z axis? Or X?
        // Sun rises in East (X+), sets West (X-)
        const x = Math.sin(time) * 100;
        const y = Math.cos(time) * 100;
        const z = 25; // Slight offset
        sunRef.current.set(x, y, z);
    });

    return (
        <group>
            {/* 
                We render Sky for atmosphere. 
             */}
            <Sky
                distance={450000}
                sunPosition={sunRef.current}
                inclination={0}
                azimuth={0.25}
            />
            {/* 
                Fog to hide chunk edges.
                Color should fade from white/blue to black.
            */}
            <FogController />
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        </group>
    );
}

function FogController() {
    const { scene, camera } = useThree();

    useFrame(() => {
        const altitude = camera.position.y;
        // 0 -> 200
        const t = Math.min(1, Math.max(0, altitude / 300));

        // Color: White (0xeeeeee) to Black (0x000000)
        const c1 = new THREE.Color(0x87CEEB); // Sky Blue
        const c2 = new THREE.Color(0x000000); // Space Black
        const result = c1.lerp(c2, t * t); // Exp fade

        scene.fog = new THREE.FogExp2(result, 0.02 * (1 - t * 0.9)); // Less fog in space
        scene.background = result;
    });

    return null;
}
