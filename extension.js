const vscode = require('vscode');

function activate(context) {
    const provider = {
        resolveWebviewView: (webviewView) => {
            webviewView.webview.options = { enableScripts: true };
            webviewView.webview.html = getHtmlContent();
        }
    };
    context.subscriptions.push(vscode.window.registerWebviewViewProvider("miku-sidebar-view", provider));
}

function getHtmlContent() {
    const modelUrl = "https://raw.githubusercontent.com/iCharlesZ/vscode-live2d-models/master/model-library/miku/miku.model.json";

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                html, body { 
                    margin: 0; padding: 0; width: 100%; height: 100%; 
                    overflow: hidden; background: transparent; 
                }
                #canvas {
                    position: absolute;
                    top: 0; left: 0;
                    width: 100vw !important;
                    height: 100vh !important;
                    cursor: pointer;
                    display: block;
                }
            </style>
            
            <script src="https://cdn.jsdelivr.net/gh/stevenjoezhang/live2d-widget/live2d.min.js"></script>
            <script src="https://cdn.jsdelivr.net/npm/pixi.js@6.5.2/dist/browser/pixi.min.js"></script>
            <script src="https://cdn.jsdelivr.net/npm/pixi-live2d-display@0.4.0/dist/cubism2.min.js"></script>
        </head>
        <body>
            <canvas id="canvas"></canvas>
            
            <script>
                const { Application } = PIXI;
                const { Live2DModel } = PIXI.live2d;

                const canvas = document.getElementById('canvas');
                const app = new Application({
                    view: canvas,
                    resizeTo: window,
                    transparent: true,
                    backgroundAlpha: 0
                });

                let model;
                let motionIndex = 0;
                let autoMotionTimer; // 自動モーション用のタイマー変数

                // 勝手に動く「気まぐれ」関数
                function triggerRandomMotion() {
                    if (!model || !model.internalModel) return;
                    
                    // 1〜6の中からランダムなモーションを選ぶ
                    const randomMotion = Math.floor(Math.random() * 6) + 1;
                    try {
                        model.internalModel.motionManager.startMotion("null", randomMotion, 3);
                        console.log("Auto Motion playing: " + randomMotion);
                    } catch (e) {
                        console.error("Auto Motion failed:", e);
                    }
                    
                    // 次の自動モーションをセット
                    resetAutoMotionTimer();
                }

                // タイマーをリセットして再設定する関数
                function resetAutoMotionTimer() {
                    clearTimeout(autoMotionTimer);
                    // 10秒〜20秒の間でランダムな時間を設定（ミリ秒）
                    const nextTime = Math.random() * 10000 + 10000;
                    autoMotionTimer = setTimeout(triggerRandomMotion, nextTime);
                }

                async function loadMiku() {
                    try {
                        model = await Live2DModel.from('${modelUrl}');
                        app.stage.addChild(model);

                        const fitScale = () => {
                            model.scale.set(1);
                            const screenW = app.screen.width;
                            const screenH = app.screen.height;
                            
                            const scale = Math.min(screenW / model.width, screenH / model.height) * 0.9;
                            model.scale.set(scale);
                            
                            model.x = (screenW - model.width) / 2;
                            // 画面の下端に合わせるなら以下のように調整（+20はモデルによる微調整）
                            model.y = (screenH - model.height) / 2; 
                        };
                        
                        fitScale();
                        window.addEventListener('resize', fitScale);

                        // 読み込み完了と同時に、自動モーションのタイマーを起動
                        resetAutoMotionTimer();

                        window.addEventListener('pointerdown', () => {
                            if (!model || !model.internalModel) return;
                            
                            motionIndex = (motionIndex % 6) + 1;
                            try {
                                model.internalModel.motionManager.startMotion("null", motionIndex, 3);
                            } catch (e) {
                                console.error(e);
                            }
                            
                            // ユーザーが構ってくれたら、自動モーションのタイマーをリセット（少し待つ）
                            resetAutoMotionTimer();
                        });

                    } catch (e) {
                        console.error("Load Error:", e);
                    }
                }

                loadMiku();
            </script>
        </body>
        </html>
    `;
}

exports.activate = activate;