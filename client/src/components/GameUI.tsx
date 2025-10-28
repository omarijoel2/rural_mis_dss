import { useSustainability } from "@/lib/stores/useSustainability";
import { Button } from "@/components/ui/button";
import { ResourceDisplay } from "./ResourceDisplay";
import { BuildingSelector } from "./BuildingSelector";
import { AccessibilityControls } from "./AccessibilityControls";
import { PlayCircle, RotateCcw, Home } from "lucide-react";

export function GameUI() {
  const { endTurn, resetGame, phase } = useSustainability();

  if (phase === "ended") {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
        <div className="bg-white p-8 rounded-lg shadow-2xl border-4 border-red-500 max-w-md text-center">
          <h2 className="text-3xl font-bold text-red-600 mb-4">Game Over!</h2>
          <p className="text-gray-700 mb-6">
            Your community ran out of resources. Better resource management
            and balanced building placement could help you survive longer!
          </p>
          <div className="space-y-2">
            <Button
              onClick={resetGame}
              className="w-full h-12 bg-green-600 hover:bg-green-700"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Try Again
            </Button>
            <Button
              onClick={resetGame}
              variant="outline"
              className="w-full"
            >
              <Home className="w-5 h-5 mr-2" />
              Back to Menu
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-green-50 via-blue-50 to-cyan-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
            EcoVillage Builder
          </h1>
          <AccessibilityControls />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="flex-1 flex items-center justify-center">
              {/* Game board will be imported here */}
              <div id="game-board-container"></div>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={endTurn}
                className="flex-1 h-12 text-lg font-bold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
              >
                <PlayCircle className="w-5 h-5 mr-2" />
                End Turn
              </Button>
              <Button
                onClick={resetGame}
                variant="outline"
                className="h-12"
              >
                <Home className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <ResourceDisplay />
            <BuildingSelector />
          </div>
        </div>
      </div>
    </div>
  );
}
