import { useRef, useEffect, useState } from 'react';
import { useStore } from '../../store/gameStore';

// Simple implementation of a virtual joystick
const Joystick = ({ onMove }: { onMove: (x: number, y: number) => void }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [active, setActive] = useState(false);
    const [pos, setPos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleTouchMove = (e: TouchEvent) => {
            if (!active || !ref.current) return;
            const touch = Array.from(e.changedTouches).find(t => t.identifier === (ref.current as any).touchId);
            if (!touch) return;

            const rect = ref.current.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const maxDist = 40;
            let dx = touch.clientX - centerX;
            let dy = touch.clientY - centerY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > maxDist) {
                const ratio = maxDist / dist;
                dx *= ratio;
                dy *= ratio;
            }

            setPos({ x: dx, y: dy });
            onMove(dx / maxDist, dy / maxDist);
        };

        const handleTouchEnd = (e: TouchEvent) => {
            if (!active) return;
            const touch = Array.from(e.changedTouches).find(t => t.identifier === (ref.current as any).touchId);
            if (touch) {
                setActive(false);
                setPos({ x: 0, y: 0 });
                onMove(0, 0);
            }
        };

        window.addEventListener('touchmove', handleTouchMove);
        window.addEventListener('touchend', handleTouchEnd);
        return () => {
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, [active, onMove]);

    return (
        <div
            ref={ref}
            style={{
                width: '100px',
                height: '100px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '50%',
                position: 'relative',
                touchAction: 'none'
            }}
            onTouchStart={(e) => {
                const touch = e.changedTouches[0];
                (ref.current as any).touchId = touch.identifier;
                setActive(true);
            }}
        >
            <div style={{
                width: '40px',
                height: '40px',
                background: 'rgba(255, 255, 255, 0.5)',
                borderRadius: '50%',
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))`,
                pointerEvents: 'none'
            }} />
        </div>
    );
};

export function MobileControls() {
    const { setJoystickValues, triggerJump, triggerBreak, triggerPlace } = useStore();

    return (
        <div style={{
            position: 'absolute',
            bottom: '20px',
            left: '20px',
            right: '20px',
            height: '150px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'end',
            pointerEvents: 'none', // Allow clicks to pass through empty areas
            zIndex: 2000
        }}>
            {/* Left Stick - Movement */}
            <div style={{ pointerEvents: 'auto' }}>
                <Joystick onMove={(x, y) => setJoystickValues(x, y)} />
            </div>

            {/* Right Buttons - Actions */}
            <div style={{ display: 'flex', gap: '20px', pointerEvents: 'auto', paddingBottom: '20px' }}>
                <button
                    style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255,0,0,0.3)', border: '2px solid white', color: 'white' }}
                    onTouchStart={triggerBreak}
                >
                    DEL
                </button>
                <button
                    style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(0,255,0,0.3)', border: '2px solid white', color: 'white' }}
                    onTouchStart={triggerPlace}
                >
                    ADD
                </button>
                <button
                    style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(0,0,255,0.3)', border: '2px solid white', color: 'white' }}
                    onTouchStart={triggerJump}
                >
                    JUMP
                </button>
            </div>
        </div>
    );
}
