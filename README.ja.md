# style-guide

[English](README.md) | [한국어](README.ko.md) | 日本語

共有の lint・フォーマッター設定と、自作の lint ルールをまとめたリポジトリです。

自分の JavaScript・TypeScript プロジェクトで使っている Oxlint プリセットと自作ルールを、パッケージとして公開しています。

## 特徴

- **標準で速い。** 型情報を使うルール（tsgolint）を含め、組み込みルールは Oxlint で実行します。ESLint は Oxlint で実行できないルールにだけ使います。
- **関数ひとつで設定できる。** `preset()` は Oxlint の設定一式を返します。Oxlint の `extends` では引き継がれない ignore パターンや設定も含みます。
- **フォーマットは扱わない。** フォーマットは oxfmt に任せるので、lint プリセットとフォーマッターがぶつかりません。

## はじめに

```sh
pnpm add -D oxlint oxlint-tsgolint @sonsu-lee/oxlint-config
```

```ts
// oxlint.config.ts
import { preset } from '@sonsu-lee/oxlint-config';
import { defineConfig } from 'oxlint';

export default defineConfig(preset({ node: true }, { rules: { 'no-console': 'off' } }));
```

TypeScript と型情報を使うルールが標準で有効になり、これらのルールには `oxlint-tsgolint` が必要です。JavaScript のプロジェクトでは `typescript: false` を渡してください。

| パッケージ | 説明 |
| --- | --- |
| [`@sonsu-lee/oxlint-config`](packages/oxlint-config) | Oxlint プリセットの factory |
| [`@sonsu-lee/oxlint-plugin`](packages/oxlint-plugin) | Oxlint が JS プラグインとして実行する自作ルール |

パッケージの構成は [ARCHITECTURE.md](ARCHITECTURE.md)、設計判断の理由は [docs/decisions](docs/decisions) にあります（英語）。

## サポート

[GitHub Issues](https://github.com/sonsu-lee/style-guide/issues) で issue を作成してください。

## メンテナーとコントリビューション

[@sonsu-lee](https://github.com/sonsu-lee) がメンテナンスしています。個人用の設定のため、提案は歓迎しますが、意図したスタイルを変える PR はお断りすることがあります。開発環境と規約は [CONTRIBUTING.md](CONTRIBUTING.md) を参照してください（英語）。

## ライセンス

[MIT](LICENSE) © Sonsu Lee
