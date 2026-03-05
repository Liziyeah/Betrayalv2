import { useState } from "react";
import HomeScreen from "../imports/HomeScreen";
import ConSesionAbierta from "../imports/ConSesionAbierta";
import JoinGameModal from "../imports/Group11";
import WaitingRoom from "../imports/Group15";
import MissionAssignment from "../imports/Group17";
import ResultsScreen from "../imports/Group18";
import SecretNumber from "./components/SecretNumber";
import ChallengePhase from "./components/ChallengePhase";
import ActionSelection from "./components/ActionSelection";
import PlayerSelection from "./components/PlayerSelection";
import RoleAdivino from "./components/RoleAdivino";
import RoleAngel from "./components/RoleAngel";
import RoleTraidor from "./components/RoleTraidor";
import RoleInvestigador from "./components/RoleInvestigador";
import RoleDiplomatico from "./components/RoleDiplomatico";

type Screen = 
  | "home" 
  | "logged-in-home" 
  | "join-modal" 
  | "waiting-room" 
  | "mission-assignment" 
  | "secret-number"
  | "role-adivino"
  | "role-angel"
  | "role-traidor"
  | "role-investigador"
  | "role-diplomatico"
  | "challenge-phase"
  | "action-selection"
  | "player-selection"
  | "results";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("home");
  const [gameCode, setGameCode] = useState("000000");

  const handleCreateGame = () => {
    setCurrentScreen("waiting-room");
  };

  const handleJoinGame = () => {
    setCurrentScreen("join-modal");
  };

  const handleJoinSubmit = () => {
    setCurrentScreen("waiting-room");
  };

  const handleCancelJoin = () => {
    setCurrentScreen("home");
  };

  const handleStartGame = () => {
    setCurrentScreen("mission-assignment");
  };

  const handleContinueToGame = () => {
    setCurrentScreen("secret-number");
  };

  const handleContinueToChallenge = () => {
    setCurrentScreen("challenge-phase");
  };

  const handleContinueToActionSelection = () => {
    setCurrentScreen("action-selection");
  };

  const handleConfirmAction = () => {
    setCurrentScreen("player-selection");
  };

  const handleConfirmPlayerSelection = () => {
    setCurrentScreen("results");
  };

  const handleResultsToContinue = () => {
    // Could go back to waiting room or to a new round
    setCurrentScreen("secret-number");
  };

  const handlePlay = () => {
    setCurrentScreen("waiting-room");
  };

  return (
    <div className="relative w-full h-screen bg-gray-900 flex items-center justify-center overflow-hidden">
      <div className="relative w-[158px] h-[348px] bg-white rounded-lg shadow-2xl overflow-hidden">
        {currentScreen === "home" && (
          <div className="relative w-full h-full" onClick={(e) => {
            const target = e.target as HTMLElement;
            
            // Check if clicked on "Crear partida" button
            if (target.closest('[data-name="Container"]') && 
                target.textContent?.includes("Crear partida")) {
              handleCreateGame();
            }
            
            // Check if clicked on "Unirse" button
            if (target.closest('[data-name="Container"]') && 
                target.textContent?.includes("Unirse") &&
                !target.textContent?.includes("Crear")) {
              handleJoinGame();
            }
          }}>
            <HomeScreen />
          </div>
        )}

        {currentScreen === "logged-in-home" && (
          <div className="relative w-full h-full" onClick={(e) => {
            const target = e.target as HTMLElement;
            
            // Check if clicked on "Jugar" button
            if (target.closest('[data-name="Container"]') && 
                target.textContent?.includes("Jugar")) {
              handlePlay();
            }
          }}>
            <ConSesionAbierta />
          </div>
        )}

        {currentScreen === "join-modal" && (
          <div className="relative w-full h-full" onClick={(e) => {
            const target = e.target as HTMLElement;
            
            // Check if clicked on "Unirse" button
            if (target.closest('[data-name="Button"]') && 
                target.textContent?.includes("Unirse") &&
                !target.textContent?.includes("partida")) {
              handleJoinSubmit();
            }
            
            // Check if clicked on "Cancelar" button
            if (target.closest('[data-name="Button"]') && 
                target.textContent?.includes("Cancelar")) {
              handleCancelJoin();
            }

            // Handle textbox click for code input
            if (target.closest('[data-name="Textbox"]')) {
              const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
              setGameCode(randomCode);
            }

            // Handle "Pegar" button
            if (target.textContent?.includes("Pegar")) {
              const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
              setGameCode(randomCode);
            }
          }}>
            <JoinGameModal />
          </div>
        )}

        {currentScreen === "waiting-room" && (
          <div className="relative w-full h-full" onClick={(e) => {
            const target = e.target as HTMLElement;
            
            // Check if clicked on "Empezar partida" button
            if (target.textContent?.includes("Empezar partida")) {
              handleStartGame();
            }
          }}>
            <WaitingRoom />
          </div>
        )}

        {currentScreen === "mission-assignment" && (
          <div className="relative w-full h-full" onClick={(e) => {
            const target = e.target as HTMLElement;
            
            // Check if clicked on "Continuar" button
            if (target.textContent?.includes("Continuar") && 
                target.closest('[data-name="Container"]')) {
              handleContinueToGame();
            }
          }}>
            <MissionAssignment />
          </div>
        )}

        {currentScreen === "secret-number" && (
          <div className="relative w-full h-full" onClick={(e) => {
            const target = e.target as HTMLElement;
            
            // Check if clicked on "Continuar" button
            if (target.textContent?.includes("Continuar") && 
                target.closest('[data-name="Container"]')) {
              handleContinueToChallenge();
            }
          }}>
            <SecretNumber />
          </div>
        )}

        {currentScreen === "role-adivino" && (
          <div className="relative w-full h-full" onClick={(e) => {
            const target = e.target as HTMLElement;
            
            // Check if clicked on "Continuar" button
            if (target.textContent?.includes("Continuar") && 
                target.closest('[data-name="Container"]')) {
              handleContinueToChallenge();
            }
          }}>
            <RoleAdivino />
          </div>
        )}

        {currentScreen === "role-angel" && (
          <div className="relative w-full h-full" onClick={(e) => {
            const target = e.target as HTMLElement;
            
            // Check if clicked on "Continuar" button
            if (target.textContent?.includes("Continuar") && 
                target.closest('[data-name="Container"]')) {
              handleContinueToChallenge();
            }
          }}>
            <RoleAngel />
          </div>
        )}

        {currentScreen === "role-traidor" && (
          <div className="relative w-full h-full" onClick={(e) => {
            const target = e.target as HTMLElement;
            
            // Check if clicked on "Continuar" button
            if (target.textContent?.includes("Continuar") && 
                target.closest('[data-name="Container"]')) {
              handleContinueToChallenge();
            }
          }}>
            <RoleTraidor />
          </div>
        )}

        {currentScreen === "role-investigador" && (
          <div className="relative w-full h-full" onClick={(e) => {
            const target = e.target as HTMLElement;
            
            // Check if clicked on "Continuar" button
            if (target.textContent?.includes("Continuar") && 
                target.closest('[data-name="Container"]')) {
              handleContinueToChallenge();
            }
          }}>
            <RoleInvestigador />
          </div>
        )}

        {currentScreen === "role-diplomatico" && (
          <div className="relative w-full h-full" onClick={(e) => {
            const target = e.target as HTMLElement;
            
            // Check if clicked on "Continuar" button
            if (target.textContent?.includes("Continuar") && 
                target.closest('[data-name="Container"]')) {
              handleContinueToChallenge();
            }
          }}>
            <RoleDiplomatico />
          </div>
        )}

        {currentScreen === "challenge-phase" && (
          <div className="relative w-full h-full" onClick={(e) => {
            const target = e.target as HTMLElement;
            
            // Check if clicked on "Continuar" button
            if (target.textContent?.includes("Continuar") && 
                target.closest('[data-name="Container"]')) {
              handleContinueToActionSelection();
            }
          }}>
            <ChallengePhase />
          </div>
        )}

        {currentScreen === "action-selection" && (
          <div className="relative w-full h-full" onClick={(e) => {
            const target = e.target as HTMLElement;
            
            // Check if clicked on "Confirmar acción" button
            if (target.textContent?.includes("Confirmar acción") && 
                target.closest('[data-name="Container"]')) {
              handleConfirmAction();
            }
          }}>
            <ActionSelection />
          </div>
        )}

        {currentScreen === "player-selection" && (
          <div className="relative w-full h-full" onClick={(e) => {
            const target = e.target as HTMLElement;
            
            // Check if clicked on "Confirmar acción" button
            if (target.textContent?.includes("Confirmar acción") && 
                target.closest('[data-name="Container"]')) {
              handleConfirmPlayerSelection();
            }
          }}>
            <PlayerSelection />
          </div>
        )}

        {currentScreen === "results" && (
          <div className="relative w-full h-full" onClick={(e) => {
            const target = e.target as HTMLElement;
            
            // Check if clicked on "Continuar" button
            if (target.textContent?.includes("Continuar") && 
                target.closest('[data-name="Container"]')) {
              handleResultsToContinue();
            }
          }}>
            <ResultsScreen />
          </div>
        )}
      </div>

      {/* Debug navigation */}
      <div className="absolute bottom-4 left-4 bg-black/80 text-white p-4 rounded-lg text-xs space-y-2 max-h-[90vh] overflow-y-auto z-50">
        <div className="font-bold mb-2">Current: {currentScreen}</div>
        <button
          onClick={() => setCurrentScreen("home")}
          className="block w-full text-left px-2 py-1 hover:bg-white/10 rounded"
        >
          Home Screen
        </button>
        <button
          onClick={() => setCurrentScreen("logged-in-home")}
          className="block w-full text-left px-2 py-1 hover:bg-white/10 rounded"
        >
          Logged In Home
        </button>
        <button
          onClick={() => setCurrentScreen("join-modal")}
          className="block w-full text-left px-2 py-1 hover:bg-white/10 rounded"
        >
          Join Modal
        </button>
        <button
          onClick={() => setCurrentScreen("waiting-room")}
          className="block w-full text-left px-2 py-1 hover:bg-white/10 rounded"
        >
          Waiting Room
        </button>
        <button
          onClick={() => setCurrentScreen("mission-assignment")}
          className="block w-full text-left px-2 py-1 hover:bg-white/10 rounded"
        >
          Mission Assignment
        </button>
        <div className="text-[10px] text-gray-500 mt-2 mb-1 font-bold">ROLES:</div>
        <button
          onClick={() => setCurrentScreen("secret-number")}
          className="block w-full text-left px-2 py-1 hover:bg-white/10 rounded"
        >
          Secret Number (Normal) ⭐
        </button>
        <button
          onClick={() => setCurrentScreen("role-adivino")}
          className="block w-full text-left px-2 py-1 hover:bg-white/10 rounded"
        >
          🔮 Adivino
        </button>
        <button
          onClick={() => setCurrentScreen("role-angel")}
          className="block w-full text-left px-2 py-1 hover:bg-white/10 rounded"
        >
          👼 Ángel
        </button>
        <button
          onClick={() => setCurrentScreen("role-traidor")}
          className="block w-full text-left px-2 py-1 hover:bg-white/10 rounded"
        >
          🗡️ Traidor
        </button>
        <button
          onClick={() => setCurrentScreen("role-investigador")}
          className="block w-full text-left px-2 py-1 hover:bg-white/10 rounded"
        >
          🔍 Investigador
        </button>
        <button
          onClick={() => setCurrentScreen("role-diplomatico")}
          className="block w-full text-left px-2 py-1 hover:bg-white/10 rounded"
        >
          🤝 Diplomático
        </button>
        <div className="text-[10px] text-gray-500 mt-2 mb-1 font-bold">GAMEPLAY:</div>
        <button
          onClick={() => setCurrentScreen("challenge-phase")}
          className="block w-full text-left px-2 py-1 hover:bg-white/10 rounded"
        >
          Challenge Phase ⭐
        </button>
        <button
          onClick={() => setCurrentScreen("action-selection")}
          className="block w-full text-left px-2 py-1 hover:bg-white/10 rounded"
        >
          Action Selection ⭐
        </button>
        <button
          onClick={() => setCurrentScreen("player-selection")}
          className="block w-full text-left px-2 py-1 hover:bg-white/10 rounded"
        >
          Player Selection ⭐
        </button>
        <button
          onClick={() => setCurrentScreen("results")}
          className="block w-full text-left px-2 py-1 hover:bg-white/10 rounded"
        >
          Results Screen 🏆
        </button>
      </div>
    </div>
  );
}
