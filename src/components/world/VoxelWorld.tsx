import { useLayoutEffect, useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { createNoise2D } from 'simplex-noise';
import { useStore } from '../../store/gameStore';

const noise2D = createNoise2D();

interface VoxelWorldProps {
    chunkSize?: number;
    chunkHeight?: number;
}

type BlockData = { x: number; y: number; z: number; id: number };

export function VoxelWorld({ chunkSize = 32, chunkHeight = 16 }: VoxelWorldProps) {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const { setVoxelCallbacks } = useStore();

    // Generate initial terrain
    const generateTerrain = () => {
        const instances: BlockData[] = [];
        let count = 0;
        for (let x = -chunkSize / 2; x < chunkSize / 2; x++) {
            for (let z = -chunkSize / 2; z < chunkSize / 2; z++) {
                const scale = 0.05;
                const height = Math.floor(Math.abs(noise2D(x * scale, z * scale)) * chunkHeight);
                const yStart = Math.max(0, height - 2);
                for (let y = yStart; y <= height; y++) {
                    instances.push({ x, y, z, id: count++ });
                }
            }
        }
        return instances;
    };

    const [blocks, setBlocks] = useState<BlockData[]>(() => generateTerrain());

    // Register interactions
    useEffect(() => {
        setVoxelCallbacks(
            // Add Block
            (pos) => {
                const [x, y, z] = pos.map(Math.round);
                // Check if exists
                setBlocks(prev => {
                    if (prev.some(b => b.x === x && b.y === y && b.z === z)) return prev;
                    return [...prev, { x, y, z, id: Math.random() }];
                });
            },
            // Remove Block
            (pos) => {
                // For removal, we might get a float position from raycast intersection point.
                // But actually, we usually get the instanceId from the intersection!
                // The store is generic (pos). Let's see how Player calls it.
                // If Player passes the exact block center, we round.
                const [x, y, z] = pos.map(Math.round);
                setBlocks(prev => prev.filter(b => !(b.x === x && b.y === y && b.z === z)));
            }
        );
    }, [setVoxelCallbacks]);

    // Geometry & Material
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({ color: 'white' }); // Use white to allow instance coloring

    // Update Instance Matrices & Colors
    useLayoutEffect(() => {
        if (!meshRef.current) return;

        const tempObject = new THREE.Object3D();
        const tempColor = new THREE.Color();

        blocks.forEach((d, i) => {
            tempObject.position.set(d.x, d.y, d.z);
            tempObject.updateMatrix();
            meshRef.current!.setMatrixAt(i, tempObject.matrix);

            // Coloring based on Height
            // Max height is roughly chunkHeight (16)
            // But simplex noise creates variations.
            // Let's assume ground level is 0-ish.

            if (d.y > 12) {
                tempColor.setHex(0xFFFFFF); // Snow
            } else if (d.y > 8) {
                tempColor.setHex(0x808080); // Stone
            } else if (d.y > 5) {
                tempColor.setHex(0xdeb887); // Dirt/Sand transition
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
            name="voxel-world"
            args={[geometry, material, blocks.length]}
            castShadow
            receiveShadow
            onPointerMove={undefined}
            onPointerOut={undefined}
        >
            {/* We could add interaction logic here */}
        </instancedMesh>
    );
}
