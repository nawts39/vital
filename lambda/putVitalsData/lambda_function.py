import json
import boto3
from decimal import Decimal

# DynamoDBに接続
dynamodb = boto3.resource('dynamodb')
# Vitalsテーブルを選択
table = dynamodb.Table('Vitals')

def lambda_handler(event, context):
    """
    API Gateway経由でPOSTされたJSONデータを受け取り、DynamoDBに保存する
    """
    print(event) # デバッグ用に受け取ったデータをログに出力

    try:
        # ショートカットから送られてくるJSON本体は event['body'] に入っている
        body = json.loads(event['body'])
        
        # --- データの前処理 ---
        # Weightはショートカットから文字列で送られてくるため、数値(Decimal型)に変換する
        # DynamoDBでは浮動小数点数を扱う際にDecimal型を使うのがベストプラクティス
        if 'Weight' in body:
            body['Weight'] = Decimal(str(body['Weight']))

        # DynamoDBにデータを書き込む
        # ショートカットから送られてきたJSONの構造がそのままItemになる
        response = table.put_item(
            Item=body
        )

        # 成功した場合のレスポンス
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*' # CORS設定
            },
            'body': json.dumps({'message': 'Data saved successfully!'})
        }

    except Exception as e:
        print(e) # エラー内容をログに出力
        # エラーが発生した場合のレスポンス
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*' # CORS設定
            },
            'body': json.dumps({'message': 'Error saving data.', 'error': str(e)})
        }
