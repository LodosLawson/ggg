// import { useRef } from 'react'; // Unused
import { useFrame, useThree } from '@react-three/fiber';
import { Sky, Stars } from '@react-three/drei';
import * as THREE from 'three';

export function DynamicSky() {
    // Fog and Background handled by FogController
    return (
        <group>
            {/* 
                We render Sky for atmosphere. 
             */}
            <Sky
                distance={450000}
                sunPosition={[50, 50, 25]}
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
