import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

// FastAPIバックエンドのURL
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

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

    // ファイル形式チェック
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/heic"];
    if (!allowedTypes.includes(image.type)) {
      return Response.json(
        { error: "対応していない画像形式です" },
        { status: 400 }
      );
    }

    // ファイルサイズチェック (5MB)
    if (image.size > 5 * 1024 * 1024) {
      return Response.json(
        { error: "画像サイズが大きすぎます（5MB以下にしてください）" },
        { status: 400 }
      );
    }

    // FastAPIバックエンドに転送
    const backendForm = new FormData();
    backendForm.append("file", image);

    const backendRes = await fetch(`${BACKEND_URL}/analyze-image`, {
      method: "POST",
      body: backendForm,
    });

    if (!backendRes.ok) {
      const errBody = await backendRes.text();
      console.error("Backend error:", backendRes.status, errBody);
      return Response.json(
        { error: "フクロウの生成に失敗しました" },
        { status: 502 }
      );
    }

    const data = await backendRes.json();

    // バックエンドが { image_url, labels, message } を返す
    return Response.json({
      image_url: data.image_url,
      labels: data.labels,
      message: data.message,
    });
  } catch (err) {
    console.error("Generate owl error:", err);
    return Response.json(
      { error: "フクロウの生成中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
