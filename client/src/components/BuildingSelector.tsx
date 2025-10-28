import { useSustainability, BUILDING_INFO, type BuildingType } from "@/lib/stores/useSustainability";
import { Button } from "@/components/ui/button";

export function BuildingSelector() {
  const { selectedBuildingType, selectBuildingType, canAffordBuilding, fontSize } = useSustainability();

  const buildingIcons: Record<BuildingType, string> = {
    solar_panel: '☀️',
    wind_turbine: '🌀',
    community_garden: '🌱',
    rainwater_collector: '💧',
    recycling_center: '♻️',
    compost_bin: '🪴'
  };

  const buildingColors: Record<BuildingType, string> = {
    solar_panel: 'border-yellow-500 hover:bg-yellow-50',
    wind_turbine: 'border-blue-500 hover:bg-blue-50',
    community_garden: 'border-green-500 hover:bg-green-50',
    rainwater_collector: 'border-cyan-500 hover:bg-cyan-50',
    recycling_center: 'border-orange-500 hover:bg-orange-50',
    compost_bin: 'border-amber-700 hover:bg-amber-50'
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg border-2 border-gray-300" style={{ fontSize: `${fontSize}px` }}>
      <h2 className="text-xl font-bold mb-4">Build</h2>
      
      <div className="grid grid-cols-2 gap-2 mb-4">
        {Object.entries(BUILDING_INFO).map(([type, info]) => {
          const buildingType = type as BuildingType;
          const canAfford = canAffordBuilding(buildingType);
          const isSelected = selectedBuildingType === buildingType;

          return (
            <Button
              key={type}
              onClick={() => selectBuildingType(isSelected ? null : buildingType)}
              disabled={!canAfford}
              className={`
                h-auto p-3 flex flex-col items-center gap-1 border-2 bg-white text-gray-900
                ${buildingColors[buildingType]}
                ${isSelected ? 'ring-4 ring-blue-500 bg-blue-50' : ''}
                ${!canAfford ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              variant="outline"
              aria-label={`${info.name}. ${info.description}. ${canAfford ? 'Affordable' : 'Cannot afford'}`}
              aria-pressed={isSelected}
            >
              <span className="text-3xl" role="img" aria-label={info.name}>
                {buildingIcons[buildingType]}
              </span>
              <span className="text-xs font-bold text-center leading-tight">{info.name}</span>
            </Button>
          );
        })}
      </div>

      {selectedBuildingType && (
        <div className="p-3 bg-blue-50 border-2 border-blue-500 rounded-lg">
          <h3 className="font-bold text-sm mb-1">{BUILDING_INFO[selectedBuildingType].name}</h3>
          <p className="text-xs text-gray-700 mb-2">{BUILDING_INFO[selectedBuildingType].description}</p>
          
          <div className="text-xs">
            <div className="font-bold mb-1">Cost:</div>
            <div className="grid grid-cols-2 gap-1">
              {Object.entries(BUILDING_INFO[selectedBuildingType].cost).map(([resource, amount]) => 
                amount > 0 ? (
                  <div key={resource} className="text-gray-700">
                    {resource}: {amount}
                  </div>
                ) : null
              )}
            </div>
          </div>

          <div className="text-xs mt-2">
            <div className="font-bold mb-1">Produces per turn:</div>
            <div className="grid grid-cols-2 gap-1">
              {Object.entries(BUILDING_INFO[selectedBuildingType].production).map(([resource, amount]) => 
                amount ? (
                  <div key={resource} className="text-green-700 font-bold">
                    +{amount} {resource}
                  </div>
                ) : null
              )}
            </div>
          </div>

          <button
            onClick={() => selectBuildingType(null)}
            className="mt-2 w-full p-1 bg-gray-200 hover:bg-gray-300 rounded text-xs font-bold"
          >
            Cancel (Esc)
          </button>
        </div>
      )}
    </div>
  );
}
