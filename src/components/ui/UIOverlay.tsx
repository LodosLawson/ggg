import { useStore, type Era } from '../../store/gameStore';

export function UIOverlay({ gameState }: { gameState: 'GALAXY' | 'WORLD' }) {
    const { currentEra, worldHealth, setEra, damageWorld } = useStore();

    if (gameState === 'GALAXY') {
        return (
            <div className="absolute top-10 left-0 w-full text-center pointer-events-none">
                <h1 className="text-4xl font-pixel text-star-white tracking-widest uppercase drop-shadow-md">
                    Genesis
                </h1>
                <p className="text-white/50 font-pixel mt-2">Click on the World to Begin</p>
            </div>
        );
    }

    const healthPercent = (worldHealth / 1000000) * 100;
    const isDestroyed = worldHealth <= 0;

    const eras: Era[] = ['PRIMITIVE', 'ANCIENT', 'INDUSTRIAL', 'FUTURISTIC'];
    const currentEraIndex = eras.indexOf(currentEra);

    return (
        <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-pixel text-white">
                        Current Era: <span className="text-yellow-400">{currentEra}</span>
                    </h2>
                    <div className="mt-2 text-white/70 font-mono text-sm">
                        Press [V] to Switch Camera<br />
                        WASD to Move | Space to Jump
                    </div>
                </div>

                <div className="text-right">
                    <div className="text-white font-pixel">World Stability</div>
                    <div className="w-48 h-4 bg-gray-800 border-2 border-white mt-1">
                        <div
                            className={`h-full transition-all duration-300 ${healthPercent > 70 ? 'bg-green-500' :
                                    healthPercent > 40 ? 'bg-yellow-500' :
                                        healthPercent > 20 ? 'bg-orange-500' :
                                            'bg-red-500'
                                }`}
                            style={{ width: `${healthPercent}%` }}
                        />
                    </div>
                    <div className="text-white/50 font-mono text-xs mt-1">
                        {Math.floor(worldHealth).toLocaleString()} / 1,000,000
                    </div>
                </div>
            </div>

            {/* Game Over Overlay */}
            {isDestroyed && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center pointer-events-auto">
                    <div className="text-center">
                        <h1 className="text-6xl font-pixel text-red-500 mb-4">WORLD DESTROYED</h1>
                        <p className="text-white/70 font-pixel text-xl mb-8">The planet has been consumed by chaos</p>
                        <button
                            className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white border-2 border-red-400 font-pixel text-lg"
                            onClick={() => window.location.reload()}
                        >
                            Restart Genesis
                        </button>
                    </div>
                </div>
            )}

            <div className="flex gap-2 pointer-events-auto flex-wrap">
                {/* Era Evolution Controls */}
                <div className="bg-black/50 backdrop-blur-md border border-white/30 p-2 rounded">
                    <div className="text-white font-pixel text-xs mb-2">ERA EVOLUTION</div>
                    <div className="flex gap-1">
                        {eras.map((era, idx) => (
                            <button
                                key={era}
                                className={`px-3 py-2 border font-pixel text-xs transition-all ${currentEra === era
                                        ? 'bg-yellow-500 text-black border-yellow-300'
                                        : idx <= currentEraIndex
                                            ? 'bg-white/10 text-white/50 border-white/20'
                                            : 'bg-white/5 text-white/30 border-white/10 hover:bg-white/10'
                                    }`}
                                onClick={() => setEra(era)}
                                disabled={isDestroyed}
                            >
                                {era}
                            </button>
                        ))}
                    </div>
                </div>

                {/* World Damage Controls (Debug) */}
                <div className="bg-black/50 backdrop-blur-md border border-white/30 p-2 rounded">
                    <div className="text-white font-pixel text-xs mb-2">DEBUG CONTROLS</div>
                    <div className="flex gap-1">
                        <button
                            className="px-3 py-2 bg-red-600/80 hover:bg-red-600 text-white border border-red-400/50 font-pixel text-xs"
                            onClick={() => damageWorld(50000)}
                            disabled={isDestroyed}
                        >
                            Damage -5%
                        </button>
                        <button
                            className="px-3 py-2 bg-red-800/80 hover:bg-red-800 text-white border border-red-600/50 font-pixel text-xs"
                            onClick={() => damageWorld(200000)}
                            disabled={isDestroyed}
                        >
                            Damage -20%
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
