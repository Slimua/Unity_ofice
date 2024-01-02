<p align="center">
    <picture>
        <source media="(prefers-color-scheme: dark)" srcset="./docs/img/banner-light.png">
        <img src="./docs/img/banner-dark.png" alt="Univer" width="400" />
    </picture>
</p>

<p align="center">
    <a href="./LICENSE.txt">
        <img src="https://img.shields.io/github/license/dream-num/univer" alt="GitHub License" />
    </a>
    <a href="https://github.com/dream-num/univer/actions/workflows/build.yml">
        <img src="https://img.shields.io/github/actions/workflow/status/dream-num/univer/build.yml" alt="GitHub Workflow Status" />
    </a>
    <a href="https://codecov.io/gh/dream-num/univer">
        <img src="https://codecov.io/gh/dream-num/univer/graph/badge.svg?token=aPfyW2pIMN" alt="codecov" />
    </a>
    <a href="https://www.codefactor.io/repository/github/dream-num/univer/overview/dev">
        <img src="https://www.codefactor.io/repository/github/dream-num/univer/badge/dev" alt="CodeFactor" />
    </a>
    <a href="https://discord.gg/z3NKNT6D2f">
        <img src="https://img.shields.io/discord/1136129819961217077?logo=discord&logoColor=FFFFFF&label=discord&color=5865F2" alt="Discord" />
    </a>
</p>

<p align="center">
    <a href="./README.md">English</a>
    |
    <a href="./README-zh.md">简体中文</a>
    |
    日本語
</p>

<!-- An introduction photo here. -->

> 🚧 このプロジェクトはまだ開発中です。API が大きく変更される可能性があることにご注意ください。問題や提案をお寄せください。

## はじめに

Univer は、スプレッドシート、ドキュメント、スライドを含む、企業向けドキュメントおよびデータコラボレーションソリューションのセットです。拡張性の高い設計により、開発者は Univer をベースにカスタマイズされた機能を利用することができます。

Univer の機能のハイライト:

-   📈 Univer はスプレッドシートに対応しています。今後は文書やスライドにも対応する予定です。
-   🌌 拡張性の高いアーキテクチャ設計。
    -   🔌 プラグインアーキテクチャにより、ドキュメントの機能をオンデマンドで組み合わせることができ、サードパーティのプラグインをサポートし、カスタマイズ開発を容易にします。
    -   💄 開発者が一貫したユーザー体験を提供できるよう、コンポーネント・ライブラリとアイコンを提供する。
-   ⚡ ハイパフォーマンス。
    -   ✏️ Canvas をベースとした、統一された効率的なレンダリングエンジンと数式エンジン。
    -   🧮 ハイパフォーマンスフォーミュラエンジン、Web Worker をサポート。
-   🌍 国際化サポート。

## 使用方法

