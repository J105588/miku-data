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
    const modelUrl = "https://raw.githubusercontent.com/J105588/miku-data/main/miku_pro_jp/runtime/miku_sample_t04.model3.json";

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
            
            <script src="https://cdn.jsdelivr.net/npm/pixi.js@6.5.2/dist/browser/pixi.min.js"></script>
            <script src="https://cdn.jsdelivr.net/gh/stevenjoezhang/live2d-widget/live2d.min.js"></script>
            <script src="https://cdn.jsdelivr.net/npm/live2dcubismcore@1.0.2/live2dcubismcore.min.js"></script>
            <script src="https://cdn.jsdelivr.net/npm/pixi-live2d-display@0.4.0/dist/index.min.js"></script>
        </head>
        <body>
            <canvas id="canvas"></canvas>
            
            <script>
                const { Application } = PIXI;
                const Live2DModel = PIXI.live2d.Live2DModel;

                const canvas = document.getElementById('canvas');
                const app = new Application({
                    view: canvas,
                    resizeTo: window,
                    transparent: true,
                    backgroundAlpha: 0
                });

                let model;
                let autoMotionTimer;
                let lastMotionGroup = "";
                let lastExecTime = 0;

                // 利用可能なモーションから、前回と違うものをランダムに選ぶ
                function getRandomMotionGroup(availableGroups) {
                    if (availableGroups.length <= 1) return availableGroups[0];
                    let nextGroup;
                    do {
                        nextGroup = availableGroups[Math.floor(Math.random() * availableGroups.length)];
                    } while (nextGroup === lastMotionGroup);
                    return nextGroup;
                }

                // モーション実行のコア関数
                function playMotion(group, force = false) {
                    const now = Date.now();
                    // force=true（タップ等）の場合はガードを無視、それ以外は5秒ガードを適用
                    if (!force && now - lastExecTime < 5000) return;
                    
                    if (model && model.internalModel) {
                        lastExecTime = now;
                        lastMotionGroup = group;
                        model.motion(group);
                    }
                }

                function triggerRandomMotion() {
                    const motions = ["Idle", "Tap", "Flick", "FlickUp"];
                    // 自動再生はガードあり
                    playMotion(getRandomMotionGroup(motions), false);
                    resetAutoMotionTimer();
                }

                function resetAutoMotionTimer() {
                    clearTimeout(autoMotionTimer);
                    // 10秒〜20秒の間隔を厳密に生成
                    const nextTime = Math.random() * 10000 + 10000;
                    autoMotionTimer = setTimeout(triggerRandomMotion, nextTime);
                }

                function handleInteraction() {
                    const interactiveMotions = ["Tap", "Flick", "FlickUp"];
                    // 操作による反応はガードなしで即時実行
                    playMotion(getRandomMotionGroup(interactiveMotions), true);
                    resetAutoMotionTimer();
                }

                async function loadMiku() {
                    try {
                        // ライブラリ独自の自動Idle再生はオフにするが、視線追及(autoInteract)はオンにする
                        model = await Live2DModel.from('${modelUrl}', {
                            idleMotionGroup: "OFF", // 存在しないグループ名を指定して無効化
                            autoInteract: true      // マウス追随を有効化
                        });
                        
                        // 読み込み後、念の為内部設定も空にする
                        if (model.internalModel && model.internalModel.motionManager) {
                            model.internalModel.motionManager.idleMotionGroup = undefined;
                        }

                        app.stage.addChild(model);

                        const fitScale = () => {
                            model.scale.set(1);
                            const screenW = app.screen.width;
                            const screenH = app.screen.height;
                            const scale = Math.min(screenW / model.width, screenH / model.height) * 0.9;
                            model.scale.set(scale);
                            model.x = (screenW - model.width) / 2;
                            model.y = (screenH - model.height) / 2; 
                        };
                        
                        fitScale();
                        window.addEventListener('resize', fitScale);

                        // 腕の物理シミュレーション用変数 (バネ・マス・ダンパ系)
                        let armPos = 0;
                        let armVel = 0;
                        const stiffness = 0.15; // バネの強さ (戻る速さ)
                        const damping = 0.8;    // 減衰 (揺れの収まりやすさ / 重さ)

                        // 腕を動かすための設定 (Pixi.jsのTickerを使用)
                        app.ticker.add(() => {
                            if (model && model.internalModel) {
                                const core = model.internalModel.coreModel;
                                
                                // 入力の統合: 体の回転(BodyAngleX)と頭の回転(AngleX)を組み合わせる
                                // これにより、ミクが全体的にどこを向いているかを「重心」として捉える
                                const targetX = (
                                    core.getParameterValueById('ParamBodyAngleX') + 
                                    core.getParameterValueById('ParamAngleX')
                                ) * 0.5;

                                // Z軸（傾き）の影響も加味
                                const targetZ = (
                                    core.getParameterValueById('ParamBodyAngleZ') + 
                                    core.getParameterValueById('ParamAngleZ')
                                ) * 0.5;
                                
                                // 2次遅れ系（物理シミュレーション）
                                // 復元力 = -k * (現在の位置 - 目標位置)
                                // 抵抗力 = -d * 速度
                                const force = -stiffness * (armPos - (targetX + targetZ * 0.5)) - damping * armVel;
                                armVel += force;
                                armPos += armVel;

                                // 微細な呼吸の揺らぎ (1.5%程度の極微小なノイズ)
                                const breathing = Math.sin(Date.now() / 2200) * 1.0;

                                // 最終的なパラメータ設定 (ミクの腕の可動域に合わせてスケーリング)
                                // ParamArmL / ParamArmR に対して、計算した物理挙動を適用
                                const finalArmValue = armPos * 0.6 + breathing;

                                core.setParameterValueById('ParamArmL', finalArmValue);
                                core.setParameterValueById('ParamArmR', -finalArmValue);
                            }
                        });

                        // カスタムタイマーを開始
                        resetAutoMotionTimer();

                        // リスナーの登録（重複防止のため一度消してから登録）
                        window.removeEventListener('pointerdown', handleInteraction);
                        window.addEventListener('pointerdown', handleInteraction);

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