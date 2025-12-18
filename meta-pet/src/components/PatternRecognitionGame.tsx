'use client';

import { useState, useEffect, useCallback } from 'react';
import { useStore } from '@/lib/store';
import { Button } from './ui/button';
import { Brain, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { generateMeditationPattern, validatePattern } from '@/lib/minigames';

const DIRECTION_ICONS = {
  0: ArrowUp,
  1: ArrowRight,
  2: ArrowDown,
  3: ArrowLeft,
};

const DIRECTION_COLORS = {
  0: 'bg-blue-500',
  1: 'bg-green-500',
  2: 'bg-yellow-500',
  3: 'bg-purple-500',
};

export function PatternRecognitionGame() {
  const genome = useStore(s => s.genome);
  const vitals = useStore(s => s.vitals);
  const updateMiniGameScore = useStore(s => s.updateMiniGameScore);

  const [gameState, setGameState] = useState<'ready' | 'showing' | 'input' | 'result'>('ready');
  const [pattern, setPattern] = useState<number[]>([]);
  const [userInput, setUserInput] = useState<number[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [difficulty, setDifficulty] = useState(4);
  const [result, setResult] = useState<{ correct: boolean; accuracy: number } | null>(null);

  const generateNewPattern = useCallback(() => {
    if (!genome) return;
    
    const genomeSeed = genome.red60.slice(0, 10).reduce((sum, val) => sum + val, 0);
    const newPattern = generateMeditationPattern(genomeSeed + Date.now(), difficulty);
    setPattern(newPattern);
    setUserInput([]);
    setCurrentIndex(0);
    setResult(null);
    setGameState('showing');
  }, [genome, difficulty]);

  useEffect(() => {
    if (gameState === 'showing' && currentIndex < pattern.length) {
      const timer = setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
      }, 800);
      return () => clearTimeout(timer);
    } else if (gameState === 'showing' && currentIndex >= pattern.length) {
      setTimeout(() => {
        setGameState('input');
        setCurrentIndex(0);
      }, 500);
    }
  }, [gameState, currentIndex, pattern.length]);

  const handleDirectionInput = (direction: number) => {
    if (gameState !== 'input') return;

    const newInput = [...userInput, direction];
    setUserInput(newInput);

    if (newInput.length === pattern.length) {
      const validation = validatePattern(pattern, newInput);
      setResult(validation);
      setGameState('result');

      if (validation.correct) {
        const score = difficulty * 2 + Math.floor(vitals.mood / 10);
        updateMiniGameScore('memory', score);
      }
    }
  };

  const handleReset = () => {
    setGameState('ready');
    setPattern([]);
    setUserInput([]);
    setCurrentIndex(0);
    setResult(null);
  };

  if (!genome) {
    return (
      <div className="text-center py-8 text-zinc-500">
        <Brain className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>Generate a pet first to play</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
          <Brain className="w-6 h-6 text-purple-400" />
          Pattern Recognition
        </h2>
        <p className="text-sm text-zinc-400 mt-2">
          Watch the pattern, then repeat it from memory
        </p>
      </div>

      {/* Difficulty Selector */}
      {gameState === 'ready' && (
        <div className="space-y-3">
          <label className="text-sm text-zinc-400 block">Difficulty Level</label>
          <div className="flex gap-2">
            {[3, 4, 5, 6, 7, 8].map(level => (
              <Button
                key={level}
                onClick={() => setDifficulty(level)}
                variant={difficulty === level ? 'default' : 'outline'}
                size="sm"
              >
                {level}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Pattern Display */}
      <div className="bg-zinc-900/60 rounded-lg p-6 border border-zinc-700 min-h-[200px] flex items-center justify-center">
        {gameState === 'ready' && (
          <Button onClick={generateNewPattern} size="lg">
            Start Game
          </Button>
        )}

        {gameState === 'showing' && (
          <div className="space-y-4">
            <p className="text-sm text-zinc-400 text-center">Watch carefully...</p>
            <div className="flex gap-3 justify-center flex-wrap">
              {pattern.map((dir, idx) => {
                const Icon = DIRECTION_ICONS[dir as keyof typeof DIRECTION_ICONS];
                const isActive = idx === currentIndex - 1;
                return (
                  <div
                    key={idx}
                    className={`
                      w-16 h-16 rounded-lg flex items-center justify-center transition-all duration-300
                      ${isActive ? DIRECTION_COLORS[dir as keyof typeof DIRECTION_COLORS] : 'bg-zinc-800'}
                      ${isActive ? 'scale-110 shadow-lg' : 'scale-100 opacity-40'}
                    `}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {gameState === 'input' && (
          <div className="space-y-6 w-full">
            <p className="text-sm text-zinc-400 text-center">Your turn! Repeat the pattern:</p>
            
            {/* User Input Display */}
            <div className="flex gap-2 justify-center flex-wrap min-h-[80px]">
              {userInput.map((dir, idx) => {
                const Icon = DIRECTION_ICONS[dir as keyof typeof DIRECTION_ICONS];
                return (
                  <div
                    key={idx}
                    className={`
                      w-12 h-12 rounded-lg flex items-center justify-center
                      ${DIRECTION_COLORS[dir as keyof typeof DIRECTION_COLORS]}
                    `}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                );
              })}
              {Array.from({ length: pattern.length - userInput.length }).map((_, idx) => (
                <div
                  key={`empty-${idx}`}
                  className="w-12 h-12 rounded-lg border-2 border-dashed border-zinc-700"
                />
              ))}
            </div>

            {/* Input Buttons */}
            <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
              <div />
              <Button
                onClick={() => handleDirectionInput(0)}
                className="w-full h-16 bg-blue-500 hover:bg-blue-600"
              >
                <ArrowUp className="w-8 h-8" />
              </Button>
              <div />
              
              <Button
                onClick={() => handleDirectionInput(3)}
                className="w-full h-16 bg-purple-500 hover:bg-purple-600"
              >
                <ArrowLeft className="w-8 h-8" />
              </Button>
              <Button
                onClick={() => handleDirectionInput(2)}
                className="w-full h-16 bg-yellow-500 hover:bg-yellow-600"
              >
                <ArrowDown className="w-8 h-8" />
              </Button>
              <Button
                onClick={() => handleDirectionInput(1)}
                className="w-full h-16 bg-green-500 hover:bg-green-600"
              >
                <ArrowRight className="w-8 h-8" />
              </Button>
            </div>
          </div>
        )}

        {gameState === 'result' && result && (
          <div className="text-center space-y-4">
            {result.correct ? (
              <>
                <div className="text-6xl mb-4">✨</div>
                <h3 className="text-2xl font-bold text-green-400">Perfect!</h3>
                <p className="text-zinc-300">You remembered the entire pattern!</p>
              </>
            ) : (
              <>
                <div className="text-6xl mb-4">💭</div>
                <h3 className="text-2xl font-bold text-yellow-400">Almost!</h3>
                <p className="text-zinc-300">
                  Accuracy: {result.accuracy.toFixed(0)}%
                </p>
              </>
            )}
            
            <div className="flex gap-3 justify-center pt-4">
              <Button onClick={handleReset} variant="outline">
                New Game
              </Button>
              <Button onClick={generateNewPattern}>
                Same Level
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-zinc-800/40 rounded-lg p-3">
          <p className="text-xs text-zinc-500">Pattern Length</p>
          <p className="text-lg font-bold text-white">{pattern.length}</p>
        </div>
        <div className="bg-zinc-800/40 rounded-lg p-3">
          <p className="text-xs text-zinc-500">Your Progress</p>
          <p className="text-lg font-bold text-white">{userInput.length}</p>
        </div>
        <div className="bg-zinc-800/40 rounded-lg p-3">
          <p className="text-xs text-zinc-500">Difficulty</p>
          <p className="text-lg font-bold text-white">{difficulty}</p>
        </div>
      </div>
    </div>
  );
}
