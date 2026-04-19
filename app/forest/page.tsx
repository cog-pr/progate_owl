"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import StarBackground from "../components/StarBackground";
import HistoryScreen from "../components/HistoryScreen";
import { getCurrentUser, historyKey } from "../lib/authUtils";

import { getDB } from "../lib/dbUtils";

interface OwlRecord {
  date: string;
  imageUrl: string;
  labels: string[];
  message: string;
}

async function loadHistory(email: string): Promise<OwlRecord[]> {
  try {
    const records = await getDB<OwlRecord[]>(historyKey(email));
    return records || [];
  } catch {
    return [];
  }
}

export default function ForestPage() {
  const router = useRouter();
  const [history, setHistory] = useState<OwlRecord[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      const user = getCurrentUser();
      if (!user) {
        // 未ログイン → トップへリダイレクト
        router.replace("/");
        return;
      }
      const loadedHistory = await loadHistory(user);
      setHistory(loadedHistory);
      setReady(true);
    };
    init();
  }, [router]);

  const handleGoTop = useCallback(() => {
    router.push("/");
  }, [router]);

  if (!ready) {
    return (
      <div className="relative flex flex-col flex-1 min-h-dvh">
        <StarBackground />
      </div>
    );
  }

  return (
    <div className="relative flex flex-col flex-1 min-h-dvh">
      <StarBackground />

      <main className="relative z-10 flex flex-col flex-1 w-full max-w-lg mx-auto">
        <HistoryScreen history={history} onGoTop={handleGoTop} />
      </main>
    </div>
  );
}