# Genesis: Voxel Space Sandbox

A procedurally generated voxel sandbox game built with **React**, **Three.js**, and **Electron**.

![Game Screenshot](https://via.placeholder.com/800x400?text=Genesis+Voxel+Engine)

## 🚀 Features

### 🌍 Infinite Logic & Terrain
-   **Dynamic Chunk Loading**: Infinite terrain generation using Simplex Noise.
-   **Voxel Physics**: Destructible terrain with chunk-based collision.
-   **Biomes**: Height-based terrain coloring (Snow > Stone > Dirt > Grass).

### 🌌 Space Travel
-   **Atmospheric Transitions**: Seamless fade from Blue Sky to Black Space.
-   **Gravity Scaling**: Gravity creates drag in the atmosphere but vanishes in orbit.
-   **Zero-G Flight**: Full 6DOF flight mechanics when in space (Y > 100).

### 🎮 Controls & Interaction
-   **First-Person / Third-Person**: Toggleable camera modes.
-   **Building System**: Raycasting interaction for Breaking and Placing blocks.
-   **Mobile Support**: On-screen Virtual Joystick and Touch Controls.

## 🛠️ Tech Stack
-   **Engine**: React Three Fiber (R3F)
-   **Physics**: Cannon.js
-   **Terrain**: Simplex Noise
-   **Framework**: Vite + Electron
-   **Language**: TypeScript

## 📦 Installation

1.  Clone the repository
    ```bash
    git clone https://github.com/LodosLawson/ggg.git
    ```
2.  Install dependencies
    ```bash
    npm install
    ```
3.  Run in Development Mode
    ```bash
    npm run electron:dev
    ```

## ⌨️ Controls

| Action | Desktop | Mobile |
| :--- | :--- | :--- |
| **Move** | WASD | Left Joystick |
| **Jump/Fly** | Space | JUMP Button |
| **Look** | Mouse | Drag Right Screen |
| **Break Block** | Left Click | DEL Button |
| **Place Block** | Right Click | ADD Button |
| **Orbit Camera** | V | - |

## 📜 License
MIT
