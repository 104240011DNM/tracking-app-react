import { useEffect, useState } from "react";
import { getTodayPlan } from "../../firebase/trackService";

export default function PlanViewer({ userId }) {
  const [plan, setPlan] = useState(null);

  useEffect(() => {
    if (userId) {
      getTodayPlan(userId).then(setPlan);
    }
  }, [userId]);

  return (
    <div className="bg-white p-4 shadow rounded">
      <h2 className="text-lg font-semibold mb-2">📅 Kế hoạch tuần này</h2>
      {plan ? (
        <p>🎯 Chỉ tiêu: {plan.targetDistance} km</p>
      ) : (
        <p className="text-gray-500">Chưa có kế hoạch nào tuần này.</p>
      )}
    </div>
  );
}
