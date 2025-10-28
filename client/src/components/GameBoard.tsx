import { useSustainability, BUILDING_INFO } from "@/lib/stores/useSustainability";
import { useEffect } from "react";
import { useAudio } from "@/lib/stores/useAudio";

export function GameBoard() {
  const { tiles, selectedBuildingType, placeBuilding, removeBuilding, fontSize } = useSustainability();
  const { playSuccess, isMuted } = useAudio();
  const soundEnabled = !isMuted;

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        useSustainability.getState().selectBuildingType(null);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const handleTileClick = (x: number, y: number) => {
    const tile = tiles[y][x];

    if (selectedBuildingType) {
      const success = placeBuilding(x, y, selectedBuildingType);
      if (success && soundEnabled) {
        playSuccess();
      }
    } else if (tile.building) {
      if (window.confirm(`Remove ${BUILDING_INFO[tile.building.type].name}?`)) {
        removeBuilding(x, y);
      }
    }
  };

  const getBuildingIcon = (type: string): string => {
    switch (type) {
      case 'solar_panel': return '☀️';
      case 'wind_turbine': return '🌀';
      case 'community_garden': return '🌱';
      case 'rainwater_collector': return '💧';
      case 'recycling_center': return '♻️';
      case 'compost_bin': return '🪴';
      default: return '🏠';
    }
  };

  const getBuildingColor = (type: string): string => {
    switch (type) {
      case 'solar_panel': return 'bg-yellow-400 border-yellow-600';
      case 'wind_turbine': return 'bg-blue-300 border-blue-500';
      case 'community_garden': return 'bg-green-400 border-green-600';
      case 'rainwater_collector': return 'bg-cyan-400 border-cyan-600';
      case 'recycling_center': return 'bg-orange-300 border-orange-500';
      case 'compost_bin': return 'bg-amber-600 border-amber-800';
      default: return 'bg-gray-400 border-gray-600';
    }
  };

  return (
    <div className="flex items-center justify-center p-4" style={{ fontSize: `${fontSize}px` }}>
      <div
        className="grid gap-1 p-4 bg-[hsl(var(--grid-bg))] border-4 border-[hsl(var(--grid-line))] rounded-lg shadow-lg"
        style={{
          gridTemplateColumns: `repeat(${tiles[0].length}, minmax(0, 1fr))`,
        }}
      >
        {tiles.map((row, y) =>
          row.map((tile, x) => (
            <button
              key={`${x}-${y}`}
              onClick={() => handleTileClick(x, y)}
              className={`
                w-16 h-16 border-2 rounded flex items-center justify-center
                transition-all duration-200 font-bold text-2xl
                ${tile.building
                  ? getBuildingColor(tile.building.type)
                  : selectedBuildingType
                  ? 'bg-white border-green-400 hover:bg-green-50 cursor-pointer'
                  : 'bg-white border-gray-300 hover:bg-gray-50 cursor-pointer'
                }
                ${selectedBuildingType && !tile.building ? 'ring-2 ring-green-500 ring-offset-2' : ''}
                focus:outline-none focus:ring-4 focus:ring-blue-500
              `}
              aria-label={
                tile.building
                  ? `${BUILDING_INFO[tile.building.type].name} at position ${x}, ${y}`
                  : `Empty tile at position ${x}, ${y}`
              }
              tabIndex={0}
            >
              {tile.building ? (
                <span role="img" aria-label={BUILDING_INFO[tile.building.type].name}>
                  {getBuildingIcon(tile.building.type)}
                </span>
              ) : selectedBuildingType ? (
                <span className="text-green-500 text-xl">+</span>
              ) : null}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
