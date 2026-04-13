# MoodMap — plan.md

> Claude Code は毎セッション開始時にこのファイルを読むこと。
> 仕様変更・バグ修正・未実装タスクは随時このファイルに反映すること。

最終更新: 2026-04-13

---

## コンセプト

「今どんな気分？」1タップで記録。World ID 認証済みのユーザーが匿名で気分を投稿し、地図上で可視化する。

- **ターゲット**: World App ユーザー
- **差別化**: World ID で Sybil 耐性。実名不要・匿名で感情データを蓄積。
- **B2B 戦略**: 感情データを地域別・時間帯別に集計 → 将来的なデータ販売
- **運用工数**: ゼロ（自動集計、判定不要）

---

## 技術スタック

| 項目 | 技術 |
|------|------|
| フロントエンド | Next.js 16 (App Router) + React 19 |
| スタイリング | Tailwind CSS v4 |
| UI ライブラリ | shadcn/ui（導入予定） |
| 認証 | World ID / MiniKit (Wallet Auth) |
| DB | Supabase (world-apps プロジェクト: `wgszbxgsxekwdmssnvvd`) |
| デプロイ | Vercel: https://moodmap-five.vercel.app |
| World App ID | `app_34947c2a634b23de5d591a448a901554` |
| RP ID | `rp_233f93755e96e519` |

---

## 画面構成

| タブ | コンポーネント | 機能 |
|------|--------------|------|
| mood | `MoodScreen` | 気分選択（8種類）+ 今日の気分記録 |
| map | `MapScreen` | ユーザーの気分を地図上に可視化 |
| calendar | `CalendarScreen` | 自分の気分履歴カレンダー表示 |
| profile | `ProfileScreen` | ニックネーム設定・統計表示 |

### 認証フロー

1. World App 外 → `NotInWorldAppScreen`（ダウンロード誘導）
2. World App 内 → `WalletAuthScreen`（Wallet Auth ボタン）
3. 認証済み → メインアプリ（4タブ）

---

## API 一覧

| エンドポイント | メソッド | 機能 |
|--------------|---------|------|
| `/api/auth/nonce` | GET | Wallet Auth 用 nonce 生成 |
| `/api/auth/wallet` | POST | Wallet Auth 検証 + JWT 発行 |
| `/api/mood` | POST | 気分記録 |
| `/api/mood/me` | GET | 自分の気分履歴取得 |
| `/api/mood/map` | GET | 全ユーザーの気分（地図用） |
| `/api/mood/profile` | GET/PATCH | プロフィール取得・更新（display_name） |

---

## DB スキーマ（Supabase: world-apps）

### `mm_users`
| カラム | 型 | 説明 |
|--------|---|------|
| wallet_address | text PK | ウォレットアドレス |
| display_name | text | ニックネーム（任意） |
| created_at | timestamptz | 登録日時 |

### `moods`
| カラム | 型 | 説明 |
|--------|---|------|
| id | uuid PK | |
| wallet_address | text FK | ユーザー |
| mood | text | 気分種別（happy/sad/angry/tired/love/cool/anxious/excited） |
| lat | float | 緯度（任意） |
| lng | float | 経度（任意） |
| created_at | timestamptz | 記録日時 |

---

## 実装フェーズ

### Phase 1 — MVP ✅ 完了
- [x] World ID Wallet Auth
- [x] 気分選択 + 記録 API
- [x] カレンダー表示
- [x] 地図表示
- [x] プロフィール画面（骨格）
- [x] 多言語対応（6言語）
- [x] Vercel デプロイ + World Developer Portal 登録

### Phase 2 — UI 改善（進行中）
- [x] ファビコン・apple-touch-icon 設定
- [x] NotInWorldApp 画面テキスト改行修正
- [x] ページタイトル設定
- [ ] **ProfileScreen ニックネーム表示・編集 UI**（API は実装済み、UI 未実装）
- [ ] shadcn/ui 導入 → 新規コンポーネントから順次採用

### Phase 3 — 機能拡張（未着手）
- [ ] World ID 認証（Orb verify）オプション追加
- [ ] 地図の気分フィルタリング
- [ ] 気分ストリーク機能
- [ ] World Developer Portal 審査提出
  - 残タスク: Configuration → Allowed Origins に `https://moodmap-five.vercel.app` を追加

---

## 既知のバグ・注意事項

- ProfileScreen の display_name 編集 UI が未実装（`/api/mood/profile` PATCH は実装済み）
- MapScreen はモックデータの可能性あり → 要確認

---

## 環境変数（Vercel 設定済み）

```
NEXT_PUBLIC_WLD_APP_ID=app_34947c2a634b23de5d591a448a901554
RP_ID=rp_233f93755e96e519
RP_SIGNING_KEY=<secret>
NEXT_PUBLIC_SUPABASE_URL=https://wgszbxgsxekwdmssnvvd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<sb_publishable_...>
SUPABASE_SERVICE_ROLE_KEY=<sb_secret_...>
```
