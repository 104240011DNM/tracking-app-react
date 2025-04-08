// src/features/runplan/generatePlan.js

export function generatePlanFromTracking(kmRecords, freeDays, goal) {
    const days = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
  
    const goalFactor = {
      "Giữ sức": 1,
      "Tăng sức bền": 1.25,
      "Giảm cân": 1.5,
    }[goal] || 1;
  
    const recentKms = kmRecords.slice(-5);
    const stamina =
      recentKms.reduce((total, km) => total + km, 0) / (recentKms.length || 1);
  
    const shuffledDays = [...days].sort(() => 0.5 - Math.random());
    const runDays = shuffledDays.slice(0, freeDays);
  
    const plan = days.map(day => {
      if (!runDays.includes(day)) return { day, km: 0 };
  
      const intensity = 1 + Math.random() * 0.2;
      const km = stamina * intensity * goalFactor;
  
      return { day, km: parseFloat(km.toFixed(2)) };
    });
  
    return plan;
  }
  