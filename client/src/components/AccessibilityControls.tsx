import { useSustainability } from "@/lib/stores/useSustainability";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, HelpCircle, Type } from "lucide-react";

export function AccessibilityControls() {
  const {
    fontSize,
    soundEnabled,
    increaseFontSize,
    decreaseFontSize,
    toggleSound,
    toggleTutorial
  } = useSustainability();

  return (
    <div className="bg-white p-3 rounded-lg shadow-lg border-2 border-gray-300 flex flex-wrap gap-2 items-center">
      <div className="flex items-center gap-1">
        <Button
          onClick={decreaseFontSize}
          variant="outline"
          size="sm"
          className="h-8 px-2"
          aria-label="Decrease font size"
        >
          <Type className="w-3 h-3" />
          <span className="text-xs ml-1">A-</span>
        </Button>
        <Button
          onClick={increaseFontSize}
          variant="outline"
          size="sm"
          className="h-8 px-2"
          aria-label="Increase font size"
        >
          <Type className="w-4 h-4" />
          <span className="text-xs ml-1">A+</span>
        </Button>
      </div>

      <Button
        onClick={toggleSound}
        variant="outline"
        size="sm"
        className="h-8 px-3"
        aria-label={soundEnabled ? "Mute sounds" : "Enable sounds"}
        aria-pressed={soundEnabled}
      >
        {soundEnabled ? (
          <>
            <Volume2 className="w-4 h-4" />
            <span className="text-xs ml-1">Sound On</span>
          </>
        ) : (
          <>
            <VolumeX className="w-4 h-4" />
            <span className="text-xs ml-1">Sound Off</span>
          </>
        )}
      </Button>

      <Button
        onClick={toggleTutorial}
        variant="outline"
        size="sm"
        className="h-8 px-3"
        aria-label="Open tutorial"
      >
        <HelpCircle className="w-4 h-4" />
        <span className="text-xs ml-1">Help</span>
      </Button>

      <div className="text-xs text-gray-600 ml-auto">
        Font: {fontSize}px
      </div>
    </div>
  );
}
