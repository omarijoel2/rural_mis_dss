import { useSustainability } from "@/lib/stores/useSustainability";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function Tutorial() {
  const { showTutorial, toggleTutorial, fontSize } = useSustainability();

  return (
    <Dialog open={showTutorial} onOpenChange={toggleTutorial}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" style={{ fontSize: `${fontSize}px` }}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">How to Play: EcoVillage</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <section>
            <h3 className="font-bold text-lg mb-2">🎯 Goal</h3>
            <p>Build a sustainable community by managing resources wisely and constructing eco-friendly buildings. Keep your community thriving for as long as possible!</p>
          </section>

          <section>
            <h3 className="font-bold text-lg mb-2">📊 Resources</h3>
            <ul className="space-y-1 ml-4">
              <li><span className="font-bold text-yellow-600">⚡ Energy:</span> Powers your community</li>
              <li><span className="font-bold text-blue-600">💧 Water:</span> Essential for life and farming</li>
              <li><span className="font-bold text-green-600">🍎 Food:</span> Feeds your community</li>
              <li><span className="font-bold text-orange-600">📦 Materials:</span> Used to build structures</li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold text-lg mb-2">🏗️ Buildings</h3>
            <div className="space-y-2">
              <div className="p-2 bg-yellow-50 border-l-4 border-yellow-500 rounded">
                <p><span className="text-xl">☀️</span> <strong>Solar Panel:</strong> Generates clean energy from sunlight</p>
              </div>
              <div className="p-2 bg-blue-50 border-l-4 border-blue-500 rounded">
                <p><span className="text-xl">🌀</span> <strong>Wind Turbine:</strong> Produces more energy from wind power</p>
              </div>
              <div className="p-2 bg-green-50 border-l-4 border-green-500 rounded">
                <p><span className="text-xl">🌱</span> <strong>Community Garden:</strong> Grows fresh organic produce</p>
              </div>
              <div className="p-2 bg-cyan-50 border-l-4 border-cyan-500 rounded">
                <p><span className="text-xl">💧</span> <strong>Rainwater Collector:</strong> Collects and stores water</p>
              </div>
              <div className="p-2 bg-orange-50 border-l-4 border-orange-500 rounded">
                <p><span className="text-xl">♻️</span> <strong>Recycling Center:</strong> Converts waste into materials</p>
              </div>
              <div className="p-2 bg-amber-50 border-l-4 border-amber-700 rounded">
                <p><span className="text-xl">🪴</span> <strong>Compost Bin:</strong> Transforms waste into soil and food</p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="font-bold text-lg mb-2">🎮 How to Play</h3>
            <ol className="space-y-2 ml-4 list-decimal">
              <li>Select a building from the "Build" panel on the right</li>
              <li>Click on an empty tile on the game board to place it</li>
              <li>Each building costs resources to build</li>
              <li>Click "End Turn" to produce resources from your buildings</li>
              <li>Buildings consume small amounts of energy and water each turn</li>
              <li>To remove a building, click on it and confirm</li>
              <li>Press Esc to cancel building placement</li>
            </ol>
          </section>

          <section>
            <h3 className="font-bold text-lg mb-2">♿ Accessibility</h3>
            <p>Use the accessibility controls to:</p>
            <ul className="ml-4 list-disc space-y-1">
              <li>Adjust font size with A+ and A- buttons</li>
              <li>Toggle sound effects on/off</li>
              <li>Navigate with keyboard using Tab and Enter keys</li>
              <li>All colors use colorblind-friendly patterns</li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold text-lg mb-2">💡 Tips</h3>
            <ul className="ml-4 list-disc space-y-1">
              <li>Start with solar panels and rainwater collectors for steady resources</li>
              <li>Balance your resource production - you need all four!</li>
              <li>Recycling centers help sustain material production</li>
              <li>Watch your resources before ending your turn</li>
              <li>The game ends if your total resources drop too low</li>
            </ul>
          </section>

          <Button onClick={toggleTutorial} className="w-full mt-4">
            Got it! Let's Play
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
