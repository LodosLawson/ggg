import { useLayoutEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';

// Shared Noise Instance to ensure continuity across chunks
// We might need to move this to a context or keep it singleton for now.


interface VoxelChunkProps {
    position: [number, number]; // [x, z] world position
    chunkSize?: number;
    chunkHeight?: number;
}

type BlockData = { x: number; y: number; z: number; id: number };

export function VoxelChunk({ position, chunkSize = 16, chunkHeight = 64 }: VoxelChunkProps) {
    // chunkHeight unused for flat plane optimization
    // (void chunkHeight); // Hack or just remove it from destructuring if strictly unused.
    // Let's just consume it to silence the linter for now in case we revert to terrain.
    const _h = chunkHeight;
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const [worldX, worldZ] = position;

    // Generate terrain for THIS chunk
    const generateTerrain = () => {
        const instances: BlockData[] = [];
        let count = 0;

        // Loop through local chunk coordinates
        for (let x = 0; x < chunkSize; x++) {
            for (let z = 0; z < chunkSize; z++) {
                // FLAT PLANE "DUZLEM" GENERATION
                const height = 1; // Flat height at Y=1
                const yStart = 0;

                for (let y = yStart; y <= height; y++) {
                    // Local position in mesh is x, y, z
                    // But we want it visually at WorldPosition?
                    // InstancedMesh handles local offsets. We put the mesh at [worldX, 0, worldZ]
                    // So instances are 0..chunkSize
                    instances.push({ x, y, z, id: count++ });
                }
            }
        }
        return instances;
    };

    const [blocks, _] = useState<BlockData[]>(() => generateTerrain());

    // Geometry & Material
    // Reusing standard material for now
    const geometry = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
    const material = useMemo(() => new THREE.MeshStandardMaterial({ color: 'white' }), []);

    // Update Instance Matrices & Colors
    useLayoutEffect(() => {
        if (!meshRef.current) return;

        const tempObject = new THREE.Object3D();
        const tempColor = new THREE.Color();

        blocks.forEach((d, i) => {
            tempObject.position.set(d.x, d.y, d.z);
            tempObject.updateMatrix();
            meshRef.current!.setMatrixAt(i, tempObject.matrix);

            // Coloring based on Height (Absolute height d.y)
            if (d.y > 40) {
                tempColor.setHex(0xFFFFFF); // Snow
            } else if (d.y > 25) {
                tempColor.setHex(0x808080); // Stone
            } else if (d.y > 10) {
                tempColor.setHex(0xdeb887); // Dirt
            } else {
                tempColor.setHex(0x5C9E57); // Grass
            }
            meshRef.current!.setColorAt(i, tempColor);
        });

        meshRef.current.instanceMatrix.needsUpdate = true;
        if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
    }, [blocks]);

    return (
        <instancedMesh
            ref={meshRef}
            // Tagging for raycaster: "voxel-chunk"
            name="voxel-chunk"
            position={[worldX, 0, worldZ]} // Place the whole chunk at its world offset
            args={[geometry, material, blocks.length]}
            castShadow
            receiveShadow
        >
        </instancedMesh>
    );
}
