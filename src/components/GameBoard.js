
// GameBoard component for rendering the battlefield grid and units
import React from 'react';
import UnitDisplay from './UnitDisplay';

// Cell component for each board cell
const Cell = React.memo(({ unit, row, col, onClick, onUnitClick, isSpawnRow, isPlayer1Spawn, isPlayer2Spawn, isCurrentPlayerSpawn, selectedCard }) => {
  const cellColor = isPlayer1Spawn ? 'bg-blue-900/40' : isPlayer2Spawn ? 'bg-red-900/40' : 'bg-gray-800/40';
  const hoverColor = isCurrentPlayerSpawn && selectedCard ? 'hover:bg-green-800/60' : '';
  const borderColor = isCurrentPlayerSpawn && selectedCard ? 'border-green-500 border-4' : 'border-gray-700 border-2';
  const handleClick = (e) => {
    if (unit && onUnitClick) {
      e.stopPropagation();
      onUnitClick(unit);
    } else {
      onClick(row, col);
    }
  };
  return (
    <div
      onClick={handleClick}
      className={`w-24 h-28 flex items-center justify-center relative transition-all duration-200
        ${cellColor} ${hoverColor} ${borderColor}
        ${isCurrentPlayerSpawn && selectedCard ? 'cursor-pointer' : ''}
        ${unit ? 'cursor-pointer' : ''}
      `}
    >
      {unit && (
        <UnitDisplay unit={unit} />
      )}
      {/* Spawn row indicators */}
      {!unit && isPlayer1Spawn && (
        <div className="absolute inset-0 flex items-center justify-center opacity-40">
          <span className="text-blue-400 text-sm font-bold">P1 Spawn</span>
        </div>
      )}
      {!unit && isPlayer2Spawn && (
        <div className="absolute inset-0 flex items-center justify-center opacity-40">
          <span className="text-red-400 text-sm font-bold">P2 Spawn</span>
        </div>
      )}
    </div>
  );
});

// GameBoard main component
const GameBoard = ({ board, onCellClick, onUnitClick, currentPlayer, selectedCard }) => {
  return (
    <div className="w-full h-full grid grid-cols-7 gap-1 bg-gray-800/50 p-2 rounded-xl">
      {board.map((row, rowIndex) =>
        row.map((unit, colIndex) => {
          const isPlayer1Spawn = rowIndex === 0;
          const isPlayer2Spawn = rowIndex === 4;
          const isCurrentPlayerSpawn = (currentPlayer === 0 && isPlayer1Spawn) || (currentPlayer === 1 && isPlayer2Spawn);
          
          return (
            <Cell
              key={`${rowIndex}-${colIndex}`}
              unit={unit}
              row={rowIndex}
              col={colIndex}
              onClick={onCellClick}
              onUnitClick={onUnitClick}
              isSpawnRow={isPlayer1Spawn || isPlayer2Spawn}
              isPlayer1Spawn={isPlayer1Spawn}
              isPlayer2Spawn={isPlayer2Spawn}
              isCurrentPlayerSpawn={isCurrentPlayerSpawn}
              selectedCard={selectedCard}
            />
          );
        })
      )}
    </div>
  );
};

export default GameBoard; 
