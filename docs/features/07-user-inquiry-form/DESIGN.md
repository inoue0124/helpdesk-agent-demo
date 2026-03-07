# user-inquiry-form — 詳細設計書

## 1. 画面遷移

```
フォーム入力 → 送信 → 受付完了 → (ポーリング) → 回答表示
                                                    ↓
                                            「新しいお問い合わせ」
                                                    ↓
                                              フォーム入力に戻る
```

## 2. 画面レイアウト

### フォーム状態

```
+-------------------------------------+
|  XYZ システム サポートセンター         |
+-------------------------------------+
|                                     |
|  お名前（任意）                       |
|  +-------------------------------+  |
|  |                               |  |
|  +-------------------------------+  |
|                                     |
|  お問い合わせ内容 *                   |
|  +-------------------------------+  |
|  |                               |  |
|  |                               |  |
|  |                               |  |
|  +-------------------------------+  |
|                                     |
|           [送信する]                 |
|                                     |
+-------------------------------------+
```

### 受付完了 → 回答表示状態

```
+-------------------------------------+
|  XYZ システム サポートセンター         |
+-------------------------------------+
|                                     |
|  お問い合わせを受け付けました          |
|  受付番号: #1042                     |
|                                     |
|  担当者が確認後、回答いたします。      |
|                                     |
|  -- 回答 --                         |
|  お世話になっております。             |
|  パスワードは8文字以上で...           |
|                                     |
|  [新しいお問い合わせ]                 |
|                                     |
+-------------------------------------+
```

## 3. コンポーネント構成

```
app/user/
└── page.tsx                    # ユーザー画面（状態管理）

app/components/
├── InquiryForm.tsx             # フォーム入力
└── InquiryResult.tsx           # 受付完了 + 回答表示
```

## 4. InquiryForm

```typescript
interface InquiryFormProps {
  onSubmit: (data: { question: string; userName?: string }) => void;
  isSubmitting: boolean;
}

// shadcn/ui の Input, Textarea, Button を使用
// react-hook-form or 素の useState でフォーム管理
// バリデーション: question が空の場合にエラーメッセージ
```

## 5. InquiryResult

```typescript
interface InquiryResultProps {
  inquiryId: string;
  onReset: () => void;
}

// ポーリングフック
function useInquiryPolling(inquiryId: string) {
    const [inquiry, setInquiry] = useState<Inquiry | null>(null);

    useEffect(() => {
        const interval = setInterval(async () => {
            const res = await fetch(`${API_URL}/api/inquiries/${inquiryId}`);
            const data = await res.json();
            setInquiry(data);
            if (data.final_answer || data.status === "auto_approved") {
                clearInterval(interval);
            }
        }, 5000);
        return () => clearInterval(interval);
    }, [inquiryId]);

    return inquiry;
}
```

## 6. page.tsx（状態管理）

```typescript
// 3つの状態を管理
type PageState = "form" | "waiting" | "answered";

export default function UserPage() {
    const [state, setState] = useState<PageState>("form");
    const [inquiryId, setInquiryId] = useState<string | null>(null);

    // form → 送信 → waiting → 回答到着 → answered
    // answered → 「新しいお問い合わせ」 → form
}
```

## ファイル一覧

| ファイル | 責務 |
|---|---|
| `frontend/app/user/page.tsx` | ユーザー画面 |
| `frontend/app/components/InquiryForm.tsx` | フォーム |
| `frontend/app/components/InquiryResult.tsx` | 受付完了 + 回答表示 |
