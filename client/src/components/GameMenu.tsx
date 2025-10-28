import { useSustainability } from "@/lib/stores/useSustainability";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, Recycle, Droplets } from "lucide-react";

export function GameMenu() {
  const { startGame, toggleTutorial } = useSustainability();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-green-100 p-4">
      <Card className="w-full max-w-2xl shadow-2xl">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center gap-3 mb-4">
            <Leaf className="w-12 h-12 text-green-600" />
            <Recycle className="w-12 h-12 text-blue-600" />
            <Droplets className="w-12 h-12 text-cyan-600" />
          </div>
          <CardTitle className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            EcoVillage
          </CardTitle>
          <p className="text-lg text-gray-600 mt-2">Build a Sustainable Community</p>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
            <h3 className="font-bold text-lg mb-2 text-green-800">Welcome, Community Builder!</h3>
            <p className="text-gray-700 leading-relaxed">
              Take a quick lunch break and build an eco-friendly village! Manage resources wisely,
              construct sustainable buildings, and keep your community thriving. Perfect for a
              10-15 minute break with your coworkers.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
              <div className="font-bold text-sm text-blue-900">♿ Accessible</div>
              <div className="text-xs text-blue-700">Colorblind-friendly with keyboard support</div>
            </div>
            <div className="p-3 bg-green-50 border-l-4 border-green-500 rounded">
              <div className="font-bold text-sm text-green-900">🌱 Educational</div>
              <div className="text-xs text-green-700">Learn sustainable practices</div>
            </div>
            <div className="p-3 bg-purple-50 border-l-4 border-purple-500 rounded">
              <div className="font-bold text-sm text-purple-900">⚡ Quick</div>
              <div className="text-xs text-purple-700">Perfect for lunch breaks</div>
            </div>
            <div className="p-3 bg-orange-50 border-l-4 border-orange-500 rounded">
              <div className="font-bold text-sm text-orange-900">🎮 Strategic</div>
              <div className="text-xs text-orange-700">Resource management fun</div>
            </div>
          </div>

          <div className="space-y-2">
            <Button
              onClick={startGame}
              className="w-full h-12 text-lg font-bold bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              size="lg"
            >
              Start New Game
            </Button>
            
            <Button
              onClick={toggleTutorial}
              variant="outline"
              className="w-full h-10"
            >
              How to Play
            </Button>
          </div>

          <div className="text-center text-xs text-gray-500 pt-2 border-t">
            💚 Colorblind-safe design • ♿ Fully accessible • 🔊 Sound toggle available
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
