import { create } from 'zustand';

export type Era = 'PRIMITIVE' | 'ANCIENT' | 'INDUSTRIAL' | 'FUTURISTIC';

interface GameState {
    currentEra: Era;
    setEra: (era: Era) => void;
    worldHealth: number;
    damageWorld: (amount: number) => void;

    // Mobile Interaction
    setJoystickValues: (x: number, y: number) => void;
    triggerJump: () => void;
    triggerBreak: () => void;
    triggerPlace: () => void;

    // Voxel Interactions
    addBlock: (position: [number, number, number]) => void;
    removeBlock: (position: [number, number, number]) => void;
    // Callback registration for VoxelWorld to hook into
    setVoxelCallbacks: (
        add: (pos: [number, number, number]) => void,
        remove: (pos: [number, number, number]) => void
    ) => void;
}

// Mutable reference outside of store to avoid re-renders just for callback existence
let voxelCallbacks = {
    add: (_: [number, number, number]) => { },
    remove: (_: [number, number, number]) => { },
};

// Mutable Joystick State (Direct access for loop)
export const joystickState = { x: 0, y: 0 };
export const actionState = { jump: false, break: false, place: false };

export const useStore = create<GameState>((set) => ({
    currentEra: 'PRIMITIVE',
    setEra: (era) => set({ currentEra: era }),
    worldHealth: 1000000,
    damageWorld: (amount) => set((state) => ({ worldHealth: Math.max(0, state.worldHealth - amount) })),

    setJoystickValues: (x, y) => { joystickState.x = x; joystickState.y = y; },
    triggerJump: () => { actionState.jump = true; setTimeout(() => actionState.jump = false, 100); },
    triggerBreak: () => { actionState.break = true; setTimeout(() => actionState.break = false, 100); },
    triggerPlace: () => { actionState.place = true; setTimeout(() => actionState.place = false, 100); },

    setVoxelCallbacks: (add, remove) => {
        voxelCallbacks.add = add;
        voxelCallbacks.remove = remove;
    },
    addBlock: (pos) => voxelCallbacks.add(pos),
    removeBlock: (pos) => voxelCallbacks.remove(pos),
}));
