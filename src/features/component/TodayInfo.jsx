import { useEffect, useState } from "react";
import { getTodayPlan } from "../../firebase/trackService";

export default function TodayInfo({ userId, setTargetDistance }) {
  const [today, setToday] = useState("");
  const [dayName, setDayName] = useState("");
  const [manualDistance, setManualDistance] = useState("");

  useEffect(() => {
    const now = new Date();
    const days = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
    setDayName(days[now.getDay()]);
    setToday(now.toLocaleDateString("vi-VN"));
  }, []);

  const handleUsePlan = async () => {
    const plan = await getTodayPlan(userId);
    if (plan?.targetDistance) {
      setTargetDistance(Number(plan.targetDistance));
    } else {
      alert("Không tìm thấy kế hoạch hôm nay.");
    }
  };

  const handleManualSubmit = () => {
    const value = parseFloat(manualDistance);
    if (!isNaN(value)) setTargetDistance(value);
  };

  return (
    <div className="text-white mb-4">
      <p className="font-semibold">
        📅 {dayName}, ngày {today}
      </p>
      <div className="flex items-center gap-2 mt-2">
        <input
          type="number"
          className="p-1 rounded text-black"
          placeholder="Nhập chỉ tiêu (km)"
          value={manualDistance}
          onChange={(e) => setManualDistance(e.target.value)}
        />
        <button onClick={handleManualSubmit} className="bg-blue-600 px-2 py-1 rounded text-white">
          Đặt chỉ tiêu
        </button>
        <button onClick={handleUsePlan} className="bg-teal-600 px-2 py-1 rounded text-white">
          Lấy từ plan
        </button>
      </div>
    </div>
  );
}
