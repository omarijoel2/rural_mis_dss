import { useEffect } from "react";
import { useSustainability } from "./lib/stores/useSustainability";
import { useAudio } from "./lib/stores/useAudio";
import { GameMenu } from "./components/GameMenu";
import { GameUI } from "./components/GameUI";
import { GameBoard } from "./components/GameBoard";
import { Tutorial } from "./components/Tutorial";
import "@fontsource/inter";
import { createPortal } from "react-dom";

function SoundManager() {
  const { setHitSound, setSuccessSound, setBackgroundMusic, isMuted } = useAudio();

  useEffect(() => {
    const hitSound = new Audio("/sounds/hit.mp3");
    const successSound = new Audio("/sounds/success.mp3");
    const backgroundMusic = new Audio("/sounds/background.mp3");

    backgroundMusic.loop = true;
    backgroundMusic.volume = 0.3;

    setHitSound(hitSound);
    setSuccessSound(successSound);
    setBackgroundMusic(backgroundMusic);

    return () => {
      hitSound.pause();
      successSound.pause();
      backgroundMusic.pause();
    };
  }, [setHitSound, setSuccessSound, setBackgroundMusic]);

  useEffect(() => {
    const { backgroundMusic } = useAudio.getState();
    if (backgroundMusic) {
      if (!isMuted) {
        backgroundMusic.play().catch(err => console.log("Background music autoplay prevented:", err));
      } else {
        backgroundMusic.pause();
      }
    }
  }, [isMuted]);

  return null;
}

function GameBoardPortal() {
  const container = document.getElementById('game-board-container');
  if (!container) return null;
  return createPortal(<GameBoard />, container);
}

function App() {
  const { phase } = useSustainability();

  return (
    <>
      <SoundManager />
      <Tutorial />
      
      {phase === "menu" && <GameMenu />}
      {phase === "playing" && (
        <>
          <GameUI />
          <GameBoardPortal />
        </>
      )}
      {phase === "ended" && <GameUI />}
    </>
  );
}

export default App;
