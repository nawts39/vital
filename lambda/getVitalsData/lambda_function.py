import json
import boto3
from decimal import Decimal

# DynamoDBに接続
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('Vitals') # ご自身のテーブル名

# DynamoDBのDecimal型をJSONが扱えるfloat型に変換するヘルパー関数
def decimal_default_proc(obj):
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError

def lambda_handler(event, context):
    """
    DynamoDBから最新のレコードを1件取得して返す
    """
    try:
        # Scanオペレーションで全件取得（個人利用のデータ量なら問題なし）
        response = table.scan()
        
        # Itemsキーが存在し、中身が空でないことを確認
        items = response.get('Items', [])
        if not items:
            return {
                'statusCode': 404,
                'headers': { 'Access-Control-Allow-Origin': '*' },
                'body': json.dumps({'message': 'No data found.'})
            }

        # Dateをキーにして降順（新しい順）にソートし、最初の1件を取得
        latest_item = sorted(items, key=lambda x: x['Date'], reverse=True)[0]

        # 成功レスポンスを返す
        # json.dumpsにdefault=decimal_default_procを渡してDecimalをfloatに変換
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*' # CORS設定
            },
            'body': json.dumps(latest_item, default=decimal_default_proc)
        }

    except Exception as e:
        print(e)
        return {
            'statusCode': 500,
            'headers': { 'Access-Control-Allow-Origin': '*' },
            'body': json.dumps({'message': 'Error retrieving data.', 'error': str(e)})
        }
