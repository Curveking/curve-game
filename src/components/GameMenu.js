// GameMenu component for the main menu screen
import React from 'react';
import { ARCHETYPES } from '../gameLogic/helpers';

const GameMenu = ({ onStart1v1, onStartAI }) => (
  <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-4">
    <div className="flex flex-col items-center justify-center min-h-[600px]">
      <div className="text-center mb-8">
        <h1 className="text-7xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
          CURVE GAME
        </h1>
        <h2 className="text-2xl text-gray-300">by Kustr</h2>
      </div>
      <div className="flex flex-col gap-4 w-64">
        <button
          onClick={onStart1v1}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold py-4 px-6 rounded-xl text-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/30"
        >
          1v1
        </button>
        <button
          onClick={onStartAI}
          className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-bold py-4 px-6 rounded-xl text-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg hover:shadow-green-500/30"
        >
          vs AI
        </button>
      </div>
      <div className="mt-10 text-gray-400 text-center max-w-md">
        <p className="mb-4">A strategic card battle game where you lead your chosen archetype's forces across the battlefield to victory!</p>
        {/* Archetype showcase */}
        <div className="grid grid-cols-2 gap-4 mt-8">
          {Object.entries(ARCHETYPES).map(([key, archetype]) => (
            <div 
              key={key} 
              className={`p-3 rounded-lg ${archetype.color} border-2 ${archetype.color.split(' ')[2]}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">{archetype.icon}</span>
                <span className="font-bold text-white">{archetype.name}</span>
              </div>
              <p className="text-xs text-gray-300">{archetype.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default GameMenu; 