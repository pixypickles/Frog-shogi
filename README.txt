池将棋MIX 試作 v0.6.1

404修正版

GitHub Pagesで battle/jump/index.html や battle/water/index.html が
404になる環境があったため、戦闘ページと必要ファイルをすべてルート直下へ移しました。

配置するファイル
- index.html
- game.js
- style.css
- jump-battle.html
- jump-battle.js
- jump-battle.css
- water-battle.html
- water-battle.js
- water-battle.css
- frog-fighter-logo.png

駒取り時
- 蓮の葉マス → jump-battle.html
- 水中マス → water-battle.html（縦持ち）
- 戦闘終了 → index.html に戻って盤面へ結果反映

GitHub Pagesへ上げる場合は、ZIP内の pond-shogi-mix-v0.6.1 フォルダの
「中身」をそのまま公開ルートへ置いてください。
