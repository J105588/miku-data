# Miku Sidebar

VS Codeのサイドバーに初音ミクを表示し、愛らしい動作で作業を彩る拡張機能です。

## 特徴

-   **リアルな腕の動き**: 2次遅れ系物理シミュレーション（バネ・マス・ダンパ・モデル）により、体の動きに合わせて腕が自然に揺れます。
-   **視線追従**: マウスカーソルの位置に合わせてミクが視線を送ります。
-   **自動復帰**: マウスがWebviewから外れると、自然な動作で正面を向き直します。
-   **多彩なアクション**: 待機時やクリック時に、ランダムに様々なモーションを行います。

## 使い方

1.  [Releases](https://github.com/J105588/miku-data/releases) から最新の `.vsix` ファイルをダウンロードします。
2.  VS Codeの Extensions（拡張機能）ビューの `...` メニューから **Install from VSIX...** を選択し、ダウンロードしたファイルを選択してインストールします。
3.  アクティビティバーにある **♪** アイコンをクリックします。
4.  サイドバーにミクが表示されます。クリックしたりマウスを動かしたりして、反応を楽しんでください。

## 技術仕様 (Technical Details)

VS CodeのWebviewコンテキストにおいて、高いパフォーマンスと安定性を実現するため以下の構成を採用しています。

-   **Engine:** PixiJS v6 & pixi-live2d-display
-   **Physics:** 2次遅れ系物理モデル（Spring-Mass-Damper）によるリアルタイム姿勢制御
-   **Optimization:** Webviewのセキュリティ制約（Trusted Types）に対応しつつ、キャンバス解像度をウィンドウサイズに動的同期

## 開発の背景

Live2D SDK標準の当たり判定（hitTest）が特定の環境で不安定になる問題を解決するため、PixiJSによる描画パイプラインへ刷新しました。これにより、低負荷ながら滑らかなアニメーションと直感的なインタラクションを実現しています。

## ⚠️ 権利表記・注意事項

本拡張機能は個人開発による非営利目的のファンメイド作品です。

-   **キャラクター著作権**: © Crypton Future Media, INC. ([PCL](https://piapro.net/pcl/) 準拠)
-   **Live2D技術**: © Live2D Inc.
-   **モデルデータ引用元**: [iCharlesZ/vscode-live2d-models](https://github.com/iCharlesZ/vscode-live2d-models) (GitHub)

---
個人利用の範囲でお楽しみください。
