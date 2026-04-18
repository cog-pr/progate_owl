"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import StarBackground from "../components/StarBackground";
import HistoryScreen from "../components/HistoryScreen";

interface OwlRecord {
  date: string;
  imageUrl: string;
  labels: string[];
  message: string;
}

function loadHistory(): OwlRecord[] {
  try {
    const raw = localStorage.getItem("owlHistory");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export default function ForestPage() {
  const router = useRouter();
  const [history, setHistory] = useState<OwlRecord[]>([]);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const handleGoTop = useCallback(() => {
    router.push("/");
  }, [router]);

  return (
    <div className="relative flex flex-col flex-1 min-h-dvh">
      <StarBackground />

      <main className="relative z-10 flex flex-col flex-1 w-full max-w-lg mx-auto">
        <HistoryScreen history={history} onGoTop={handleGoTop} />
      </main>
    </div>
  );
}