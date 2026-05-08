import { useEffect, useState } from "react";
import { getWorkoutSessions } from "@/src/services/workouts.service";

export function useWorkoutProgress(userId: string | null) {
  const [sessionsCount, setSessionsCount] = useState(0);

  useEffect(() => {
    const run = async () => {
      if (!userId) return;
      const sessions = await getWorkoutSessions(userId);
      setSessionsCount(sessions.length);
    };

    void run();
  }, [userId]);

  return { sessionsCount };
}
