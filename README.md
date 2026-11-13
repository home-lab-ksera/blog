# ksera's Blog

Eleventyベースの個人ブログです。
### 開発サーバーの起動

```bash
npm install
npm run dev
```

サーバーは http://localhost:8080/ で起動します。

### 記事の作成

```bash
# Tech記事
content/tech/記事タイトル.md
```

下書きを作る場合はコマンドでも生成できます。

```bash
# 下書き
npm run draft -- "記事タイトル"
```

下書きにする場合は、フロントマターに `draft: true` を追加します。

### ビルド

```bash
npm run build
```

`npm run dev` では下書きも表示されます。

## ディレクトリ構成

```
blog/
├── content/        # コンテンツ（記事）
│   ├── tech/      # Eleventy Tech記事
├── layouts/       # Eleventyレイアウト
├── .eleventy.js   # Eleventy設定
├── package.json   # Eleventy依存関係
├── public/         # ビルド出力先
├── static/         # 静的ファイル（画像など）

```

## 機能

### サイドバーウィジェット

- **検索機能** - 記事を検索
- **年月アーカイブ** - 年月ごとの投稿数を表示

### 記事のフロントマター

```yaml
---
title: "記事タイトル"
date: 2025-09-20T15:00:00+09:00
draft: false
categories: ["カテゴリ名"]
tags: ["タグ1", "タグ2"]
---
```

## CI

`push.yml` が共通 publish workflow でイメージ（`npm run build` を含む）をビルドし、main への push で Harbor へ公開します。PR ではビルドのみ行います。

## ライセンス

このブログのコンテンツは著作者（ksera）に帰属します。
