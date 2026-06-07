"use client"

import BlockedUserScreen from "@/components/BlockedUserScreen"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useStore } from "@/lib/store"
import { requestPhoneAccess } from "@telegram-apps/sdk"
import { TonConnectButton, useTonConnectUI } from "@tonconnect/ui-react"
import { useEffect, useRef, useState } from "react"

interface Game {
  id: number
  bet: number
  crashPoint: number
  cashout?: number
  profit: number
  status: string
  createdAt: string
}

interface Deposit {
  id: number
  amount: number
  hash: string
  from: string
  createdAt: string
}

interface UserProfile {
  id: string
  telegramId: string
  username?: string
  avatarUrl?: string
  balance: number
  phone?: string
  phoneVerified: boolean
  blocked?: boolean
  createdAt: string
  updatedAt: string
}

export default function ProfilePage() {
  const { user, demoBalance, adjustDemoBalance } = useStore()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [games, setGames] = useState<Game[]>([])
  const [deposits, setDeposits] = useState<Deposit[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [nickname, setNickname] = useState("")
  const [tonWallet, setTonWallet] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [tonConnectUI] = useTonConnectUI();
  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)
  const showCustomBack = true

  // Свайп слева направо = назад
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX
    }
    const handleTouchEnd = (e: TouchEvent) => {
      touchEndX.current = e.changedTouches[0].clientX
      if (
        touchStartX.current !== null &&
        touchEndX.current !== null &&
        touchEndX.current - touchStartX.current > 60 // свайп вправо
      ) {
        window.history.back()
      }
    }
    document.addEventListener("touchstart", handleTouchStart)
    document.addEventListener("touchend", handleTouchEnd)
    return () => {
      document.removeEventListener("touchstart", handleTouchStart)
      document.removeEventListener("touchend", handleTouchEnd)
    }
  }, [])

  // Загрузка данных профиля
  useEffect(() => {
    if (!user?.telegramId) return

    const fetchProfileData = async () => {
      try {
        const results = await Promise.allSettled([
          fetch(`/api/profile?telegram_id=${user.telegramId}`),
          fetch(`/api/profile/games?telegram_id=${user.telegramId}`),
          fetch(`/api/profile/deposits?telegram_id=${user.telegramId}`)
        ]);

        if (results[0].status === 'fulfilled' && results[0].value.ok) {
          const profileData = await results[0].value.json()
          setProfile(profileData)
          setNickname(profileData.username || "")
          setTonWallet(profileData.tonWallet || "")
        }

        if (results[1].status === 'fulfilled' && results[1].value.ok) {
          const gamesData = await results[1].value.json()
          setGames(gamesData.games || [])
        }

        if (results[2].status === 'fulfilled' && results[2].value.ok) {
          const depositsData = await results[2].value.json()
          setDeposits(depositsData.deposits || [])
        }
      } catch (error) {
        console.error("Ошибка загрузки профиля:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfileData()
  }, [user?.telegramId])

  const handleSaveProfile = async () => {
    if (!user?.telegramId) return

    try {
      const body: any = {
        telegramId: user.telegramId,
        username: nickname,
      }
      if (tonWallet && tonWallet.startsWith("EQ")) {
        body.tonWallet = tonWallet
      }
      const response = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      })

      const result = await response.json()
      console.log("/api/profile/update response:", result)
      if (response.ok) {
        setProfile(result)
        setIsEditing(false)
      } else {
        alert("Ошибка обновления профиля: " + (result.error || response.status))
      }
    } catch (error) {
      console.error("Ошибка обновления профиля:", error)
    }
  }

  const handleRequestPhone = async () => {
    if (requestPhoneAccess.isAvailable()) {
      const status = await requestPhoneAccess();
      if (status === "sent") {
        alert("Запрос на номер отправлен. Проверьте чат с ботом и подтвердите.");
      } else if (status === "cancelled") {
        alert("Запрос отменён.");
      } else {
        alert("Статус: " + status);
      }
    } else {
      alert("Telegram не поддерживает запрос номера телефона на этой платформе.");
    }
  }

  // Автоматически сохранять TON-кошелёк при изменении
  useEffect(() => {
    if (tonWallet && tonWallet.startsWith("EQ") && user?.telegramId) {
      handleSaveProfile()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tonWallet])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Загрузка профиля...</div>
      </div>
    )
  }

  // Проверяем блокировку пользователя
  if (user?.blocked || profile?.blocked) {
    return <BlockedUserScreen />
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Профиль не найден</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 text-white p-4 relative">
      {showCustomBack && (
        <button
          className="absolute top-3 left-3 z-50 bg-transparent rounded-full p-2 hover:bg-blue-100/20 transition-colors"
          onClick={() => window.history.back()}
          aria-label="Назад"
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#229ED9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      )}
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <h1 className={`text-2xl font-bold tracking-tight drop-shadow-lg transition-all duration-200 ${showCustomBack ? 'pl-12 sm:pl-14' : ''}`}>Профиль</h1>
      </div>
      {/* Profile Info */}
      <Card className="bg-gray-800/90 border-gray-700 mb-6 shadow-xl rounded-2xl w-full max-w-2xl mx-auto sm:p-8 p-3">
        <CardHeader>
          <CardTitle className="text-white text-xl flex items-center gap-2">
            <span role="img" aria-label="user">👤</span> Информация
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-white">
          {/* Avatar and Basic Info */}
          <div className="flex items-center gap-4">
            <Avatar className="w-20 h-20 shadow-lg">
              <AvatarImage src={profile.avatarUrl} />
              <AvatarFallback className="bg-gray-600 text-white text-2xl">
                {profile.username?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                {isEditing ? (
                  <>
                    <div className="flex items-center gap-1 w-full">
                      <input
                        value={nickname}
                        onChange={e => setNickname(e.target.value)}
                        className="font-extrabold bg-gradient-to-r from-red-400 via-yellow-400 via-green-400 via-blue-400 to-pink-400 text-transparent bg-clip-text drop-shadow-lg bg-gray-800/60 px-2 rounded focus:outline-none border border-gray-600 text-2xl sm:text-4xl max-w-[120px] sm:max-w-[300px]"
                        style={{ minWidth: 80 }}
                        autoFocus
                      />
                      <button
                        onClick={handleSaveProfile}
                        className="p-2 rounded-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center ml-1"
                        title="Сохранить"
                      >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      </button>
                      <button
                        onClick={() => { setIsEditing(false); setNickname(profile.username || "") }}
                        className="p-2 rounded-full bg-gray-600 hover:bg-gray-700 text-white flex items-center justify-center ml-1"
                        title="Отмена"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="text-4xl font-extrabold bg-gradient-to-r from-red-400 via-yellow-400 via-green-400 via-blue-400 to-pink-400 text-transparent bg-clip-text drop-shadow-lg">
                      {profile.username || "Пользователь"}
                    </span>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="ml-2 p-2 rounded-full bg-gray-700 hover:bg-gray-600 text-white flex items-center justify-center"
                      title="Редактировать"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19.5 3 21l1.5-4L16.5 3.5z"></path></svg>
                    </button>
                  </>
                )}
              </div>
              <div className="text-gray-400 text-sm">ID: {profile.telegramId}</div>
              <div className="text-gray-400 text-sm">
                Регистрация: {new Date(profile.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
          <Separator className="bg-gray-700" />
          {/* Balance */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-white">Баланс:</span>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-green-400 drop-shadow">⚡{profile.balance} IC</span>
              <span className="text-2xl font-bold text-blue-400 drop-shadow">💎 {demoBalance} Demo</span>
              <button
                className={`ml-2 px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                disabled={demoBalance >= 10}
                onClick={() => adjustDemoBalance(500)}
              >
                Пополнить Demo Coin
              </button>
            </div>
          </div>
          <Separator className="bg-gray-700" />
          {/* Phone Status */}
          <div className="flex items-center justify-between">
            <span className="text-white">Телефон:</span>
            <div className="flex items-center gap-2">
              {profile.phoneVerified ? (
                <>
                  <span className="text-green-400 font-mono">{profile.phone}</span>
                  <Badge variant="secondary" className="bg-green-600">Подтверждён</Badge>
                </>
              ) : (
                <>
                  <span className="text-gray-400">Не привязан</span>
                  <Button size="sm" onClick={handleRequestPhone} className="bg-blue-700 hover:bg-blue-800">Привязать</Button>
                </>
              )}
            </div>
          </div>
          <Separator className="bg-gray-700" />
          {/* Editable Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-white">TON Кошелёк</label>
              <TonConnectButton className="min-w-[44px]" />
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Game History */}
      <Card className="bg-gray-800/90 border-gray-700 mb-6 shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2 text-lg"><span role="img" aria-label="game">🎲</span> История игр</CardTitle>
        </CardHeader>
        <CardContent>
          {games.length > 0 ? (
            <div className="space-y-2">
              {games.slice(0, 10).map((game) => (
                <div key={game.id} className="flex justify-between items-center p-2 bg-gray-700 rounded shadow">
                  <div>
                    <div className="font-medium">Ставка: ⚡{game.bet} IC</div>
                    <div className="text-sm text-gray-400">{new Date(game.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${game.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>{game.profit >= 0 ? '+' : ''}⚡{game.profit} IC</div>
                    <div className="text-sm text-gray-400">{game.crashPoint ? game.crashPoint.toFixed(2) : 'N/A'}x</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-400 text-center py-4">История игр пуста</div>
          )}
        </CardContent>
      </Card>
      {/* Deposit History */}
      <Card className="bg-gray-800/90 border-gray-700 shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2 text-lg"><span role="img" aria-label="deposit">💸</span> История пополнений</CardTitle>
        </CardHeader>
        <CardContent>
          {deposits.length > 0 ? (
            <div className="space-y-2">
              {deposits.slice(0, 10).map((deposit) => (
                <div key={deposit.id} className="flex justify-between items-center p-2 bg-gray-700 rounded shadow">
                  <div>
                    <div className="font-medium">Пополнение: ⚡{deposit.amount} IC</div>
                    <div className="text-sm text-gray-400">{new Date(deposit.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-green-400 font-bold">+⚡{deposit.amount} IC</div>
                    <div className="text-xs text-gray-400 font-mono">{deposit.hash.slice(0, 8)}...</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-400 text-center py-4">История пополнений пуста</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 