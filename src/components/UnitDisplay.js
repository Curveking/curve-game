// UnitDisplay component for displaying a unit on the battlefield
import React, { useState } from 'react';
import { ARCHETYPES } from '../gameLogic/helpers';

const UnitDisplay = ({ unit }) => {
  const [showDetails, setShowDetails] = useState(false);
  const archetype = ARCHETYPES[unit.type];
  const healthPercent = (unit.health / unit.maxHealth) * 100;
  const isDamaged = unit.health < unit.maxHealth;
  const playerBorder = unit.playerIndex === 0 ? 'border-blue-500' : 'border-red-500';

  return (
    <div
      className={`
        relative w-full h-full flex flex-col
        transition-all duration-200 border-4 ${playerBorder}
        ${showDetails ? 'scale-105 shadow-lg' : ''}
        overflow-hidden rounded-lg
        pt-1 pr-1
      `}
      onMouseEnter={() => setShowDetails(true)}
      onMouseLeave={() => setShowDetails(false)}
    >
      {/* Top third - Archetype color with icon */}
      <div 
        className={`
          relative w-full h-[33.33%] flex items-center justify-center
          bg-gradient-to-br ${archetype.unitColor}
          z-0
        `}
      >
        {/* Mana Cost - Fixed at the edge of the card */}
        <div className="absolute -top-1 -right-1 bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg z-20 border-2 border-blue-400">
          {unit.cost}
        </div>
        <span className="text-3xl z-10">{archetype.icon}</span>
      </div>

      {/* Middle third - Effects area */}
      <div className="w-full h-[33.33%] bg-gray-800 flex items-center justify-center relative z-10">
        {/* Taunt Indicator - Centered in effects area */}
        {unit.hasTaunt && (
          <div className="flex items-center justify-center gap-1 text-yellow-400">
            <span className="text-lg">🛡️</span>
            <span className="text-sm">Taunt</span>
          </div>
        )}
      </div>

      {/* Bottom third - Stats area */}
      <div className="w-full h-[33.33%] bg-gray-800 flex items-center justify-center z-10">
        <div className="w-full bg-black/50 text-white text-xs px-2 py-1 flex justify-between">
          <div className="flex items-center gap-1">
            <span className="text-red-400">⚔️</span>
            <span className="text-red-400">{unit.attack}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-green-400">❤️</span>
            <span className="text-green-400">{unit.health}</span>
          </div>
        </div>
      </div>

      {/* Hover Tooltip */}
      {showDetails && (
        <div className="absolute z-50 bg-gray-900/95 p-3 rounded-lg shadow-xl -top-2 left-full ml-2 w-48 border border-gray-700">
          <div className="font-bold text-yellow-400 mb-1">{unit.name}</div>
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-400">Type:</span>
              <span className="text-white">{archetype.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Cost:</span>
              <span className="text-blue-400">{unit.cost}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Attack:</span>
              <span className="text-red-400">{unit.attack}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Health:</span>
              <span className="text-green-400">{unit.health}/{unit.maxHealth}</span>
            </div>
            {unit.hasTaunt && (
              <div className="text-yellow-400 text-sm mt-1">
                🛡️ Has Taunt: Enemies must attack this unit first
              </div>
            )}
            <div className="text-gray-400 text-xs mt-2">
              {unit.description}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnitDisplay; 