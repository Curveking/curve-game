import React, { useState, useEffect, useRef, useReducer, useCallback, useMemo } from 'react';
import { gameReducer, ACTIONS } from './gameLogic/gameReducer';
import { initializeGame, ARCHETYPES } from './gameLogic/helpers';
import Card from './components/Card';
import UnitDisplay from './components/UnitDisplay';
import GameBoard from './components/GameBoard';
import PlayerHand from './components/PlayerHand';
import CardModal from './components/CardModal';
import DeckSelection from './components/DeckSelection';
import GameMenu from './components/GameMenu';

// Game Constants
const ROWS = 5;
const COLS = 7;
const STARTING_HEALTH = 30;
const STARTING_HAND_SIZE = 3;
const MAX_MANA = 10;
const HAND_SIZE_LIMIT = 7;
const FATIGUE_DAMAGE = 1;

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Game Error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[600px] bg-gray-900 text-white p-4">
          <h1 className="text-2xl font-bold mb-4">Something went wrong.</h1>
          <p className="mb-4">{this.state.error && this.state.error.toString()}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
          >
            Reload Game
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Main Game Component
const CardBattleGame = () => {
  const [state, dispatch] = useReducer(gameReducer, null);
  const [gameMode, setGameMode] = useState('menu');
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [playerDeckChoices, setPlayerDeckChoices] = useState({ player1: null, player2: null });
  const [deckSelectionPhase, setDeckSelectionPhase] = useState(null);
  const timeoutRefs = useRef([]);
  const logRef = useRef(null);
  
  // Get background color based on current player's archetype
  const getBackgroundClass = useCallback(() => {
    if (!state) return 'bg-gray-900';
    const currentArchetype = state.players[state.currentPlayer].archetype;
    return `bg-gradient-to-b from-${ARCHETYPES[currentArchetype].color} to-gray-900`;
  }, [state]);
  
  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
    };
  }, []);
  
  // Auto-scroll game log
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [state?.log]);
  
  // AI Move Logic
  const findBestPosition = useCallback((card, currentBoard) => {
    const spawnRow = ROWS - 1;
    const availablePositions = [];
    
    for (let col = 0; col < COLS; col++) {
      if (!currentBoard[spawnRow][col]) {
        availablePositions.push({ row: spawnRow, col });
      }
    }
    
    if (availablePositions.length === 0) return null;
    
    const scoredPositions = availablePositions.map(pos => {
      let score = 0;
      
      let enemiesInColumn = 0;
      let alliedInColumn = 0;
      
      for (let row = 0; row < ROWS; row++) {
        const unit = currentBoard[row][pos.col];
        if (unit) {
          if (unit.playerIndex !== 1) {
            enemiesInColumn++;
            score += (10 - Math.abs(row - spawnRow));
          } else {
            alliedInColumn++;
          }
        }
      }
      
      score += enemiesInColumn * 5;
      score += alliedInColumn * 2;
      
      if (card.attack > 5) {
        score -= alliedInColumn * 3;
      }
      
      score += Math.random() * 3;
      
      return { ...pos, score };
    });
    
    scoredPositions.sort((a, b) => b.score - a.score);
    return scoredPositions[0];
  }, []);
  
  const makeAIMove = useCallback(async () => {
    if (!state || state.gameOver || state.currentPlayer !== 1 || state.isProcessingAI) return;
    
    dispatch({ type: ACTIONS.SET_AI_PROCESSING, payload: true });
    dispatch({ type: ACTIONS.ADD_LOG, payload: `Turn ${state.turn}: AI is thinking...` });
    
    const timeout1 = setTimeout(async () => {
      const aiPlayer = state.players[1];
      const playableCards = aiPlayer.hand.filter(card => card.cost <= aiPlayer.mana);
      
      if (playableCards.length === 0) {
        dispatch({ type: ACTIONS.ADD_LOG, payload: `Turn ${state.turn}: AI has no playable cards. Ending turn.` });
        await new Promise(resolve => setTimeout(resolve, 500));
        dispatch({ type: ACTIONS.END_TURN });
        dispatch({ type: ACTIONS.SET_AI_PROCESSING, payload: false });
        return;
      }
      
      // Sort cards by value
      playableCards.sort((a, b) => {
        const valueA = a.cost * (a.attack + a.health);
        const valueB = b.cost * (b.attack + b.health);
        return valueB - valueA;
      });
      
      // Play cards
      let manaLeft = aiPlayer.mana;
      const cardsToPlay = [];
      
      for (const card of playableCards) {
        if (card.cost <= manaLeft) {
          cardsToPlay.push(card);
          manaLeft -= card.cost;
        }
      }
      
      dispatch({ type: ACTIONS.ADD_LOG, payload: `Turn ${state.turn}: AI will play ${cardsToPlay.length} cards.` });
      
      // Play each card sequentially
      for (let i = 0; i < cardsToPlay.length; i++) {
        const card = cardsToPlay[i];
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const position = findBestPosition(card, state.board);
        
        if (position) {
          dispatch({ type: ACTIONS.SELECT_CARD, payload: { card } });
          await new Promise(resolve => setTimeout(resolve, 200));
          dispatch({ type: ACTIONS.PLACE_CARD, payload: position });
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      dispatch({ type: ACTIONS.END_TURN });
      dispatch({ type: ACTIONS.SET_AI_PROCESSING, payload: false });
    }, 1000);
    
    timeoutRefs.current.push(timeout1);
  }, [state, findBestPosition]);
  
  // Trigger AI move when it's AI's turn
  useEffect(() => {
    if (gameMode === 'ai' && 
        state && 
        state.currentPlayer === 1 && 
        !state.gameOver && 
        !state.isProcessingAI) {
      makeAIMove();
    }
  }, [state?.currentPlayer, state?.gameOver, state?.isProcessingAI, gameMode, makeAIMove]);
  
  // Deck selection logic
  const startDeckSelection = useCallback((mode) => {
    setGameMode(mode);
    setDeckSelectionPhase('player1');
    setPlayerDeckChoices({ player1: null, player2: null });
  }, []);

  const handleDeckSelect = useCallback((archetype) => {
    if (deckSelectionPhase === 'player1') {
      setPlayerDeckChoices(prev => ({ ...prev, player1: archetype }));
      
      if (gameMode === 'ai') {
        // AI randomly selects a deck
        const archetypes = Object.keys(ARCHETYPES);
        const aiArchetype = archetypes[Math.floor(Math.random() * archetypes.length)];
        
        // Start game immediately for AI mode
        const initialState = initializeGame(archetype, aiArchetype);
        initialState.gameMode = gameMode;
        
        dispatch({ 
          type: ACTIONS.START_GAME, 
          payload: initialState
        });
        setDeckSelectionPhase(null);
      } else {
        // 1v1 mode - player 2 selects deck
        setDeckSelectionPhase('player2');
      }
    } else if (deckSelectionPhase === 'player2') {
      setPlayerDeckChoices(prev => ({ ...prev, player2: archetype }));
      
      // Start game with both players' deck choices
      const initialState = initializeGame(playerDeckChoices.player1, archetype);
      initialState.gameMode = gameMode;
      
      dispatch({ 
        type: ACTIONS.START_GAME, 
        payload: initialState
      });
      setDeckSelectionPhase(null);
    }
  }, [deckSelectionPhase, gameMode, playerDeckChoices.player1]);

  const backToMenu = useCallback(() => {
    setGameMode('menu');
    setDeckSelectionPhase(null);
    setPlayerDeckChoices({ player1: null, player2: null });
  }, []);
  
  // Main render logic
  if (gameMode === 'menu') {
    return <GameMenu onStart1v1={() => startDeckSelection('1v1')} onStartAI={() => startDeckSelection('ai')} />;
  }

  if (deckSelectionPhase) {
    return (
      <DeckSelection 
        onSelectDeck={handleDeckSelect} 
        onBack={backToMenu}
      />
    );
  }

  if (!state) {
    return null;
  }

  // Game UI rendering
  return (
    <div className={`min-h-screen ${getBackgroundClass()} text-white p-4`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
            CURVE GAME
          </h1>
          <button
            onClick={backToMenu}
            className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-sm transition-colors"
          >
            Menu
          </button>
        </div>
        
        {/* Main game container with flex layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left section - Game board and controls */}
          <div className="flex-1">
            {/* Game Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                state.currentPlayer === 0 ? 'border-blue-400 shadow-lg shadow-blue-500/30' : 'border-blue-700'
              } bg-gradient-to-br from-blue-800 to-blue-900`}>
                <div className="text-white font-bold flex items-center gap-2">
                  <span className="text-lg">{ARCHETYPES[state.players[0].archetype].icon}</span>
                  Player 1 - {ARCHETYPES[state.players[0].archetype].name}
                </div>
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="text-red-400">❤️</div>
                    <div className="w-32 h-3 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-red-500 transition-all duration-300"
                        style={{ width: `${(state.players[0].health / STARTING_HEALTH) * 100}%` }}
                      />
                    </div>
                    <span className="text-white text-sm">{state.players[0].health}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white text-sm">
                    <span className="text-blue-400">💎</span>
                    {state.players[0].mana}/{state.players[0].manaCapacity}
                  </div>
                  <div className="flex items-center gap-2 text-white text-sm">
                    <span className="text-gray-400">📚</span>
                    {state.players[0].deck.length} cards
                  </div>
                </div>
              </div>
              
              <div className="p-3 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg border-2 border-gray-600">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">Turn {state.turn}</div>
                  <div className="text-white mt-2">{state.message}</div>
                  <div className="text-sm text-gray-400 mt-1">
                    {state.currentPlayer === 0 ? 'Player 1' : (state.gameMode === 'ai' ? 'AI' : 'Player 2')}'s Turn
                  </div>
                </div>
              </div>
              
              <div className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                state.currentPlayer === 1 ? 'border-red-400 shadow-lg shadow-red-500/30' : 'border-red-700'
              } bg-gradient-to-br from-red-800 to-red-900`}>
                <div className="text-white font-bold flex items-center gap-2">
                  <span className="text-lg">{ARCHETYPES[state.players[1].archetype].icon}</span>
                  {state.gameMode === 'ai' ? '🤖 AI' : 'Player 2'} - {ARCHETYPES[state.players[1].archetype].name}
                </div>
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="text-red-400">❤️</div>
                    <div className="w-32 h-3 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-red-500 transition-all duration-300"
                        style={{ width: `${(state.players[1].health / STARTING_HEALTH) * 100}%` }}
                      />
                    </div>
                    <span className="text-white text-sm">{state.players[1].health}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white text-sm">
                    <span className="text-blue-400">💎</span>
                    {state.players[1].mana}/{state.players[1].manaCapacity}
                  </div>
                  <div className="flex items-center gap-2 text-white text-sm">
                    <span className="text-gray-400">📚</span>
                    {state.players[1].deck.length} cards
                  </div>
                </div>
              </div>
            </div>
            
            {/* Game Board */}
            <div className="w-full aspect-[7/5] max-w-4xl mx-auto mb-6">
              <GameBoard
                board={state.board}
                onCellClick={(row, col) => {
                  if (!state?.selectedCard) return;
                  dispatch({ type: ACTIONS.PLACE_CARD, payload: { row, col } });
                }}
                onUnitClick={setSelectedUnit}
                currentPlayer={state.currentPlayer}
                selectedCard={state.selectedCard}
              />
            </div>
            
            {/* Current Player's Hand */}
            <PlayerHand
              player={state.players[state.currentPlayer]}
              currentPlayer={state.currentPlayer}
              onCardSelect={card => {
                if (state?.gameMode === 'ai' && state?.currentPlayer === 1) return;
                dispatch({ type: ACTIONS.SELECT_CARD, payload: { card } });
              }}
              gameMode={state.gameMode}
              selectedCard={state.selectedCard}
              isProcessingAI={state.isProcessingAI}
            />
            
            {/* Controls */}
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => dispatch({ type: ACTIONS.END_TURN })}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 px-6 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-bold shadow-lg transition-all duration-200 transform hover:scale-105"
                disabled={state.gameOver || (state.gameMode === 'ai' && state.currentPlayer === 1) || state.isProcessingAI}
              >
                End Turn
              </button>
              
              {state.gameOver && (
                <button
                  onClick={() => {
                    const newGame = initializeGame(state.players[0].archetype, state.players[1].archetype);
                    newGame.gameMode = state.gameMode;
                    dispatch({ type: ACTIONS.START_GAME, payload: newGame });
                  }}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 px-6 py-3 rounded-lg font-bold shadow-lg transition-all duration-200 transform hover:scale-105"
                >
                  Restart Game
                </button>
              )}
            </div>
          </div>
          
          {/* Right section - Game Log */}
          <div className="w-full lg:w-96">
            <div className="bg-gray-800/50 rounded-xl p-4 sticky top-4">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <span className="text-gray-400">📜</span>
                Game Log
              </h3>
              <div 
                ref={logRef}
                className="bg-gray-900/70 border border-gray-700 rounded-lg p-4 h-[400px] overflow-y-auto text-sm font-mono custom-scrollbar"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#4B5563 #1F2937'
                }}
              >
                {(state.log || []).map((entry, index) => (
                  <div 
                    key={index} 
                    className={`mb-1 ${
                      entry.includes('damage') ? 'text-red-400' :
                      entry.includes('defeat') ? 'text-orange-400' :
                      entry.includes('draws') ? 'text-blue-400' :
                      entry.includes('Win') ? 'text-yellow-400 font-bold' :
                      'text-gray-300'
                    }`}
                  >
                    {entry}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Error display */}
        {state.error && (
          <div className="mt-4 p-4 bg-red-900 border border-red-700 rounded">
            <p className="text-red-200">{state.error}</p>
          </div>
        )}
        
        {/* Loading indicator */}
        {state.isProcessingAI && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center backdrop-blur-sm">
            <div className="bg-gray-800 p-8 rounded-xl shadow-xl">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl">🤔</span>
                </div>
              </div>
              <p className="mt-4 text-white font-bold">AI is thinking...</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Card Modal for unit details */}
      {selectedUnit && (
        <CardModal 
          card={selectedUnit} 
          onClose={() => setSelectedUnit(null)} 
        />
      )}
    </div>
  );
};

// Export wrapped with error boundary
export default function App() {
  return (
    <ErrorBoundary>
      <CardBattleGame />
    </ErrorBoundary>
  );
}