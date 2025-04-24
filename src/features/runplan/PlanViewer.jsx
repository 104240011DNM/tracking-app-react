import { useEffect, useState } from "react";
import { getTodayPlan } from "../../firebase/trackService";
import { getUserProfile } from "../../firebase/userService"
import { collection, query, where, getDocs, orderBy } from "firebase/firestore"
import { firestore } from "../../firebase/firebaseConfig"

export default function PlanViewer({ userId }) {
  const [plan, setPlan] = useState(null);
  const [totalDistance, setTotalDistance] = useState(0)
  const [completedDays, setCompletedDays] = useState([])
  const [incompleteDays, setIncompleteDays] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userId) {
      fetchData();
    }
  }, [userId]);

  const fetchData = async () => {
    setLoading(true)
    try {
      // Get user profile for total distance
      const profile = await getUserProfile(userId)
      if (profile?.totalKM) {
        setTotalDistance(profile.totalKM)
      }

      // Get latest plan
      const planData = await getTodayPlan(userId)
      setPlan(planData)

      // Get completed runs to determine which days are complete
      const today = new Date()
      const startOfWeek = new Date(today)
      startOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1)) // Monday
      startOfWeek.setHours(0, 0, 0, 0)

      const runsRef = collection(firestore, "runs")
      const q = query(
        runsRef,
        where("userId", "==", userId),
        where("date", ">=", startOfWeek.toISOString().split("T")[0]),
        orderBy("date", "asc"),
      )

      const querySnapshot = await getDocs(q)
      const completedRuns = querySnapshot.docs.map((doc) => {
        const data = doc.data()
        // Convert date to day of week
        const runDate = new Date(data.date)
        const dayOfWeek = runDate.getDay()
        const dayMap = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"]
        return {
          day: dayMap[dayOfWeek],
          distance: data.distanceKm || 0,
        }
      })

      // Determine completed and incomplete days
      if (planData?.plan) {
        const completed = []
        const incomplete = []

        planData.plan.forEach((dayPlan) => {
          if (dayPlan.km <= 0) return // Skip rest days

          const run = completedRuns.find((r) => r.day === dayPlan.day)
          if (run && run.distance >= dayPlan.km) {
            completed.push(dayPlan.day)
          } else {
            incomplete.push(dayPlan.day)
          }
        })

        setCompletedDays(completed)
        setIncompleteDays(incomplete)
      }
    } catch (error) {
      console.error("Error fetching plan data:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDayList = (days) => {
    if (days.length === 0) return "Không có"

    // Sort days in order
    const dayOrder = { T2: 1, T3: 2, T4: 3, T5: 4, T6: 5, T7: 6, CN: 7 }
    days.sort((a, b) => dayOrder[a] - dayOrder[b])

    return days.join(", ")
  }

  if (loading) {
    return (
      <div className="bg-white p-6 shadow-lg rounded-lg animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3 mb-3"></div>
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
      </div>
    )
  }

  return (
    <div className="bg-white p-4 shadow rounded">
      <h2 className="text-lg font-semibold mb-2">📅 Kế hoạch chạy bộ</h2>
      {plan ? (
        <div className="space-y-4">
        <div className="bg-indigo-50 p-4 rounded-lg">
          <p className="text-lg font-semibold">🎯 Chỉ tiêu tuần này: {plan.targetDistance} km</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800">✅ Đã hoàn thành:</h3>
            <p>{formatDayList(completedDays)}</p>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-semibold text-yellow-800">⏳ Chưa hoàn thành:</h3>
            <p>{formatDayList(incompleteDays)}</p>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800">🏃‍♂️ Tổng quãng đường đã chạy:</h3>
          <p className="text-2xl font-bold text-blue-600">{totalDistance.toFixed(2)} km</p>
        </div>
      </div>
    ) : (
      <div className="bg-gray-50 p-4 rounded-lg text-gray-600">
        <p>Chưa có kế hoạch nào cho tuần này.</p>
        <p className="mt-2">Hãy tạo kế hoạch mới ở trang "Plan"!</p>
      </div>
    )}
  </div>
  );
}
