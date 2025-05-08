// Game reducer and action types for the card battle game
// Handles all state transitions for the game
import { advanceUnits, battleUnits, drawCardOrFatigue, checkWinCondition, MAX_MANA } from './helpers';

// Action Types for useReducer
export const ACTIONS = {
  START_GAME: 'START_GAME',
  PLACE_CARD: 'PLACE_CARD',
  SELECT_CARD: 'SELECT_CARD',
  END_TURN: 'END_TURN',
  BATTLE_PHASE: 'BATTLE_PHASE',
  ADD_LOG: 'ADD_LOG',
  SET_AI_PROCESSING: 'SET_AI_PROCESSING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Main game reducer
export const gameReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.START_GAME: {
      return {
        ...action.payload,
        log: ['New game started!']
      };
    }
    case ACTIONS.SELECT_CARD: {
      const { card } = action.payload;
      const currentPlayer = state.players[state.currentPlayer];
      if (card.cost > currentPlayer.mana) {
        return {
          ...state,
          message: 'Not enough mana!',
          selectedCard: null
        };
      }
      return {
        ...state,
        selectedCard: card,
        message: 'Select a spawn position'
      };
    }
    case ACTIONS.PLACE_CARD: {
      const { row, col } = action.payload;
      const currentPlayer = state.currentPlayer;
      const validRow = currentPlayer === 0 ? 0 : state.board.length - 1;
      if (!state.selectedCard || state.gameOver) return state;
      if (row !== validRow) {
        return {
          ...state,
          message: 'Must place on spawn row!'
        };
      }
      if (state.board[row][col]) {
        return {
          ...state,
          message: 'Cell occupied!'
        };
      }
      const newBoard = state.board.map(r => [...r]);
      const newPlayers = state.players.map(p => ({...p}));
      const player = newPlayers[currentPlayer];
      newBoard[row][col] = {
        ...state.selectedCard,
        playerIndex: currentPlayer
      };
      player.hand = player.hand.filter(c => c.id !== state.selectedCard.id);
      player.mana -= state.selectedCard.cost;
      return {
        ...state,
        board: newBoard,
        players: newPlayers,
        selectedCard: null,
        message: 'Unit placed!',
        log: [...state.log, `Turn ${state.turn}: Player ${currentPlayer + 1} placed ${state.selectedCard.name} at ${row},${col}`]
      };
    }
    case ACTIONS.BATTLE_PHASE: {
      // Process battle phase for current player
      let newState = battleUnits(state);
      
      // Check win conditions after battle
      if (!newState.gameOver) {
        const winResult = checkWinCondition(newState);
        if (winResult) {
          newState = { ...newState, ...winResult };
          newState.log = [...newState.log, winResult.message];
        }
      }
      
      return newState;
    }
    case ACTIONS.END_TURN: {
      // First, perform battle phase for current player
      let newState = battleUnits(state);
      newState.log = [...newState.log, `Turn ${state.turn}: Battle phase for Player ${state.currentPlayer + 1}`];
      
      // Check win conditions after battle
      if (!newState.gameOver) {
        const winResult = checkWinCondition(newState);
        if (winResult) {
          newState = { ...newState, ...winResult };
          newState.log = [...newState.log, winResult.message];
          return newState;
        }
      }
      
      // Switch to next player
      const nextPlayer = state.currentPlayer === 0 ? 1 : 0;
      newState = {
        ...newState,
        currentPlayer: nextPlayer,
        turn: nextPlayer === 0 ? state.turn + 1 : state.turn,
        isFirstTurn: nextPlayer === 1 ? false : state.isFirstTurn
      };
      
      // Draw phase for next player
      newState = drawCardOrFatigue(newState, nextPlayer);
      newState.log = [...newState.log, `Turn ${newState.turn}: Draw phase for Player ${nextPlayer + 1}`];
      
      // Advance phase for next player
      newState = advanceUnits(newState);
      newState.log = [...newState.log, `Turn ${newState.turn}: Advance phase for Player ${nextPlayer + 1}`];
      
      // Update mana for next player
      const player = newState.players[nextPlayer];
      const manaCapacity = player.manaCapacity < MAX_MANA ? player.manaCapacity + 1 : player.manaCapacity;
      newState.players = newState.players.map((p, idx) => 
        idx === nextPlayer ? { ...p, manaCapacity, mana: manaCapacity } : p
      );
      
      // Set message for play phase
      newState.message = nextPlayer === 1 && state.gameMode === 'ai' ? 
        'AI Turn: Play phase - Place your units!' : 
        `Player ${nextPlayer + 1} Turn: Play phase - Place your units!`;
      
      return newState;
    }
    case ACTIONS.ADD_LOG: {
      return {
        ...state,
        log: [...state.log, action.payload]
      };
    }
    case ACTIONS.SET_AI_PROCESSING: {
      return {
        ...state,
        isProcessingAI: action.payload
      };
    }
    case ACTIONS.SET_ERROR: {
      return {
        ...state,
        error: action.payload
      };
    }
    case ACTIONS.CLEAR_ERROR: {
      return {
        ...state,
        error: null
      };
    }
    default:
      return state;
  }
}; 