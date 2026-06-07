'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useEffect, useRef, useState } from 'react';

interface CrashBetControlsProps {
  gameState: 'betting' | 'flying' | 'crashed';
  currentMultiplier: number;
  onPlaceBet: (amount: number) => void;
  onCashout: () => void;
  userBet: number | null;
  userCashout: number | null;
  balance: number;
  onOpenBalanceModal?: () => void;
}

export default function CrashBetControls({
  gameState,
  currentMultiplier,
  onPlaceBet,
  onCashout,
  userBet,
  userCashout,
  balance,
  connected,
  onOpenBalanceModal
}: CrashBetControlsProps & { connected: boolean }) {
  const [betAmount, setBetAmount] = useState(0);
  const [cashoutAmount, setCashoutAmount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const minBet = 10;

  // Обновляем сумму вывода в реальном времени
  useEffect(() => {
    if (userBet && gameState === 'flying' && !userCashout) {
      const newCashoutAmount = userBet * currentMultiplier;
      setCashoutAmount(newCashoutAmount);
    }
  }, [userBet, currentMultiplier, gameState, userCashout]);

  // Cleanup timeout при размонтировании
  useEffect(() => {
    return () => {
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }
    };
  }, []);

  const handlePlaceBet = () => {
    if (betAmount < minBet || balance < betAmount || isProcessing) return;
    
    setIsProcessing(true);
    onPlaceBet(betAmount);
    
    // Сбрасываем состояние через 1 секунду
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
    }
    processingTimeoutRef.current = setTimeout(() => {
      setIsProcessing(false);
    }, 1000);
  };

  const handleQuickBet = (amount: number) => {
    if (balance >= amount && !isProcessing && connected) {
      setIsProcessing(true);
      onPlaceBet(amount);
      
      // Сбрасываем состояние через 1 секунду
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }
      processingTimeoutRef.current = setTimeout(() => {
        setIsProcessing(false);
      }, 1000);
    }
  };

  const handleCashout = () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    onCashout();
    
    // Сбрасываем состояние через 1 секунду
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
    }
    processingTimeoutRef.current = setTimeout(() => {
      setIsProcessing(false);
    }, 1000);
  };

  const quickBetAmounts = [10, 25, 50, 100, 250, 500];

  // Проверяем, можно ли делать ставку
  const canBet = gameState === 'betting' && balance >= betAmount && betAmount >= minBet && !isProcessing && connected;
  
  // Проверяем, можно ли выводить
  const canCashout = gameState === 'flying' && userBet && !userCashout && !isProcessing;

  return (
    <Card className="bg-gradient-to-b from-gray-800 to-gray-900 border-none rounded-xl shadow-xl px-2 sm:px-4 py-3 sm:py-6">
      <CardContent className="space-y-4">
        {/* Кнопка управления балансом */}
        <div className="flex justify-between items-center">
          <button
            onClick={onOpenBalanceModal}
            className="text-white font-bold hover:text-yellow-300 transition cursor-pointer"
          >
            Баланс: <span className="text-yellow-400">{balance.toFixed(2)} IC</span>
          </button>
        </div>
        {/* Быстрые ставки - всегда видимые */}
        <div>
          <p className="text-gray-400 text-sm mb-2">Быстрые ставки:</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {quickBetAmounts.map((amount) => (
              <Button
                key={amount}
                variant="outline"
                size="sm"
                className="text-white font-bold border-none bg-gradient-to-b from-yellow-500 to-yellow-600 rounded-xl shadow hover:from-yellow-400 hover:to-yellow-500 transition disabled:opacity-50 w-full"
                onClick={() => handleQuickBet(amount)}
                disabled={balance < amount || gameState !== 'betting' || isProcessing || !connected}
              >
                <span className="mr-1">{amount}</span>
                <span role="img" aria-label="coin">🪙</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Поле ввода ставки - всегда видимое */}
        <div className="flex flex-col gap-2">
          <label className="block text-xs text-gray-400 mb-1">Сумма ставки:</label>
          <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
            <input
              type="number"
              className="flex-1 bg-gray-900 text-white rounded px-3 py-2 outline-none border border-gray-700 focus:border-yellow-400 transition w-full"
              value={betAmount}
              min={0}
              max={balance}
              onChange={e => setBetAmount(Number(e.target.value))}
            />
            <div className="flex gap-2">
            <button
                className="px-2 py-1 bg-yellow-500 text-black rounded font-bold text-xs hover:bg-yellow-400 transition w-full sm:w-auto"
              onClick={() => setBetAmount(prev => Math.min(prev * 2 || 1, balance))}
              type="button"
            >
              x2
            </button>
            <button
                className="px-2 py-1 bg-yellow-500 text-black rounded font-bold text-xs hover:bg-yellow-400 transition w-full sm:w-auto"
              onClick={() => setBetAmount(Math.floor(balance))}
              type="button"
            >
              MAX
            </button>
            </div>
          </div>
        </div>

        {/* Кнопка ставки/вывода */}
        {gameState === 'betting' ? (
          <Button
            onClick={handlePlaceBet}
            className="w-full bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
            disabled={!canBet}
          >
            Сделать ставку {betAmount.toFixed(2)}
          </Button>
        ) : canCashout ? (
          <Button
            onClick={handleCashout}
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
          >
            Вывести {cashoutAmount.toFixed(2)}
          </Button>
        ) : userBet && userCashout ? (
          <Button disabled className="w-full bg-green-600 text-white">
            Выведено на {userCashout.toFixed(2)}x
          </Button>
        ) : userBet && gameState === 'crashed' ? (
          <Button disabled className="w-full bg-red-600 text-white">
            Ставка сгорела
          </Button>
        ) : (
          <Button disabled className="w-full bg-gray-600 text-white">
            Ожидание...
          </Button>
        )}

        {/* Информация о ставке */}
        {userBet && (
          <div className="p-3 bg-gray-700 rounded-lg">
            <p className="text-blue-400 text-sm">Ваша ставка: {userBet.toFixed(2)}</p>
            {userCashout ? (
              <p className="text-green-400 font-semibold">
                Выигрыш: {(userBet * userCashout).toFixed(2)}
              </p>
            ) : gameState === 'flying' && (
              <p className="text-yellow-400">
                Потенциал: {(userBet * currentMultiplier).toFixed(2)}
              </p>
            )}
            {gameState === 'crashed' && !userCashout && (
              <p className="text-red-400 font-semibold">
                Ставка сгорела
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 