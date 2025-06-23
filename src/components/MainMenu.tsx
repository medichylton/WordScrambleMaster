import React, { useState } from 'react';
import { useGame } from '../hooks/useGame';
import { DifficultyStake, DIFFICULTY_STAKES } from '../types/game';

export function MainMenu() {
  const { startGame } = useGame();
  const [selectedStake, setSelectedStake] = useState<DifficultyStake>('apprentice');

  const handleStartGame = () => {
    startGame(selectedStake);
  };

  return (
    <div className="h-screen overflow-y-auto flex items-center justify-center p-4">
      <div className="max-w-xl w-full space-y-6">
        {/* Game Title */}
        <div className="text-center space-y-3">
          <h1 className="text-2xl md:text-4xl font-bold gradient-text">
            WORD SCRAMBLE
          </h1>
          <h2 className="text-lg md:text-2xl font-medium text-white">
            MASTER
          </h2>
          <p className="text-xs text-gray-300">
            A RETRO WORD ADVENTURE
          </p>
        </div>

        {/* Game Features */}
        <div className="card space-y-4">
          <h3 className="text-sm md:text-lg font-bold text-center">GAME FEATURES</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FeatureCard
              icon="🎯"
              title="Strategic Challenges"
              description="Face three types of word challenges with escalating difficulty"
            />
            <FeatureCard
              icon="⚡"
              title="Power-Up System"
              description="Collect letter enhancers and word multipliers to boost your score"
            />
            <FeatureCard
              icon="🏪"
              title="Strategic Shopping"
              description="Spend coins between rounds to buy powerful upgrades"
            />
            <FeatureCard
              icon="🏆"
              title="Progressive Difficulty"
              description="Choose your stake level and work through 8 challenging rounds"
            />
          </div>
        </div>

        {/* Difficulty Selection */}
        <div className="card space-y-3">
          <h3 className="text-sm md:text-lg font-bold text-center">CHOOSE DIFFICULTY</h3>
          
          <div className="space-y-1">
            {(Object.keys(DIFFICULTY_STAKES) as DifficultyStake[]).map(stake => (
              <label key={stake} className="flex items-center space-x-2 p-2 border border-gray-600 bg-gray-800 cursor-pointer hover:bg-gray-700 transition-colors">
                <input
                  type="radio"
                  name="difficulty"
                  value={stake}
                  checked={selectedStake === stake}
                  onChange={(e) => setSelectedStake(e.target.value as DifficultyStake)}
                  className="w-3 h-3 text-blue-600"
                />
                <div className="flex-1">
                  <div className="font-semibold text-white text-xs">{DIFFICULTY_STAKES[stake].name.toUpperCase()}</div>
                  <div className="text-xs text-gray-300">{DIFFICULTY_STAKES[stake].description.toUpperCase()}</div>
                </div>
                <div className="text-xs text-gray-400">
                  {DIFFICULTY_STAKES[stake].scoreMultiplier}X SCORE
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Start Button */}
        <div className="text-center">
          <button
            onClick={handleStartGame}
            className="btn btn-primary text-sm md:text-lg px-6 py-3"
          >
            ▶️ START GAME
          </button>
        </div>
      </div>
    </div>
  );
}

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="flex items-start space-x-2 p-3 bg-gray-800 border border-gray-600">
      <div className="text-lg">{icon}</div>
      <div>
        <h4 className="font-semibold text-xs text-white">{title.toUpperCase()}</h4>
        <p className="text-gray-300 text-xs">{description.toUpperCase()}</p>
      </div>
    </div>
  );
} 