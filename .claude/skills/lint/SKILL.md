# フロントエンド / バックエンド Lint チェック

フロントエンド（TypeScript）とバックエンド（Python）の静的解析を一括実行する。
「lint」「リント」「静的解析」「チェック」で自動適用。

## 実行フロー

### 1. フロントエンド（TypeScript / Next.js）

```bash
cd frontend

# ESLint
npx eslint .

# TypeScript 型チェック
npx tsc --noEmit
```

### 2. バックエンド（Python / FastAPI）

```bash
cd backend

# 構文チェック（全 .py ファイル）
find . -name "*.py" -exec python -c "import ast; ast.parse(open('{}').read())" \;

# ruff（インストール済みの場合）
ruff check . 2>/dev/null || echo "ruff not installed — skipping"

# mypy（インストール済みの場合）
mypy . --ignore-missing-imports 2>/dev/null || echo "mypy not installed — skipping"
```

### 3. 結果レポート

```
## Lint チェック結果

### フロントエンド
- ESLint: PASS / FAIL (N errors, N warnings)
- tsc: PASS / FAIL (N errors)

### バックエンド
- 構文チェック: PASS / FAIL
- ruff: PASS / FAIL / SKIP
- mypy: PASS / FAIL / SKIP

### 総合: PASS / FAIL
```

## 注意事項

- エラーがある場合は該当ファイル・行番号・修正提案を表示する
- `--fix` オプションは付けない（自動修正は `/lint --fix` で明示的に実行）
- 引数に `--fix` が渡された場合は `npx eslint . --fix` および `ruff check . --fix` を実行する
