# 006: 画像処理サービス実装

## 概要
カメラ撮影・ギャラリー選択で取得した画像のリサイズ、Base64 変換、ローカルファイルシステムへの保存を行うサービスを実装する。

## 依存先
001 (基盤整備 - パッケージインストール)

## ブロック対象
007

## 作業内容

### 1. 画像処理サービス (`services/image-processor.ts`)

#### 画像リサイズ
```typescript
resizeImage(imageUri: string, maxWidth?: number): Promise<string>
// - expo-image-manipulator を使用
// - デフォルト幅 800px
// - JPEG 圧縮率 0.8
// - リサイズ後の URI を返す
```

#### Base64 変換
```typescript
imageToBase64(imageUri: string): Promise<string>
// - expo-file-system の readAsStringAsync を使用
// - EncodingType.Base64 指定
```

#### リサイズ + Base64 (API送信用)
```typescript
prepareImageForApi(imageUri: string): Promise<{ base64: string; mediaType: string }>
// - リサイズ → Base64 変換をまとめて実行
// - API に送信可能な形式で返す
```

#### ローカル保存
```typescript
saveBreedPhoto(imageUri: string, breedId: string): Promise<string>
// - documentDirectory/breeds/ 配下に保存
// - ファイル名: {breedId}_{timestamp}.jpg
// - 保存先パスを返す
```

#### 画像削除
```typescript
deleteBreedPhoto(photoPath: string): Promise<void>
// - ローカルファイルを削除
```

### 2. ディレクトリ初期化
- アプリ起動時に `documentDirectory/breeds/` ディレクトリを作成

## 完了条件
- 画像リサイズが正しく動作する (800px幅)
- Base64 変換が正しく行われる
- ローカルファイルシステムへの保存・削除ができる
- API 送信用のフォーマットが正しい
- TypeScript コンパイルエラーがない

## TODO
- [x] services/image-processor.ts 作成
- [x] resizeImage 関数実装 (expo-image-manipulator)
- [x] imageToBase64 関数実装 (expo-file-system)
- [x] prepareImageForApi 関数実装
- [x] saveBreedPhoto 関数実装
- [x] deleteBreedPhoto 関数実装
- [x] breeds ディレクトリ初期化処理
