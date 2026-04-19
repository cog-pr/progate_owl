from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import base64
import boto3
import json
import random

rekognition = boto3.client("rekognition", region_name="us-east-1")
bedrock = boto3.client("bedrock-runtime", region_name="us-west-2")

app = FastAPI()

# CORS: Next.jsからのリクエストを許可
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

MESSAGES = [
    "今夜のごはんから、こんなフクロウが現れました",
    "今日のフクロウが生まれました 🦉",
    "あなたの夜ご飯から、温かいフクロウが生まれました",
    "今夜も素敵なフクロウに出会えましたね",
    "夜ご飯の力を借りて、フクロウが目覚めました",
]


@app.post("/analyze-image")
async def analyze_image(file: UploadFile = File(...)):
    try:
        contents = await file.read()

        # Rekognitionでラベル検出
        try:
            rekognition_response = rekognition.detect_labels(
                Image={"Bytes": contents},
                MaxLabels=5,
            )
            labels = [label["Name"] for label in rekognition_response["Labels"]]
            print(f"DEBUG: Rekognition labels found: {labels}")
            
            if not labels:
                labels = ["Unknown Food"] # Rekognitionで何も検出されなかった場合のフォールバック
        except Exception as e:
            print(f"ERROR: Rekognition API failed: {str(e)}")
            raise HTTPException(status_code=500, detail=f"画像認識に失敗しました: {str(e)}")

        # Bedrockで画像生成
        prompt = f"a cute anime-style illustration of owl inspired by the food out of {', '.join(labels)}"

        bedrock_payload = {
            "prompt": prompt,
            "mode": "text-to-image",
            "aspect_ratio": "1:1",
        }

        try:
            bedrock_response = bedrock.invoke_model(
                modelId="stability.sd3-5-large-v1:0",
                body=json.dumps(bedrock_payload),
                contentType="application/json",
                accept="application/json",
            )
            
            response_body = json.loads(bedrock_response["body"].read())
            images = response_body.get("images")

            if not images:
                raise HTTPException(status_code=500, detail="No image generated")

        except Exception as e:
            if isinstance(e, HTTPException):
                raise e
            print(f"ERROR: Bedrock API failed: {str(e)}")
            raise HTTPException(status_code=500, detail=f"フクロウの画像生成に失敗しました: {str(e)}")


        # Base64のままdata URIとしてフロントに返す
        image_base64 = images[0]
        image_url = f"data:image/png;base64,{image_base64}"

        return {
            "image_url": image_url,
            "labels": labels,
            "message": random.choice(MESSAGES),
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"ERROR: Unexpected error in analyze_image: {str(e)}")
        raise HTTPException(status_code=500, detail=f"サーバー内部で予期せぬエラーが発生しました: {str(e)}")