# Miku Sidebar

VS Codeのサイドバーで初音ミクが動く拡張機能です。

## 特徴
- **リアルな腕の動き**: 2次遅れ系物理シミュレーション（バネ・マス・ダンパ・モデル）により、ミクの体の動きに合わせて腕が自然に揺れます。
- **視線追従**: マウスカーソルの位置に合わせてミクが視線を送ります。
- **自動復帰**: マウスがWebviewから外れると、自然な動作で正面を向き直します。
- **ランダムモーション**: 待機時やクリック時に様々なアクションを行います。

## 使い方
1. 拡張機能をインストールします。(Extensions ビューの ... メニューから Install from VSIX... を選択し、miku-sidebar-1.0.5.vsix を選択してください)
2. アクティビティバーにあるミクのアイコンをクリックします。
3. サイドバーにミクが表示されます。ミクをクリックしたり、マウスを動かしたりして反応を楽しんでください。

## 技術仕様 (Technical Details)
本拡張機能は、VS CodeのWebviewコンテキストにおいて高いパフォーマンスと安定性を実現するため、以下のスタックで構築されています。

- **Engine:** PixiJS v6 & pixi-live2d-display
- **Physics:** 2次遅れ系物理モデル（Spring-Mass-Damper）によるリアルタイム姿勢制御
- **Optimization:** Webviewのセキュリティ制約（Trusted Types）を回避しつつ、Canvas解像度をウィンドウサイズに動的同期

## 開発の背景
Live2D SDK標準の当たり判定（hitTest）が特定の環境で不安定になる問題を解決するため、PixiJSによる描画パイプラインへの完全刷新を行いました。これにより、低負荷ながら滑らかなアニメーションと正確なインタラクションを実現しています。

## ⚠️権利表記・注意事項
本拡張機能は個人開発による非営利目的のファンメイド作品です。個人利用の範囲でお楽しみください。

・キャラクター著作権：(C) Crypton Future Media, INC. (PCL準拠)  
・Live2D技術：(C) Live2D Inc.  
・モデルデータ引用元：[iCharlesZ/vscode-live2d-models](https://github.com/iCharlesZ/vscode-live2d-models) (GitHub)