Univer を npm パッケージとしてインポートすることをお勧めします。ドキュメントサイトの [Quick Start](https://univer.work/ja-jp/guides/quick-start/) セクションをご覧ください。また、[オンラインプレイグラウンド](https://univer.work/playground/)では、開発環境を構築することなく Univer をプレビューすることができます。

ユニバーはプラグインアーキテクチャを採用しています。以下のパッケージをインストールすることで、Univer の機能を拡張することができます。

### パッケージ

| 名称                                               | 説明                                                                                                                      | バージョン                                                                                                                     |
| :-----------------------------------------------  | :------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------- |
| [core](./packages/core)                           | Univer のプラグインシステムとアーキテクチャを実装します。また、基本的なサービスや様々な種類のドキュメントのモデルを提供します。           | [![npm version](https://img.shields.io/npm/v/@univerjs/core)](https://npmjs.org/package/@univerjs/core)                     |
| [design](./packages/design)                       | Univer のデザインシステムを実装。CSS と React ベースのコンポーネントキットを提供します。                                            | [![npm version](https://img.shields.io/npm/v/@univerjs/design)](https://npmjs.org/package/@univerjs/design)                 |
| [docs](./packages/docs)                           | リッチテキスト編集機能の基本ロジックを実装し、また他の種類の文書でのテキスト編集を容易になります。                                       | [![npm version](https://img.shields.io/npm/v/@univerjs/docs)](https://npmjs.org/package/@univerjs/docs)                     |
| [docs-ui](./packages/docs-ui)                     | Univer ドキュメントのユーザーインターフェースを提供します。                                                                     | [![npm version](https://img.shields.io/npm/v/@univerjs/docs-ui)](https://npmjs.org/package/@univerjs/docs-ui)               |
| [engine-formula](./packages/engine-formula)       | Canvas をベースとしたレンダリングエンジンを実装し、拡張可能です。                                                                | [![npm version](https://img.shields.io/npm/v/@univerjs/engine-formula)](https://npmjs.org/package/@univerjs/engine-formula) |
| [engine-numfmt](./packages/engine-numfmt)         | ナンバーフォーマットエンジンを実装します。                                                                                     | [![npm version](https://img.shields.io/npm/v/@univerjs/engine-numfmt)](https://npmjs.org/package/@univerjs/engine-numfmt)   |
| [engine-render](./packages/engine-render)         | canvas context2d をベースにしたレンダリングエンジンを実装します。                                                          | [![npm version](https://img.shields.io/npm/v/@univerjs/engine-render)](https://npmjs.org/package/@univerjs/engine-render)   |
| [facade](./packages/facade/)                      | Univer をより簡単に使用するための API レイヤーとして機能します。                                                              | [![npm version](https://img.shields.io/npm/v/@univerjs/facade)](https://npmjs.org/package/@univerjs/facade)                       |
| [network](./packages/network)                     | WebSocket と HTTP をベースにしたネットワークサービスを実装します。                                                                      | [![npm version](https://img.shields.io/npm/v/@univerjs/network)](https://npmjs.org/package/@univerjs/network)               |
| [rpc](./packages/rpc)                             | Univer 文書の異なるレプリカ間でデータを同期するための RPC メカニズムとメソッドを実装します。                                       | [![npm version](https://img.shields.io/npm/v/@univerjs/rpc)](https://npmjs.org/package/@univerjs/rpc)                       |
| [sheets](./packages/sheets)                       | スプレッドシート機能の基本ロジック。                                                                                            | [![npm version](https://img.shields.io/npm/v/@univerjs/sheets)](https://npmjs.org/package/@univerjs/sheets)                 |
| [sheets-formula](./packages/sheets-formula)       | スプレッドシートに数式を実装します。                                                                                           | [![npm version](https://img.shields.io/npm/v/@univerjs/sheets-formula)](https://npmjs.org/package/@univerjs/sheets-formula) |
| [sheets-numfmt](./packages/sheets-numfmt)         | スプレッドシートの数値フォーマットを実装します。                                                                                     | [![npm version](https://img.shields.io/npm/v/@univerjs/sheets-numfmt)](https://npmjs.org/package/@univerjs/sheets-numfmt)   |
| [sheets-zen-editor](./packages/sheets-zen-editor) | スプレッドシートの禅編集モードを実装します。                                                                                   | [![npm version](https://img.shields.io/npm/v/@univerjs/sheets-zen-editor)](https://npmjs.org/package/@univerjs/sheets-zen-editor)   |
| [sheets-ui](./packages/sheets-ui)                 | Univer スプレッドシートのユーザーインターフェースを提供します。                                                                      | [![npm version](https://img.shields.io/npm/v/@univerjs/sheets-ui)](https://npmjs.org/package/@univerjs/sheets-ui)           |
| [ui](./packages/ui)                               | React をベースにした Univer とワークベンチのレイアウトで、基本的なユーザーインタラクションを実装します。                                 | [![npm version](https://img.shields.io/npm/v/@univerjs/ui)](https://npmjs.org/package/@univerjs/ui)                         |
| [uniscript](./packages/uniscript) (試験的)         | Typescript に基づく DSL を実装し、より高度なタスクの実行を可能にします。                                                      | [![npm version](https://img.shields.io/npm/v/@univerjs/uniscript)](https://npmjs.org/package/@univerjs/uniscript)           |

## コントリビュート

どのようなコントリビュートでも結構です。[問題や機能に関するリクエスト](https://github.com/dream-num/univer/issues)をお寄せください。まずは[コントビューティングガイド](./CONTRIBUTING.md)をお読みください。

Univer にコードをコントリビュートしたい方は、コントリビュートガイドもご参照ください。開発環境のセットアップからプルリクエストの提出までの手順を説明しています。

## Stargazers

[![Stargazers repo roster for @dream-num/univer](https://bytecrank.com/nastyox/reporoster/php/stargazersSVG.php?user=dream-num&repo=univer)](https://github.com/dream-num/univer/stargazers)

## リンク

-   [ドキュメント](https://univer.work/guides/introduction/) (現在は中国語版のみ)
-   [Online Playground](https://univer.work/playground/)
-   [公式 Website](https://univer.work)
-   [レガシー Univer デモ](https://dream-num.github.io/univer-demo/)

### コミュニティ

-   [Discord コミュニティ](https://discord.gg/z3NKNT6D2f)

## ライセンス

Univer は Apache-2.0 ライセンスの下で配布されています。

---

Copyright DreamNum Inc. 2023-現在
