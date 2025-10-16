import json
import boto3
from decimal import Decimal
from datetime import datetime
from boto3.dynamodb.conditions import Attr

# DynamoDBに接続
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('Vitals') # ご自身のテーブル名

# Decimalをfloatに変換するヘルパー関数
def decimal_default_proc(obj):
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError

def lambda_handler(event, context):
    """
    DynamoDBから当月のレコードを全て取得して返す
    """
    try:
        # 今日の日付から「年月」を取得 (例: "202510")
        current_month = datetime.utcnow().strftime('%Y%m')
        
        # Scanオペレーションで当月のデータをフィルタリング
        # Date (YYYYMMDD) の先頭が current_month (YYYYMM) と一致するものを検索
        response = table.scan(
            FilterExpression=Attr('Date').begins_with(current_month)
        )
        
        items = response.get('Items', [])
        if not items:
            return { 'statusCode': 404, 'headers': { 'Access-Control-Allow-Origin': '*' }, 'body': json.dumps([]) }

        # 日付の降順（新しい順）にソート
        sorted_items = sorted(items, key=lambda x: x['Date'], reverse=True)

        return {
            'statusCode': 200,
            'headers': { 'Access-Control-Allow-Origin': '*' },
            'body': json.dumps(sorted_items, default=decimal_default_proc)
        }

    except Exception as e:
        print(e)
        return { 'statusCode': 500, 'headers': { 'Access-Control-Allow-Origin': '*' }, 'body': json.dumps({'error': str(e)}) }
