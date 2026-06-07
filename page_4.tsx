"use client"

import { useStore } from "@/lib/store"
import Link from "next/link"
import { useEffect, useState } from "react"

interface SystemStats {
  totalUsers: number
  totalGames: number
  totalWithdrawals: number
  totalBalance: number
  activeUsers24h: number
  games24h: number
}

const DEFAULT_CHANCES: {range: number[], chance: number}[] = [
  { range: [1.01, 1.2], chance: 0.25 },
  { range: [1.2, 2], chance: 0.35 },
  { range: [2, 5], chance: 0.30 },
  { range: [5, 20], chance: 0.09 },
  { range: [20, 50], chance: 0.01 },
];

export default function SettingsPage() {
  const { user, balance } = useStore()
  const [authorized, setAuthorized] = useState(false)
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [chances, setChances] = useState<{range: number[], chance: number}[]>(DEFAULT_CHANCES)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!user || !user.telegramId) {
      setLoading(false)
      return
    }

    // Проверяем доступ
    fetch(`/api/admin/check-access?telegramId=${user.telegramId}`)
      .then((res) => res.json())
      .then((accessData) => {
        if (accessData.authorized) {
          setAuthorized(true)
          return fetch(`/api/admin/system-stats?telegram_id=${user.telegramId}`)
        }
        setLoading(false)
      })
      .then((statsRes) => statsRes?.json())
      .then((statsData) => {
        setStats(statsData)
        setLoading(false)
      })
      .catch((error) => {
        console.error("Settings error:", error)
        setLoading(false)
      })
  }, [user])

  useEffect(() => {
    fetch('/api/admin/crash-chances')
      .then(r => r.json())
      .then(data => {
        if (data.chances) {
          const parsed: {range: number[], chance: number}[] = data.chances
            .filter((c: any) => Array.isArray(c.range) && c.range.length === 2)
            .map((c: any) => ({ range: [Number(c.range[0]), Number(c.range[1])], chance: Number(c.chance) }));
          setChances(parsed);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleChanceChange = (i: number, value: number) => {
    const newChances = chances.map((c, idx) => idx === i ? { ...c, chance: value } : c);
    setChances(newChances);
    setSuccess(false);
  };

  const total = chances.reduce((sum, c) => sum + c.chance, 0);

  const save = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch('/api/admin/crash-chances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chances })
      });
      if (!res.ok) throw new Error('Ошибка сохранения');
      setSuccess(true);
    } catch (e) {
      setError('Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl font-mono">Загрузка...</div>
      </div>
    )
  }

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl font-mono p-6 bg-gray-800 rounded-lg shadow-lg">
          🚫 Доступ запрещён
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="text-gray-400 hover:text-white">
            ← Назад
          </Link>
          <h1 className="text-xl font-bold">⚙️ Настройки</h1>
        </div>
        <p className="text-gray-400 text-sm mt-1">Системная информация</p>
      </div>

      {/* System Stats */}
      {stats && (
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">📊 Статистика системы</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-400">{stats.totalUsers}</div>
              <div className="text-gray-400 text-sm">Всего пользователей</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-400">{stats.totalGames}</div>
              <div className="text-gray-400 text-sm">Всего игр</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-400">{stats.totalWithdrawals}</div>
              <div className="text-gray-400 text-sm">Всего выводов</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-400">${stats.totalBalance.toFixed(2)}</div>
              <div className="text-gray-400 text-sm">Общий баланс</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-xl font-bold text-cyan-400">{stats.activeUsers24h}</div>
              <div className="text-gray-400 text-sm">Активных за 24ч</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-xl font-bold text-orange-400">{stats.games24h}</div>
              <div className="text-gray-400 text-sm">Игр за 24ч</div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Info */}
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">👤 Информация администратора</h2>
        
        <div className="bg-gray-800 rounded-lg p-4 space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-400">Telegram ID:</span>
            <span className="font-mono">{user?.telegramId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Username:</span>
            <span>@{user?.username}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Баланс:</span>
            <span className="text-green-400">${balance.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">🚀 Быстрые действия</h2>
        
        <div className="space-y-3">
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-semibold"
          >
            🔄 Обновить страницу
          </button>
          
          <button 
            onClick={() => {
              if (confirm('Очистить кэш браузера?')) {
                window.location.reload()
              }
            }}
            className="w-full py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors font-semibold"
          >
            🗑️ Очистить кэш
          </button>
        </div>
      </div>

      {/* Version Info */}
      <div className="p-4">
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <div className="text-gray-400 text-sm">Версия системы</div>
          <div className="font-mono text-xs text-gray-500 mt-1">1.0.0</div>
        </div>
      </div>

      <div style={{ maxWidth: 500, margin: '40px auto', background: '#181c24', padding: 24, borderRadius: 12 }}>
        <h2 style={{ fontWeight: 700, fontSize: 22, marginBottom: 16 }}>Настройки шансов Crash</h2>
        <table style={{ width: '100%', color: '#fff', marginBottom: 16 }}>
          <thead>
            <tr>
              <th>Диапазон</th>
              <th>Шанс (%)</th>
            </tr>
          </thead>
          <tbody>
            {chances.map((c, i) => (
              <tr key={i}>
                <td>{c.range[0].toFixed(2)} – {c.range[1].toFixed(2)}</td>
                <td>
                  <input
                    type="number"
                    min={0}
                    max={1}
                    step={0.01}
                    value={c.chance}
                    onChange={e => handleChanceChange(i, parseFloat(e.target.value))}
                    style={{ width: 60, background: '#222', color: '#fff', border: '1px solid #333', borderRadius: 4 }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ color: total === 1 ? '#0f0' : '#f44', marginBottom: 8 }}>
          Сумма: {(total * 100).toFixed(1)}% (должно быть 100%)
        </div>
        <button onClick={save} disabled={saving || total !== 1} style={{padding:'8px 24px',background:'#222',color:'#fff',border:'1px solid #333',borderRadius:6,fontWeight:600,marginBottom:8}}>Сохранить</button>
        {success && <div style={{color:'#0f0',marginBottom:8}}>Сохранено!</div>}
        {error && <div style={{color:'#f44',marginBottom:8}}>{error}</div>}
        <div style={{ fontSize: 13, color: '#aaa' }}>
          <b>Внимание:</b> эти настройки теперь сохраняются в Redis и применяются для генерации crashPoint.<br />
          Изменения вступают в силу сразу после сохранения.
        </div>
      </div>
    </div>
  )
} 