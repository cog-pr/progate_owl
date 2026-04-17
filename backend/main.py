from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import traceback

# aws_servicesモジュールからインポート
from aws_services import (
    detect_food_labels_from_image,
    generate_owl_prompt_and_message,
    generate_owl_image,
    upload_image_to_s3
)

app = FastAPI(title="Night Owl API")

# Next.js のフロントエンドからのアクセスを許可するCORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 開発中は特定のオリジンに絞るか全て許可
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/generate-owl")
async def generate_owl_endpoint(image: UploadFile = File(...)):
    """
    ユーザーからの夕食写真を受け取り、フクロウの画像を生成するエンドポイント
    """
    try:
        # 1. 画像の読み込み
        image_bytes = await image.read()
        
        if not image_bytes:
            raise HTTPException(status_code=400, detail="Empty file uploaded.")
            
        print("1. Image successfully loaded, detecting labels...")
        
        # 2. AWS Rekognitionでラベル抽出
        labels = detect_food_labels_from_image(image_bytes)
        print(f"   -> Extracted labels: {labels}")
        
        # 3. AWS Bedrock (Claude 3 Haiku) でプロンプトと紹介文生成
        print("2. Generating prompt and message with Bedrock (Claude)...")
        owl_data = generate_owl_prompt_and_message(labels)
        prompt = owl_data.get("image_prompt", "")
        message = owl_data.get("message", "素敵なフクロウが誕生しました！")
        print(f"   -> Prompt: {prompt}")
        print(f"   -> Message: {message}")
        
        # 4. AWS Bedrock (Nova Canvas) でフクロウ画像生成
        print("3. Generating owl image with Bedrock (Nova Canvas)...")
        generated_image_bytes = generate_owl_image(prompt)
        print("   -> Image generation successful.")
        
        # 5. S3にアップロード
        print("4. Uploading generated image to S3...")
        image_url = upload_image_to_s3(generated_image_bytes)
        print(f"   -> S3 URL: {image_url}")
        
        # 6. クライアントに返却
        return {
            "image_url": image_url,
            "labels": labels,  # 全て返すかトップのみにするか等調整可能
            "message": message
        }

    except Exception as e:
        print("Error during /generate-owl process:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
