import os
import json
import base64
import uuid
import boto3
from dotenv import load_dotenv

load_dotenv()

s3_client = boto3.client("s3")
rekognition_client = boto3.client("rekognition")
bedrock_client = boto3.client("bedrock-runtime", region_name=os.getenv("AWS_DEFAULT_REGION", "us-east-1"))

S3_BUCKET = os.getenv("AWS_S3_BUCKET_NAME")

def detect_food_labels_from_image(image_bytes: bytes) -> list[str]:
    """
    AWS Rekognitionを使用して画像からラベル情報を抽出する
    """
    response = rekognition_client.detect_labels(
        Image={"Bytes": image_bytes},
        MaxLabels=10,
        MinConfidence=70
    )
    
    # 全ラベルから意味のありそうなものを抽出 (例としてFoodやカテゴリなどでフィルタする手もあるが、今回はすべて利用)
    labels = [label['Name'] for label in response['Labels']]
    return labels

def generate_owl_prompt_and_message(labels: list[str]) -> dict:
    """
    AWS Bedrock (Claude 3 Haiku)を使用して、
    食べ物のラベルからオリジナルのフクロウ画像のプロンプトと紹介文を生成する
    """
    model_id = "anthropic.claude-3-haiku-20240307-v1:0"
    
    prompt = f"""
    あなたは「Night Owl」という、その日の夜ご飯から独自の「フクロウの精霊」を作り出す魔法のアプリです。
    ユーザーの夜ご飯の写真から以下のラベル（キーワード）が検出されました:
    {', '.join(labels)}
    
    以下の2つの情報をJSON形式で出力してください:
    1. "image_prompt": Amazon Nova Canvasといった画像生成AIに入力するための、具体的なフクロウ画像の英語のプロンプト。
       (例: A cute, magical owl character made mostly of [food items], standing in a mystical dark forest at night, highly detailed, fantasy art style, mysterious glowing accents.)
    2. "message": アプリ上でユーザーに表示する、その夜ご飯から生まれたフクロウを紹介する優しくて温かい日本語のメッセージ(50文字程度)。
       (例: アツアツのピザから、チーズの香りをまとうフクロウが生まれました。今夜も良い夢を！)
    
    出力フォーマット（JSONのみ、追加テキストなし）:
    {{
        "image_prompt": "...",
        "message": "..."
    }}
    """
    
    body = {
        "anthropic_version": "bedrock-2023-05-31",
        "max_tokens": 300,
        "messages": [
            {
                "role": "user",
                "content": [{"type": "text", "text": prompt}]
            }
        ]
    }
    
    response = bedrock_client.invoke_model(
        modelId=model_id,
        contentType="application/json",
        accept="application/json",
        body=json.dumps(body)
    )
    
    response_body = json.loads(response.get('body').read())
    content = response_body["content"][0]["text"]
    
    try:
        # Claudeが返したJSONをパース
        result = json.loads(content)
        return result
    except json.JSONDecodeError:
        # 万が一JSONが壊れていた場合のフォールバック
        return {
            "image_prompt": "A cute, magical owl character with glowing eyes, sitting on a majestic branch at night, fantasy illustration, 4k.",
            "message": "素敵な夜ご飯から、不思議な力を秘めたフクロウが誕生しました。"
        }

def generate_owl_image(prompt: str) -> bytes:
    """
    AWS Bedrock (Amazon Nova Canvas)を使用してフクロウの画像を生成する。
    代替としてTitan Image Generatorなどのモデルを使うことも可能。
    """
    model_id = "amazon.nova-canvas-v1:0"
    
    body = {
        "taskType": "TEXT_IMAGE",
        "textToImageParams": {
            "text": prompt
        },
        "imageGenerationConfig": {
            "numberOfImages": 1,
            "width": 1024,
            "height": 1024,
            "cfgScale": 8.0
        }
    }
    
    response = bedrock_client.invoke_model(
        modelId=model_id,
        contentType="application/json",
        accept="application/json",
        body=json.dumps(body)
    )
    
    response_body = json.loads(response.get('body').read())
    base64_image = response_body.get("images")[0]
    image_bytes = base64.b64decode(base64_image)
    return image_bytes

def upload_image_to_s3(image_bytes: bytes) -> str:
    """
    生成した画像をAWS S3にアップロードし、その公開URLを返す。
    ※ S3のバケットは「ブロックパブリックアクセス」が解除され、オブジェクトレベルで公開可能な構成か、
    もしくは公開用のバケットポリシーが設定されている前提となります。
    """
    if not S3_BUCKET:
        raise ValueError("S3 bucket name is not configured in .env")
        
    filename = f"owls/{uuid.uuid4().hex}.png"
    
    s3_client.put_object(
        Bucket=S3_BUCKET,
        Key=filename,
        Body=image_bytes,
        ContentType="image/png"
        # Optional: ACL="public-read" if your bucket allows ACLs
    )
    
    # 仮想ホスト形式のURLを構築
    # リージョンに応じてホスト名が変わる場合があります (e.g. s3.ap-northeast-1.amazonaws.com)
    # ここでは一般的なURL形式を返却
    region = os.getenv("AWS_DEFAULT_REGION", "us-east-1")
    url = f"https://{S3_BUCKET}.s3.{region}.amazonaws.com/{filename}"
    return url
