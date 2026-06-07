"use client"

import { useStore } from "@/lib/store"
import Link from "next/link"
import { useEffect, useState } from "react"

interface WithdrawRequest {
  id: string
  telegram_id: number
  amount: number
  method: string
  status: "pending" | "approved" | "rejected"
  created_at: number
}

export default function FinancePage() {
  const { user } = useStore()
  const [authorized, setAuthorized] = useState(false)
  const [withdraws, setWithdraws] = useState<WithdrawRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)

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
          loadWithdraws()
        } else {
          setLoading(false)
        }
      })
      .catch((error) => {
        console.error("Finance error:", error)
        setLoading(false)
      })
  }, [user])

  const loadWithdraws = () => {
    fetch(`/api/admin/withdraws?telegram_id=${user?.telegramId}`)
      .then((res) => res.json())
      .then((data) => {
        setWithdraws(data.withdraws || [])
        setLoading(false)
      })
      .catch((error) => {
        console.error("Load withdraws error:", error)
        setLoading(false)
      })
  }

  const handleWithdrawAction = async (id: string, action: "approve" | "reject") => {
    setProcessing(id)
    
    try {
      const res = await fetch("/api/admin/withdraw-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          id, 
          action, 
          admin_id: user?.telegramId 
        }),
      })

      const data = await res.json()
      if (data.success) {
        setWithdraws((prev) =>
          prev.map((w) => 
            w.id === id 
              ? { ...w, status: action === "approve" ? "approved" : "rejected" } 
              : w
          )
        )
      } else {
        alert("❌ Ошибка: " + data.error)
      }
    } catch (error) {
      console.error("Withdraw action error:", error)
      alert("❌ Ошибка при выполнении действия")
    } finally {
      setProcessing(null)
    }
  }

  const pendingWithdraws = withdraws.filter(w => w.status === "pending")
  const processedWithdraws = withdraws.filter(w => w.status !== "pending")

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
          <h1 className="text-xl font-bold">💰 Финансы</h1>
        </div>
        <p className="text-gray-400 text-sm mt-1">
          Ожидают: {pendingWithdraws.length} | Всего: {withdraws.length}
        </p>
      </div>

      {/* Pending Withdrawals */}
      {pendingWithdraws.length > 0 && (
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-3 text-yellow-400">
            ⏳ Ожидающие выводы ({pendingWithdraws.length})
          </h2>
          <div className="space-y-3">
            {pendingWithdraws.map((withdraw) => (
              <div key={withdraw.id} className="bg-gray-800 rounded-lg p-4 border border-yellow-600">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-semibold">ID: {withdraw.telegram_id}</div>
                  <div className="text-xl font-bold text-yellow-300">
                    ${withdraw.amount.toFixed(2)}
                  </div>
                </div>
                
                <div className="text-gray-400 text-sm mb-3">
                  Метод: {withdraw.method}
                </div>
                
                <div className="text-gray-500 text-xs mb-3">
                  {new Date(withdraw.created_at).toLocaleString()}
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleWithdrawAction(withdraw.id, "approve")}
                    disabled={processing === withdraw.id}
                    className="flex-1 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-lg transition-colors text-sm font-semibold"
                  >
                    {processing === withdraw.id ? 'Обработка...' : '✅ Одобрить'}
                  </button>
                  <button
                    onClick={() => handleWithdrawAction(withdraw.id, "reject")}
                    disabled={processing === withdraw.id}
                    className="flex-1 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-lg transition-colors text-sm font-semibold"
                  >
                    {processing === withdraw.id ? 'Обработка...' : '❌ Отклонить'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Processed Withdrawals */}
      {processedWithdraws.length > 0 && (
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-3 text-gray-400">
            📋 Обработанные выводы ({processedWithdraws.length})
          </h2>
          <div className="space-y-3">
            {processedWithdraws.map((withdraw) => (
              <div key={withdraw.id} className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold">ID: {withdraw.telegram_id}</div>
                  <div className={`text-lg font-bold ${
                    withdraw.status === 'approved' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    ${withdraw.amount.toFixed(2)}
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="text-gray-400">
                    Метод: {withdraw.method}
                  </div>
                  <div className={`px-2 py-1 rounded text-xs ${
                    withdraw.status === 'approved' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-red-600 text-white'
                  }`}>
                    {withdraw.status === 'approved' ? 'Одобрен' : 'Отклонён'}
                  </div>
                </div>
                
                <div className="text-gray-500 text-xs mt-2">
                  {new Date(withdraw.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {withdraws.length === 0 && (
        <div className="p-4 text-center text-gray-400">
          Нет заявок на вывод
        </div>
      )}
    </div>
  )
} 