import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export type ResourceType = "energy" | "food" | "water" | "materials";

export type BuildingType = 
  | "solar_panel" 
  | "wind_turbine"
  | "community_garden" 
  | "rainwater_collector"
  | "recycling_center"
  | "compost_bin";

export interface Resources {
  energy: number;
  food: number;
  water: number;
  materials: number;
}

export interface Building {
  id: string;
  type: BuildingType;
  x: number;
  y: number;
  level: number;
}

export interface Tile {
  x: number;
  y: number;
  building: Building | null;
}

interface BuildingCost {
  energy: number;
  food: number;
  water: number;
  materials: number;
}

interface BuildingProduction {
  energy?: number;
  food?: number;
  water?: number;
  materials?: number;
}

export const BUILDING_INFO: Record<BuildingType, {
  name: string;
  cost: BuildingCost;
  production: BuildingProduction;
  description: string;
}> = {
  solar_panel: {
    name: "Solar Panel",
    cost: { energy: 0, food: 0, water: 0, materials: 15 },
    production: { energy: 3 },
    description: "Generates clean energy from sunlight"
  },
  wind_turbine: {
    name: "Wind Turbine",
    cost: { energy: 0, food: 0, water: 0, materials: 20 },
    production: { energy: 5 },
    description: "Harnesses wind power for electricity"
  },
  community_garden: {
    name: "Community Garden",
    cost: { energy: 2, food: 0, water: 3, materials: 10 },
    production: { food: 4 },
    description: "Grows fresh organic produce"
  },
  rainwater_collector: {
    name: "Rainwater Collector",
    cost: { energy: 1, food: 0, water: 0, materials: 8 },
    production: { water: 5 },
    description: "Collects and stores rainwater"
  },
  recycling_center: {
    name: "Recycling Center",
    cost: { energy: 5, food: 0, water: 2, materials: 12 },
    production: { materials: 3 },
    description: "Converts waste into usable materials"
  },
  compost_bin: {
    name: "Compost Bin",
    cost: { energy: 1, food: 2, water: 1, materials: 5 },
    production: { materials: 2, food: 1 },
    description: "Transforms organic waste into rich soil"
  }
};

export type GamePhase = "menu" | "playing" | "paused" | "ended";

interface SustainabilityState {
  phase: GamePhase;
  resources: Resources;
  buildings: Building[];
  tiles: Tile[][];
  turn: number;
  score: number;
  gridSize: number;
  selectedBuildingType: BuildingType | null;
  showTutorial: boolean;
  fontSize: number;
  soundEnabled: boolean;
  
  // Actions
  startGame: () => void;
  endTurn: () => void;
  placeBuilding: (x: number, y: number, type: BuildingType) => boolean;
  removeBuilding: (x: number, y: number) => void;
  selectBuildingType: (type: BuildingType | null) => void;
  canAffordBuilding: (type: BuildingType) => boolean;
  toggleTutorial: () => void;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  toggleSound: () => void;
  resetGame: () => void;
}

const GRID_SIZE = 8;
const STARTING_RESOURCES: Resources = {
  energy: 10,
  food: 10,
  water: 10,
  materials: 20
};

function createEmptyGrid(size: number): Tile[][] {
  const grid: Tile[][] = [];
  for (let y = 0; y < size; y++) {
    const row: Tile[] = [];
    for (let x = 0; x < size; x++) {
      row.push({ x, y, building: null });
    }
    grid.push(row);
  }
  return grid;
}

