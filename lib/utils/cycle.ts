/**
 * Calculate cycle day based on last period end date
 * Assumes a 28-day cycle
 */
export function calculateCycleDay(lastPeriodEnd: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const periodDate = new Date(lastPeriodEnd);
  periodDate.setHours(0, 0, 0, 0);
  
  // Calculate days since last period ended
  const daysSince = Math.floor(
    (today.getTime() - periodDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  // Cycle day (day 1 is first day of period, so we add 1)
  // Assuming period ends around day 5, we calculate from there
  const cycleDay = (daysSince % 28) + 1;
  
  return cycleDay > 28 ? cycleDay - 28 : cycleDay;
}

/**
 * Determine cycle phase based on cycle day
 */
export function getCyclePhase(cycleDay: number): {
  phase: "follicular" | "luteal" | "menstrual" | "ovulation";
  name: string;
  description: string;
} {
  if (cycleDay >= 1 && cycleDay <= 5) {
    return {
      phase: "menstrual",
      name: "Menstrual Phase",
      description: "Your period. Rest and recovery are important.",
    };
  } else if (cycleDay >= 6 && cycleDay <= 13) {
    return {
      phase: "follicular",
      name: "Follicular Phase",
      description: "Estrogen is rising. Great time for fasting!",
    };
  } else if (cycleDay >= 14 && cycleDay <= 16) {
    return {
      phase: "ovulation",
      name: "Ovulation",
      description: "Peak fertility. Moderate fasting recommended.",
    };
  } else {
    // Days 17-28 (Luteal Phase)
    return {
      phase: "luteal",
      name: "Luteal Phase",
      description: "Progesterone is high. Fasting may be more challenging.",
    };
  }
}

/**
 * Check if user is in luteal phase (days 21-28)
 * This is when fasting is most difficult
 */
export function isLutealPhase(cycleDay: number): boolean {
  return cycleDay >= 21 && cycleDay <= 28;
}
