from fastapi import FastAPI, UploadFile, File
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
    allow_origins=["http://localhost:3000"],
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
    contents = await file.read()

    # Rekognitionでラベル検出
    rekognition_response = rekognition.detect_labels(
        Image={"Bytes": contents},
        MaxLabels=5,
    )

    labels = [label["Name"] for label in rekognition_response["Labels"]]
    print(f"DEBUG: Rekognition labels found: {labels}")

    # Bedrockで画像生成
    prompt = f"a cute anime-style illustration of owl inspired by the food out of {', '.join(labels)}"

    bedrock_payload = {
        "prompt": prompt,
        "mode": "text-to-image",
        "aspect_ratio": "1:1",
    }

    bedrock_response = bedrock.invoke_model(
        modelId="stability.sd3-5-large-v1:0",
        body=json.dumps(bedrock_payload),
        contentType="application/json",
        accept="application/json",
    )

    response_body = json.loads(bedrock_response["body"].read())
    images = response_body.get("images")

    if not images:
        return {"error": "No image generated", "details": response_body}

    # Base64のままdata URIとしてフロントに返す
    image_base64 = images[0]
    image_url = f"data:image/png;base64,{image_base64}"

    return {
        "image_url": image_url,
        "labels": labels,
        "message": random.choice(MESSAGES),
    }