export const useSustainability = create<SustainabilityState>()(
  subscribeWithSelector((set, get) => ({
    phase: "menu",
    resources: { ...STARTING_RESOURCES },
    buildings: [],
    tiles: createEmptyGrid(GRID_SIZE),
    turn: 0,
    score: 0,
    gridSize: GRID_SIZE,
    selectedBuildingType: null,
    showTutorial: false,
    fontSize: 16,
    soundEnabled: true,
    
    startGame: () => {
      set({
        phase: "playing",
        resources: { ...STARTING_RESOURCES },
        buildings: [],
        tiles: createEmptyGrid(GRID_SIZE),
        turn: 0,
        score: 0,
        selectedBuildingType: null
      });
      console.log("Game started!");
    },
    
    endTurn: () => {
      const state = get();
      const newResources = { ...state.resources };
      let turnScore = 0;
      
      // Calculate production from all buildings
      state.buildings.forEach(building => {
        const info = BUILDING_INFO[building.type];
        if (info.production.energy) newResources.energy += info.production.energy;
        if (info.production.food) newResources.food += info.production.food;
        if (info.production.water) newResources.water += info.production.water;
        if (info.production.materials) newResources.materials += info.production.materials;
        
        // Add to score based on production
        turnScore += Object.values(info.production).reduce((a, b) => a + (b || 0), 0);
      });
      
      // Consumption per turn (community upkeep)
      const buildingCount = state.buildings.length;
      newResources.energy = Math.max(0, newResources.energy - buildingCount * 0.5);
      newResources.water = Math.max(0, newResources.water - buildingCount * 0.3);
      
      // Check for game over condition
      const totalResources = Object.values(newResources).reduce((a, b) => a + b, 0);
      if (totalResources < 5 && state.turn > 5) {
        set({ phase: "ended" });
        console.log("Game Over - Resources depleted!");
        return;
      }
      
      set({
        resources: newResources,
        turn: state.turn + 1,
        score: state.score + turnScore
      });
      
      console.log(`Turn ${state.turn + 1} completed. Score: +${turnScore}`);
    },
    
    placeBuilding: (x: number, y: number, type: BuildingType) => {
      const state = get();
      
      // Check if tile is valid
      if (x < 0 || x >= state.gridSize || y < 0 || y >= state.gridSize) {
        console.log("Invalid tile position");
        return false;
      }
      
      // Check if tile is empty
      if (state.tiles[y][x].building !== null) {
        console.log("Tile already occupied");
        return false;
      }
      
      // Check if player can afford it
      if (!state.canAffordBuilding(type)) {
        console.log("Cannot afford building");
        return false;
      }
      
      const cost = BUILDING_INFO[type].cost;
      const newResources = {
        energy: state.resources.energy - cost.energy,
        food: state.resources.food - cost.food,
        water: state.resources.water - cost.water,
        materials: state.resources.materials - cost.materials
      };
      
      const building: Building = {
        id: `${type}-${Date.now()}-${Math.random()}`,
        type,
        x,
        y,
        level: 1
      };
      
      const newTiles = state.tiles.map((row, rowIdx) =>
        row.map((tile, colIdx) => {
          if (rowIdx === y && colIdx === x) {
            return { ...tile, building };
          }
          return tile;
        })
      );
      
      set({
        buildings: [...state.buildings, building],
        tiles: newTiles,
        resources: newResources,
        selectedBuildingType: null
      });
      
      console.log(`Placed ${BUILDING_INFO[type].name} at (${x}, ${y})`);
      return true;
    },
    
    removeBuilding: (x: number, y: number) => {
      const state = get();
      const tile = state.tiles[y][x];
      
      if (!tile.building) {
        console.log("No building to remove");
        return;
      }
      
      const newTiles = state.tiles.map((row, rowIdx) =>
        row.map((tile, colIdx) => {
          if (rowIdx === y && colIdx === x) {
            return { ...tile, building: null };
          }
          return tile;
        })
      );
      
      const newBuildings = state.buildings.filter(
        b => !(b.x === x && b.y === y)
      );
      
      // Refund some materials
      const refund = Math.floor(BUILDING_INFO[tile.building.type].cost.materials / 2);
      
      set({
        buildings: newBuildings,
        tiles: newTiles,
        resources: {
          ...state.resources,
          materials: state.resources.materials + refund
        }
      });
      
      console.log(`Removed building at (${x}, ${y}), refunded ${refund} materials`);
    },
    
    selectBuildingType: (type: BuildingType | null) => {
      set({ selectedBuildingType: type });
      console.log(`Selected building type: ${type}`);
    },
    
    canAffordBuilding: (type: BuildingType) => {
      const state = get();
      const cost = BUILDING_INFO[type].cost;
      return (
        state.resources.energy >= cost.energy &&
        state.resources.food >= cost.food &&
        state.resources.water >= cost.water &&
        state.resources.materials >= cost.materials
      );
    },
    
    toggleTutorial: () => {
      set(state => ({ showTutorial: !state.showTutorial }));
    },
    
    increaseFontSize: () => {
      set(state => ({ fontSize: Math.min(state.fontSize + 2, 24) }));
    },
    
    decreaseFontSize: () => {
      set(state => ({ fontSize: Math.max(state.fontSize - 2, 12) }));
    },
    
    toggleSound: () => {
      set(state => ({ soundEnabled: !state.soundEnabled }));
    },
    
    resetGame: () => {
      set({
        phase: "menu",
        resources: { ...STARTING_RESOURCES },
        buildings: [],
        tiles: createEmptyGrid(GRID_SIZE),
        turn: 0,
        score: 0,
        selectedBuildingType: null
      });
      console.log("Game reset");
    }
  }))
);
