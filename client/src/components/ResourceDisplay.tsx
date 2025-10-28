import { useSustainability } from "@/lib/stores/useSustainability";
import { Zap, Droplet, Apple, Package } from "lucide-react";

export function ResourceDisplay() {
  const { resources, turn, score, fontSize } = useSustainability();

  const resourceIcons = {
    energy: { icon: Zap, color: 'hsl(var(--energy-color))', pattern: '⚡', label: 'Energy' },
    water: { icon: Droplet, color: 'hsl(var(--water-color))', pattern: '💧', label: 'Water' },
    food: { icon: Apple, color: 'hsl(var(--food-color))', pattern: '🍎', label: 'Food' },
    materials: { icon: Package, color: 'hsl(var(--materials-color))', pattern: '📦', label: 'Materials' }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg border-2 border-gray-300" style={{ fontSize: `${fontSize}px` }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Resources</h2>
        <div className="text-right">
          <div className="text-sm text-gray-600">Turn: <span className="font-bold">{turn}</span></div>
          <div className="text-sm text-gray-600">Score: <span className="font-bold text-green-600">{score}</span></div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {Object.entries(resources).map(([key, value]) => {
          const resource = resourceIcons[key as keyof typeof resourceIcons];
          const Icon = resource.icon;
          
          return (
            <div
              key={key}
              className="flex items-center gap-2 p-3 rounded-lg border-2 transition-all"
              style={{
                borderColor: resource.color,
                backgroundColor: `${resource.color}15`
              }}
              role="status"
              aria-label={`${resource.label}: ${Math.floor(value)}`}
            >
              <Icon
                className="w-6 h-6 flex-shrink-0"
                style={{ color: resource.color }}
                aria-hidden="true"
              />
              <div className="flex-1">
                <div className="text-xs font-medium text-gray-600">{resource.label}</div>
                <div className="text-lg font-bold" style={{ color: resource.color }}>
                  {Math.floor(value)}
                </div>
              </div>
              <span className="text-xl" role="img" aria-hidden="true">
                {resource.pattern}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
