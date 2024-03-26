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

- 📈 Univer はスプレッドシートに対応しています。今後は文書やスライドにも対応する予定です。
- 🌌 拡張性の高いアーキテクチャ設計。
  - 🔌 プラグインアーキテクチャにより、ドキュメントの機能をオンデマンドで組み合わせることができ、サードパーティのプラグインをサポートし、カスタマイズ開発を容易にします。
  - 💄 開発者が一貫したユーザー体験を提供できるよう、コンポーネント・ライブラリとアイコンを提供する。
- ⚡ ハイパフォーマンス。
  - ✏️ Canvas をベースとした、統一された効率的なレンダリングエンジンと数式エンジン。
  - 🧮 ハイパフォーマンスフォーミュラエンジン、Web Worker をサポート。
- 🌍 国際化サポート。

## 例

| <h3>📊 Univer Sheets</h3>                    |                   |
|:---------------------------------------|--------------------------------|
| [Sheets](https://www.univer.ai/examples/sheets/)<br>開いた状態: セル スタイル、数式。 第 1 四半期: 条件付き書式設定、データ検証、検索と置換。 第2四半期（予定）：フローティングピクチャ、フィルタリング、並べ替え、注釈、グラフ、ピボットテーブル、スーパーテーブル（テーブル）、図形                |                [![](./docs/img/examples-sheets.gif)](https://www.univer.ai/examples/sheets/)            |
| [Sheets Multi](https://www.univer.ai/examples/sheets-multi/)<br>テーブル間の相互運用性を可能にするために、ページ上に複数の Univer インスタンスを作成できます。    | [![](./docs/img/examples-sheets-multi.gif)](https://www.univer.ai/examples/sheets-multi/)                           |
| [Sheets Uniscript](https://www.univer.ai/examples/sheets-uniscript/)<br>Univer Sheets では、JavaScript 構文を直接使用してテーブル内のデータを操作し、自動化を実現できます。 | [![](./docs/img/examples-sheets-uniscript.gif)](https://www.univer.ai/examples/sheets-uniscript/)                       |
| [Sheets Big Data](https://www.univer.ai/examples/sheets-big-data/)<br>1,000 万セルのデータのロード、500 ミリ秒以内に完了 | [![](./docs/img/examples-sheets-big-data.gif)](https://www.univer.ai/examples/sheets-big-data/)                       |
| [Sheets Collaboration](https://univer.ai/pro-examples/sheets-collaboration/)<br>ウィンドウを 2 つ開くか、友人を招待して Univer Sheets のコラボレーションを一緒に体験してください            | [![](./docs/img/pro-examples-sheets-collaboration.gif)](https://univer.ai/pro-examples/sheets-collaboration/)                           |
| [Sheets Collaboration Playground](https://univer.ai/pro-examples/sheets-collaboration-playground/)<br>コラボレーションのプロセスをデモンストレーションします。A がフォームを編集した後、B はそれをどのように処理しますか? ここに興味深い実験があります  | [![](./docs/img/pro-examples-sheets-collaboration-playground.gif)](https://univer.ai/pro-examples/sheets-collaboration-playground/)                           |
| [Sheets Import/Export](https://univer.ai/pro-examples/sheets-exchange/)<br>xlsx ファイルのインポートとエクスポートをサポートします。                  | [![](./docs/img/pro-examples-sheets-exchange.gif)](https://univer.ai/pro-examples/sheets-exchange/)                           |
| [Sheets Print](https://univer.ai/pro-examples/sheets-print/)<br>Univer Sheets の HD 印刷機能を体験してください                     | [![](./docs/img/pro-examples-sheets-print.gif)](https://univer.ai/pro-examples/sheets-print/)                           |
| [Sheets Data Validation / Conditional Formatting](https://univer-qqqkeqnw5-univer.vercel.app/sheets/)<br>Univer Sheets データ形式と条件付き書式の開発プレビュー                     | [![](./docs/img/examples-sheets-data-validation-conditional-format.png)](https://univer-qqqkeqnw5-univer.vercel.app/sheets/)                           |
| <h3>📝 Univer Docs</h3>                    |                   |
| [Docs](https://www.univer.ai/examples/docs/)<br>すでに開いています: 順序付きおよび順序なしリスト、段落設定、グラフィックとテキストの混合、セクション内の複数列/単一列表示 (暫定): ハイパーリンク、コメント、表、グラフ                                  | [![](./docs/img/examples-docs.gif)](https://www.univer.ai/examples/docs/)                           |
| [Docs Multi](https://www.univer.ai/examples/docs-multi/)<br>ドキュメントを相互運用できるように、ページ内に複数の Univer インスタンスを作成できます。 | [![](./docs/img/examples-docs-multi.gif)](https://www.univer.ai/examples/docs-multi/)                          |
| [Docs Uniscript](https://www.univer.ai/examples/docs-uniscript/)<br>JavaScript 構文を直接使用して、Univer Docs のコンテンツを操作できます。 | [![](./docs/img/examples-docs-uniscript.gif)](https://www.univer.ai/examples/docs-uniscript/)                          |
| [Docs Big Data](https://www.univer.ai/examples/docs-big-data/)<br>100万語のドキュメント読み込みデモ | [![](./docs/img/examples-docs-big-data.gif)](https://www.univer.ai/examples/docs-big-data/)                          |
| [Docs Collaboration](https://univer.ai/pro-examples/docs-collaboration/)<br>2 つのウィンドウを開くか、友人を招待して Univer Docs コラボレーションを一緒に体験してください               | [![](./docs/img/pro-examples-docs-collaboration.gif)](https://univer.ai/pro-examples/docs-collaboration/)                           |
| [Docs Collaboration Playground](https://univer.ai/pro-examples/docs-collaboration-playground/)<br>コラボレーションのプロセスをデモンストレーションします。A がドキュメントを編集した後、B はそれをどのように処理しますか? ここに興味深い実験があります    | [![](./docs/img/pro-examples-docs-collaboration-playground.gif)](https://univer.ai/pro-examples/docs-collaboration-playground/)    |
| <h3>▶️ Univer Slides</h3>                    |                   |
| [Slides](https://www.univer.ai/examples/slides/)<br>グラフィックテキスト、フローティングピクチャ、テーブル、その他の要素を含むキャンバスプレゼンテーション                                  | [![](./docs/img/examples-slides.gif)](https://www.univer.ai/examples/slides/)                           |
| <h3>🧩 Univer Innovation</h3>                    |                   |
| [Zen Mode](https://github.com/dream-num/univer)<br>SheetのセルはDocですか？                                  | [![](./docs/img/zen-mode.gif)](https://github.com/dream-num/univer)                           |
| [Univer(SaaS version)](https://univer.ai/)<br>Univerでは、ユーザーが自由に3つの形式のページを作成できるようにします。 Univer は、シート、ドキュメント、スライドの機能を統合することで、個人やチームがワークフローを簡単に作成、整理、合理化できるようにします。                                  | [![](./docs/img/univer-workspace-drag-chart.gif)](https://youtu.be/kpV0MvQuFZA)                           |

## 使用方法

Univer を npm パッケージとしてインポートすることをお勧めします。ドキュメントサイトの [Quick Start](https://univer.ai/ja-jp/guides/quick-start/) セクションをご覧ください。また、[オンラインプレイグラウンド](https://univer.ai/playground/)では、開発環境を構築することなく Univer をプレビューすることができます。

ユニバーはプラグインアーキテクチャを採用しています。以下のパッケージをインストールすることで、Univer の機能を拡張することができます。

### パッケージ

| 名称                                                       | 説明                                                                                                                      | バージョン                                                                                                                     |
| :-------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------ | :-------------------------------------------------------------------------------------------------------------------------- |
| [core](./packages/core)                                   | Univer のプラグインシステムとアーキテクチャを実装します。また、基本的なサービスや様々な種類のドキュメントのモデルを提供します。               | [![npm version](https://img.shields.io/npm/v/@univerjs/core)](https://npmjs.org/package/@univerjs/core)                     |
| [design](./packages/design)                               | Univer のデザインシステムを実装。CSS と React ベースのコンポーネントキットを提供します。                                              | [![npm version](https://img.shields.io/npm/v/@univerjs/design)](https://npmjs.org/package/@univerjs/design)                 |
| [docs](./packages/docs)                                   | リッチテキスト編集機能の基本ロジックを実装し、また他の種類の文書でのテキスト編集を容易になります。                                        | [![npm version](https://img.shields.io/npm/v/@univerjs/docs)](https://npmjs.org/package/@univerjs/docs)                     |
| [docs-ui](./packages/docs-ui)                             | Univer ドキュメントのユーザーインターフェースを提供します。                                                                       | [![npm version](https://img.shields.io/npm/v/@univerjs/docs-ui)](https://npmjs.org/package/@univerjs/docs-ui)               |
| [engine-formula](./packages/engine-formula)               | Canvas をベースとしたレンダリングエンジンを実装し、拡張可能です。                                                                  | [![npm version](https://img.shields.io/npm/v/@univerjs/engine-formula)](https://npmjs.org/package/@univerjs/engine-formula) |
| [engine-numfmt](./packages/engine-numfmt)                 | ナンバーフォーマットエンジンを実装します。                                                                                      | [![npm version](https://img.shields.io/npm/v/@univerjs/engine-numfmt)](https://npmjs.org/package/@univerjs/engine-numfmt)   |
| [engine-render](./packages/engine-render)                 | canvas context2d をベースにしたレンダリングエンジンを実装します。                                                                | [![npm version](https://img.shields.io/npm/v/@univerjs/engine-render)](https://npmjs.org/package/@univerjs/engine-render)   |
| [facade](./packages/facade/)                              | Univer をより簡単に使用するための API レイヤーとして機能します。                                                                  | [![npm version](https://img.shields.io/npm/v/@univerjs/facade)](https://npmjs.org/package/@univerjs/facade)                       |
| [find-replace](./packages/find-replace)                   | Univer の検索と置換機能を実装しています。                                                                                      | [![npm version](https://img.shields.io/npm/v/@univerjs/find-replace)](https://npmjs.org/package/@univerjs/find-replace)               |
| [network](./packages/network)                             | WebSocket と HTTP をベースにしたネットワークサービスを実装します。                                                                | [![npm version](https://img.shields.io/npm/v/@univerjs/network)](https://npmjs.org/package/@univerjs/network)               |
| [rpc](./packages/rpc)                                     | Univer 文書の異なるレプリカ間でデータを同期するための RPC メカニズムとメソッドを実装します。                                            | [![npm version](https://img.shields.io/npm/v/@univerjs/rpc)](https://npmjs.org/package/@univerjs/rpc)                       |
| [sheets](./packages/sheets)                               | スプレッドシート機能の基本ロジック。                                                                                            | [![npm version](https://img.shields.io/npm/v/@univerjs/sheets)](https://npmjs.org/package/@univerjs/sheets)                 |
| [sheets-find-replace](./packages/sheets-find-replace)     | スプレッドシートの検索と置換機能を実装しています。                                                                             | [![npm version](https://img.shields.io/npm/v/@univerjs/sheets-find-replace)](https://npmjs.org/package/@univerjs/sheets-find-replace) |
| [sheets-formula](./packages/sheets-formula)               | スプレッドシートに数式を実装します。                                                                                           | [![npm version](https://img.shields.io/npm/v/@univerjs/sheets-formula)](https://npmjs.org/package/@univerjs/sheets-formula) |
| [sheets-numfmt](./packages/sheets-numfmt)                 | スプレッドシートの数値フォーマットを実装します。                                                                                     | [![npm version](https://img.shields.io/npm/v/@univerjs/sheets-numfmt)](https://npmjs.org/package/@univerjs/sheets-numfmt)   |
| [sheets-zen-editor](./packages/sheets-zen-editor)         | スプレッドシートの禅編集モードを実装します。                                                                                   | [![npm version](https://img.shields.io/npm/v/@univerjs/sheets-zen-editor)](https://npmjs.org/package/@univerjs/sheets-zen-editor)   |
| [sheets-ui](./packages/sheets-ui)                         | Univer スプレッドシートのユーザーインターフェースを提供します。                                                                      | [![npm version](https://img.shields.io/npm/v/@univerjs/sheets-ui)](https://npmjs.org/package/@univerjs/sheets-ui)           |
| [ui](./packages/ui)                                       | React をベースにした Univer とワークベンチのレイアウトで、基本的なユーザーインタラクションを実装します。                                 | [![npm version](https://img.shields.io/npm/v/@univerjs/ui)](https://npmjs.org/package/@univerjs/ui)                         |
| [uniscript](./packages/uniscript) (試験的)                 | Typescript に基づく DSL を実装し、より高度なタスクの実行を可能にします。                                                      | [![npm version](https://img.shields.io/npm/v/@univerjs/uniscript)](https://npmjs.org/package/@univerjs/uniscript)           |

## コントリビュート

どのようなコントリビュートでも結構です。[問題や機能に関するリクエスト](https://github.com/dream-num/univer/issues)をお寄せください。まずは[コントビューティングガイド](./CONTRIBUTING.md)をお読みください。

Univer にコードをコントリビュートしたい方は、コントリビュートガイドもご参照ください。開発環境のセットアップからプルリクエストの提出までの手順を説明しています。

## サポート

Univer プロジェクトの成長と開発は、バッカーやスポンサーのサポートに依存しています。プロジェクトをサポートしていただける方は、スポンサーになることを検討していただければ幸いです。[Open Collective](https://opencollective.com/univer) からスポンサーになることができます。

スポンサーの皆様、ありがとうございます。スペースの制限のため、一部のスポンサーのみをここに掲載しています。ランキングは特にありません。

<a href="https://opencollective.com/univer/sponsor/0/website" target="_blank"><img src="https://opencollective.com/univer/sponsor/0/avatar.svg"></a>
<a href="https://opencollective.com/univer/sponsor/1/website" target="_blank"><img src="https://opencollective.com/univer/sponsor/1/avatar.svg"></a>
<a href="https://opencollective.com/univer/sponsor/2/website" target="_blank"><img src="https://opencollective.com/univer/sponsor/2/avatar.svg"></a>
<a href="https://opencollective.com/univer/sponsor/3/website" target="_blank"><img src="https://opencollective.com/univer/sponsor/3/avatar.svg"></a>
<a href="https://opencollective.com/univer/sponsor/4/website" target="_blank"><img src="https://opencollective.com/univer/sponsor/4/avatar.svg"></a>
<a href="https://opencollective.com/univer/sponsor/5/website" target="_blank"><img src="https://opencollective.com/univer/sponsor/5/avatar.svg"></a>
<a href="https://opencollective.com/univer/sponsor/6/website" target="_blank"><img src="https://opencollective.com/univer/sponsor/6/avatar.svg"></a>

<a href="https://opencollective.com/univer/backer/0/website" target="_blank"><img src="https://opencollective.com/univer/backer/0/avatar.svg"></a>
<a href="https://opencollective.com/univer/backer/1/website" target="_blank"><img src="https://opencollective.com/univer/backer/1/avatar.svg"></a>
<a href="https://opencollective.com/univer/backer/2/website" target="_blank"><img src="https://opencollective.com/univer/backer/2/avatar.svg"></a>
<a href="https://opencollective.com/univer/backer/3/website" target="_blank"><img src="https://opencollective.com/univer/backer/3/avatar.svg"></a>
<a href="https://opencollective.com/univer/backer/4/website" target="_blank"><img src="https://opencollective.com/univer/backer/4/avatar.svg"></a>
<a href="https://opencollective.com/univer/backer/5/website" target="_blank"><img src="https://opencollective.com/univer/backer/5/avatar.svg"></a>
<a href="https://opencollective.com/univer/backer/6/website" target="_blank"><img src="https://opencollective.com/univer/backer/6/avatar.svg"></a>

## Stargazers

[![Stargazers repo roster for @dream-num/univer](https://bytecrank.com/nastyox/reporoster/php/stargazersSVG.php?user=dream-num&repo=univer)](https://github.com/dream-num/univer/stargazers)

## リンク

- [ドキュメント](https://univer.ai/ja-jp/guides/introduction/)
- [Online Playground](https://univer.ai/playground/)
- [公式 Website](https://univer.ai)

### コミュニティ

- [Discord コミュニティ](https://discord.gg/z3NKNT6D2f)

## ライセンス

Univer は Apache-2.0 ライセンスの下で配布されています。

---

Copyright DreamNum Inc. 2023-現在
