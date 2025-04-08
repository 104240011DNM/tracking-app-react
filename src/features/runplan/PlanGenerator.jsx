import React, { useState } from "react";
import { doc, setDoc, collection, addDoc } from "firebase/firestore";
import { firestore } from "../../firebase/firebaseConfig";
import useAuthListener from "../../hooks/useAuthListener";

const goals = ["Giữ sức", "Tăng sức bền", "Giảm cân"];

function generatePlan(bmi, stamina, freeDays, goal) {
  const days = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
  const baseKm = stamina;

  // Cường độ tăng dần tuỳ mục tiêu
  const goalFactor = {
    "Giữ sức": 1,
    "Tăng sức bền": 1.3,
    "Giảm cân": 1.5,
  }[goal] || 1;

  // Chọn random ngày chạy theo số ngày rảnh
  const shuffledDays = [...days].sort(() => 0.5 - Math.random());
  const runDays = shuffledDays.slice(0, freeDays);

  const plan = days.map(day => {
    if (!runDays.includes(day)) return { day, km: 0 };

    const intensity = (Math.random() * 0.5 + 0.75); // random nhẹ
    const km = baseKm * intensity * goalFactor;

    return { day, km: parseFloat(km.toFixed(2)) };
  });

  return plan;
}

export default function PlanGenerator() {
  const { user } = useAuthListener();
  const [bmi, setBmi] = useState("");
  const [stamina, setStamina] = useState("");
  const [freeDays, setFreeDays] = useState("");
  const [goal, setGoal] = useState("Giữ sức");
  const [plan, setPlan] = useState([]);

  const handleSubmit = () => {
    if (!bmi || !stamina || !freeDays) {
      return alert("Vui lòng nhập đầy đủ thông tin!");
    }

    const newPlan = generatePlan(Number(bmi), Number(stamina), Number(freeDays), goal);
    setPlan(newPlan);
  };

  const handleSave = async () => {
    if (!user) return alert("You must be logged in!");
  
    const today = new Date().toISOString().split("T")[0]; // yyyy-MM-dd
  
    try {
      await addDoc(collection(firestore, "plans"), {
        userId: user.uid, 
        date: today,
        plan,
        createdAt: Date.now(),
        targetDistance: plan.reduce((sum, day) => sum + day.km, 0).toFixed(2), // tổng km trong tuần
      });
      alert("Plan saved successfully!");
    } catch (error) {
      console.error("Error saving plan:", error);
      alert("Failed to save the plan!");
    }
  };

  return (
    <div className="p-4 border rounded-lg max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-2">Tạo lịch chạy</h2>

      <div className="mb-2">
        <label>Chỉ số BMI:</label>
        <input
          type="number"
          value={bmi}
          onChange={e => setBmi(e.target.value)}
          className="border p-1 w-full"
        />
      </div>

      <div className="mb-2">
        <label>Quãng đường chạy trung bình (km):</label>
        <input
          type="number"
          value={stamina}
          onChange={e => setStamina(e.target.value)}
          className="border p-1 w-full"
        />
      </div>
      
      <div className="mb-2">
        <label>Số ngày rảnh / tuần:</label>
        <input
          type="number"
          value={freeDays}
          onChange={e => setFreeDays(e.target.value)}
          className="border p-1 w-full"
        />
      </div>
  
      <div className="mb-2">
        <label>Mục tiêu:</label>
        <select
          value={goal}
          onChange={e => setGoal(e.target.value)}
          className="border p-1 w-full"
        >
          <option value="Giữ sức">Giữ sức</option>
          <option value="Tăng sức bền">Tăng sức bền</option>
          <option value="Giảm cân">Giảm cân</option>
        </select>
      </div>
  
      <button onClick={handleSubmit} className="bg-blue-500 text-white px-4 py-1 rounded mb-4">
        Tạo lịch chạy
      </button>
  
      {plan.length > 0 && (
        <>
          <h3 className="font-semibold mb-2">Lịch chạy tuần này:</h3>
          <ul className="mb-4">
            {plan.map((entry, idx) => (
              <li key={idx}>
                {entry.day}: {entry.km > 0 ? `${entry.km} km` : "Nghỉ"}
              </li>
            ))}
          </ul>
          <button onClick={handleSave} className="bg-green-500 text-white px-4 py-1 rounded">
            Lưu lịch vào Firestore
          </button>
        </>
      )}
    </div>
  );  
}
