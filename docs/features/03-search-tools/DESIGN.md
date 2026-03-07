# search-tools — 詳細設計書

## 1. ES キーワード検索ツール

```python
# backend/src/tools/search_xyz_manual.py
from langchain_core.tools import tool
from elasticsearch import AsyncElasticsearch

@tool
async def search_xyz_manual(query: str) -> str:
    """XYZ システムのマニュアルをキーワード検索する。
    具体的な用語や手順を探す場合に使用する。"""
    es = AsyncElasticsearch(settings.elasticsearch_url)
    result = await es.search(
        index="xyz_manual",
        body={
            "query": {
                "match": {
                    "content": {
                        "query": query,
                        "analyzer": "kuromoji"
                    }
                }
            },
            "size": 5
        }
    )
    hits = result["hits"]["hits"]
    return "\n\n".join([h["_source"]["content"] for h in hits])
```

## 2. Qdrant ベクトル検索ツール

```python
# backend/src/tools/search_xyz_qa.py
from langchain_core.tools import tool
from qdrant_client import AsyncQdrantClient
from openai import AsyncOpenAI

@tool
async def search_xyz_qa(query: str) -> str:
    """過去の QA ペアを類似検索する。
    曖昧な質問や自然言語的な問い合わせの場合に使用する。"""
    openai = AsyncOpenAI()
    embedding = await openai.embeddings.create(
        model="text-embedding-3-small",
        input=query
    )
    vector = embedding.data[0].embedding

    qdrant = AsyncQdrantClient(url=settings.qdrant_url)
    results = await qdrant.search(
        collection_name="qa_pairs",
        query_vector=vector,
        limit=5
    )
    return "\n\n".join([
        f"Q: {r.payload['question']}\nA: {r.payload['answer']}"
        for r in results
    ])
```

## 3. Elasticsearch インデックス設計

```json
{
  "settings": {
    "analysis": {
      "analyzer": {
        "kuromoji": {
          "type": "custom",
          "tokenizer": "kuromoji_tokenizer",
          "filter": ["kuromoji_baseform", "kuromoji_part_of_speech", "cjk_width", "lowercase"]
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "title": { "type": "text", "analyzer": "kuromoji" },
      "content": { "type": "text", "analyzer": "kuromoji" },
      "section": { "type": "keyword" },
      "source_file": { "type": "keyword" }
    }
  }
}
```

## 4. Qdrant コレクション設計

```python
# コレクション: qa_pairs
# ベクトル次元: 1536 (text-embedding-3-small)
# ペイロード: question, answer, source, inquiry_id, created_at
```

## 5. 初期データ投入スクリプト

```python
# backend/scripts/create_index.py
async def main():
    # 1. ES インデックス作成 + マニュアルデータ投入
    await create_es_index()
    await index_manual_documents("data/manual/")

    # 2. Qdrant コレクション作成 + 初期 QA データ投入
    await create_qdrant_collection()
    await index_qa_pairs("data/qa/")
```

## 6. データディレクトリ

```
backend/data/
├── manual/          # マニュアルテキストファイル（ES に投入）
│   └── xyz_manual.md
└── qa/              # 初期 QA データ（Qdrant に投入）
    └── initial_qa.csv
```

## ファイル一覧

| ファイル | 責務 |
|---|---|
| `backend/src/tools/search_xyz_manual.py` | ES キーワード検索 |
| `backend/src/tools/search_xyz_qa.py` | Qdrant ベクトル検索 |
| `backend/scripts/create_index.py` | 初期データ投入 |
| `backend/data/manual/` | マニュアルデータ |
| `backend/data/qa/` | 初期 QA データ |
