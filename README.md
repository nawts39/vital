# バイタルまるみえくん

iOSのヘルスケアアプリに記録された日々のバイタルデータ（体重、血糖値、血圧）を、毎日自動でAWS上に集計し、Webブラウザで可視化するパーソナル健康管理ダッシュボードです。

## 主な機能

- **全自動データ収集**: iOSのショートカットアプリとオートメーション機能を利用し、毎日23:50にヘルスケアデータを自動でAPIに送信します。
- **サーバーレスバックエンド**: AWSのサーバーレスサービスを全面的に採用し、管理・運用コストを最小限に抑えています。
- **データ可視化**:
    - **ダッシュボード**: 最新のバイタルデータをカード形式で表示し、当月の全データをテーブルで確認できます。
    - **グラフ**: Chart.jsを利用し、体重、血糖値、血圧の推移をインタラクティブなグラフで視覚的に把握できます。
- **レスポンシブデザイン**: PCでもスマートフォンでも最適なレイアウトで表示されます。

---

## アーキテクチャ

このプロジェクトは、クライアントサイドの自動化とAWSのサーバーレスサービスを組み合わせることで実現されています。

### 使用技術スタック

- **クライアント & 自動化**: iOS Shortcuts
- **フロントエンド**: HTML, CSS, JavaScript (Chart.js)
- **バックエンド (AWS)**:
    - **DNS**: Amazon Route 53
    - **CDN**: Amazon CloudFront
    - **API**: Amazon API Gateway
    - **Compute**: AWS Lambda (Python 3.12)
    - **Database**: Amazon DynamoDB
    - **Storage**: Amazon S3 (Static Website Hosting)

### データフロー

#### データ登録 (Write)
`iPhone (Shortcuts) -> Route 53 -> CloudFront -> API Gateway -> Lambda (Write) -> DynamoDB`

#### データ表示 (Read)
`Browser -> Route 53 -> CloudFront -> S3 (HTML/JS/CSS)`
`Browser (JS) -> Route 53 -> CloudFront -> API Gateway -> Lambda (Read) -> DynamoDB`

---

## セットアップ

このシステムを再構築するための大まかな手順です。

1.  **AWS バックエンド構築**
    1.  **DynamoDB**: `Date`をパーティションキー（String）とするテーブルを作成します。
    2.  **Lambda**: データを書き込む関数と、データを読み出す関数（最新/月次）をPythonで作成します。DynamoDBへのアクセス権限を持つIAMロールをアタッチします。
    3.  **API Gateway**: `POST /vitals`や`GET /vitals`などのリソースとメソッドを作成し、各Lambda関数とプロキシ統合します。CORSを有効化し、カスタムドメインを設定します。
    4.  **Route 53 & ACM**: カスタムドメイン用のホストゾーンとSSL証明書を設定し、API GatewayとCloudFrontに紐付けます。

2.  **フロントエンド デプロイ**
    1.  `index.html`, `graph.html`, `style.css`, `main.js`, `graph.js` をS3バケットにアップロードします。
    2.  S3バケットで静的ウェブサイトホスティングを有効化します。
    3.  S3バケットをオリジンとするCloudFrontディストリビューションを作成し、OAC（Origin Access Control）を設定してS3への直接アクセスを制限します。

3.  **iOS ショートカット設定**
    1.  ヘルスケアから「体重」「血糖値」「血圧」のデータを取得するアクションを配置します。
    2.  取得したデータを整形し、「辞書」アクションでAPI仕様に合わせたJSONを作成します。
    3.  「URLの内容を取得」アクションで、API Gatewayのエンドポイントに`POST`リクエストを送信します。
    4.  「オートメーション」機能で、このショートカットを毎日23:50に自動実行するように設定します（「実行の前に尋ねる」はオフ）。

---
