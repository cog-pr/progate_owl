import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

// Dummy owl labels for fallback
const DUMMY_LABEL_SETS = [
  ["Rice", "Fish", "Miso Soup"],
  ["Pasta", "Salad", "Bread"],
  ["Curry", "Rice", "Vegetables"],
  ["Ramen", "Egg", "Noodles"],
  ["Sushi", "Rice", "Seafood"],
  ["Steak", "Potato", "Wine"],
  ["Pizza", "Cheese", "Tomato"],
  ["Udon", "Tempura", "Green Onion"],
];

const DUMMY_MESSAGES = [
  "今夜のごはんから、こんなフクロウが現れました",
  "今日のフクロウが生まれました 🦉",
  "あなたの夜ご飯から、温かいフクロウが生まれました",
  "今夜も素敵なフクロウに出会えましたね",
  "夜ご飯の力を借りて、フクロウが目覚めました",
];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get("image");

    if (!image || !(image instanceof File)) {
      return Response.json(
        { error: "画像が選択されていません" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/heic"];
    if (!allowedTypes.includes(image.type)) {
      return Response.json(
        { error: "対応していない画像形式です" },
        { status: 400 }
      );
    }

    // Validate file size (5MB)
    if (image.size > 5 * 1024 * 1024) {
      return Response.json(
        { error: "画像サイズが大きすぎます（5MB以下にしてください）" },
        { status: 400 }
      );
    }

    // Try to proxy to FastAPI if configured
    const fastApiUrl = process.env.FASTAPI_URL;

    if (fastApiUrl) {
      try {
        const proxyFormData = new FormData();
        proxyFormData.append("image", image);

        const backendRes = await fetch(`${fastApiUrl}/generate-owl`, {
          method: "POST",
          body: proxyFormData,
          signal: AbortSignal.timeout(30000), // 30s timeout
        });

        if (backendRes.ok) {
          const data = await backendRes.json();
          return Response.json(data);
        }

        console.error(
          "FastAPI error:",
          backendRes.status,
          await backendRes.text()
        );
        // Fall through to dummy response
      } catch (err) {
        console.error("FastAPI connection failed:", err);
        // Fall through to dummy response
      }
    }

    // ── Dummy Response (used when FastAPI is unavailable) ──────────
    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 2500));

    const randomLabels =
      DUMMY_LABEL_SETS[Math.floor(Math.random() * DUMMY_LABEL_SETS.length)];
    const randomMessage =
      DUMMY_MESSAGES[Math.floor(Math.random() * DUMMY_MESSAGES.length)];

    return Response.json({
      image_url: "/owl-fallback.png",
      labels: randomLabels,
      message: randomMessage,
    });
  } catch (err) {
    console.error("Generate owl error:", err);
    return Response.json(
      { error: "フクロウの生成中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
