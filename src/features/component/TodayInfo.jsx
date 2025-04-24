import { useEffect, useState } from "react"
import { getTodayPlan } from "../../firebase/trackService"

export default function TodayInfo({ userId, setTargetDistance }) {
  const [today, setToday] = useState("")
  const [dayName, setDayName] = useState("")
  const [manualDistance, setManualDistance] = useState("")
  const [todayPlan, setTodayPlan] = useState(null)

  useEffect(() => {
    const now = new Date()
    const days = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"]
    setDayName(days[now.getDay()])
    setToday(now.toLocaleDateString("vi-VN"))

    // Fetch today's plan when component mounts
    if (userId) {
      fetchTodayPlan()
    }
  }, [userId])

  const fetchTodayPlan = async () => {
    const plan = await getTodayPlan(userId)
    setTodayPlan(plan)
  }

  const handleUsePlan = async () => {
    if (!todayPlan) {
      await fetchTodayPlan()
    }

    if (todayPlan?.plan) {
      // Get today's day of week (0 = Sunday, 1 = Monday, etc.)
      const dayOfWeek = new Date().getDay()
      // Convert to plan format (T2, T3, etc. where Sunday is CN)
      const dayMap = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"]
      const todayCode = dayMap[dayOfWeek]

      // Find today's plan
      const todayEntry = todayPlan.plan.find((entry) => entry.day === todayCode)

      if (todayEntry && todayEntry.km > 0) {
        setTargetDistance(Number(todayEntry.km))
      } else {
        alert("Không tìm thấy kế hoạch cho hôm nay hoặc hôm nay là ngày nghỉ.")
      }
    } else {
      alert("Không tìm thấy kế hoạch hôm nay.")
    }
  }

  const handleManualSubmit = () => {
    const value = Number.parseFloat(manualDistance)
    if (!isNaN(value)) setTargetDistance(value)
  }

  return (
    <div className="bg-gradient-to-r from-blue-800 to-indigo-900 p-4 rounded-lg shadow-lg text-white mb-4">
      <p className="font-semibold text-lg">
        📅 {dayName}, ngày {today}
      </p>
      <div className="flex flex-wrap items-center gap-2 mt-2">
        <input
          type="number"
          className="p-2 rounded text-black flex-grow"
          placeholder="Nhập chỉ tiêu (km)"
          value={manualDistance}
          onChange={(e) => setManualDistance(e.target.value)}
        />
        <button
          onClick={handleManualSubmit}
          className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded text-white transition-colors"
        >
          Đặt chỉ tiêu
        </button>
        <button
          onClick={handleUsePlan}
          className="bg-teal-600 hover:bg-teal-700 px-3 py-2 rounded text-white transition-colors"
        >
          Lấy từ plan
        </button>
      </div>
    </div>
  )
}