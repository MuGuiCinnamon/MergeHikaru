// languages.js - 游戏语言配置文件

const LANGUAGES = {
    'zh-CN': {
        // 菜单相关
        menu: {
            title: '游戏信息',
            totalTime: '游戏总时长',
            highestScore: '历史最高分',
            totalWheelCount: '合成轮子总数',
            currentScore: '当前游戏分数',
            settings: '游戏设置',
            gameMusic: '游戏音乐',
            gameSound: '游戏音效',
            language: '网页语言',
            restart: '重新开始',
            resetStats: '重置统计',
            about: '关于游戏',
            version: '合成大遗子 v2.0',
            hint: '提示：按 ESC 键可快速关闭菜单',
            confirmReset: '确定要重置所有游戏统计数据吗？此操作不可撤销。',
            resetComplete: '统计数据已重置！',
            aboutText: `合成大遗子 v2.0

            【致谢】
            本作品在制作过程中参考并使用了来自以下平台与个人的素材与支持，在此谨致以诚挚的感谢：

            ■ 素材来源平台
            • Pixabay（https://pixabay.com/）
            • DOVA-SYNDROME（https://dova-s.jp/）
            • 爱给网（https://m.aigei.com/）

            ■ 官方与原作素材
            • 《光が死んだ夏》官方网站
            • 《光が死んだ夏》漫画原作相关素材

            ■ 制作
            • 制作者：木桂 Cinnamon
            • 日语翻译：村里就俩同龄小孩还都是给子首立真是有了

            ■ 测试与支持
            • "光死去的夏天" 747065236 QQ 群中的各位朋友，感谢大家的测试、反馈与支持

            最后，衷心感谢《光が死んだ夏》为我们带来了如此动人而美好的故事，也感谢所有为本作品提供帮助与灵感的个人与平台。

            祝您游戏愉快！`
        },
        // 游戏界面相关
        game: {
            title: '合成大遗子',
            score: '分数:',
            target: '目标:',
            next: '下一个:',
            restart: '重来',
            pause: '暂停',
            continue: '继续',
            instructions: '游戏说明',
            controlMove: '移动：',
            controlMouse: '鼠标',
            controlArrow: '方向键',
            controlDrop: '放下：',
            controlSpace: '空格键',
            controlDesc1: '控制下落的遗子碎片，将其放置在合适的位置',
            controlDesc2: '当两个相同的碎片接触时，会合成一个更大的遗子碎片',
            controlDesc3: '如果碎片堆到顶部的丝线，遗子被切开，游戏结束',
            reference: '合成表',
            gameOver: '游戏结束!',
            finalScore: '最终得分:',
            highestScore: '最高分:',
            watermelonCount: '你合成了',
            watermelonUnit: '个不可名状之物!',
            playAgain: '再玩一次',
            victoryTitle: '见证了不可名状之物的降临',
            victoryDesc: '你合成了???',
            victoryTime: '耗时:',
            victoryScore: '当前分数:',
            continueBtn: '继续',
            cashoutBtn: '结束',
            victoryHint: '提示: 继续合成可获得更高分数！',
            footer: '· 同人制作 ·',
            footer2: '素材来源：pixabay，爱给网，DOVA-SYNDROME，漫画本体'
        },
        // 水果名称
        fruits: ['剑突', '左手', '右腿', '左腿', '胯部', '上身', '头部', '"光"', '遗子', '？？？']
    },
    
    'en': {
        menu: {
            title: 'Game Info',
            totalTime: 'Total Play Time',
            highestScore: 'Highest Score',
            totalWheelCount: 'Total “illegiti-mates”',//问题
            currentScore: 'Current Score',
            settings: 'Game Settings',
            gameMusic: 'Game Music',
            gameSound: 'Game Sound',
            language: 'Language',
            restart: 'Restart Game',
            resetStats: 'Reset Statistics',
            about: 'About Game',
            version: 'Merge Hikaru: The Illegiti-mate v2.0',//问题
            hint: 'Hint: Press ESC to close menu',
            confirmReset: 'Are you sure you want to reset all game statistics? This cannot be undone.',
            resetComplete: 'Statistics have been reset!',
            aboutText: `Merge Hikaru: The Illegiti-mate v2.0

                【Acknowledgments】
                This work was created with the help of resources and support from the following platforms and individuals. Sincere thanks to:

                ■ Resource Platforms
                • Pixabay (https://pixabay.com/)
                • DOVA-SYNDROME (https://dova-s.jp/)
                • Aigei.com (https://m.aigei.com/)

                ■ Official & Original Materials
                • "The Summer Hikaru Died" Official Website
                • "The Summer Hikaru Died" manga original materials

                ■ Production
                • Creator: MuGui Cinnamon
                • Japanese Translation: “The village only had two high school kids their age to begin with, and both of them were basically gay. This place was already done for”

                ■ Testing & Support
                • Friends from QQ Group 747065236, thank you for testing, feedback and support

                Finally, heartfelt thanks to "The Summer Hikaru Died" for bringing us such a touching and wonderful story, and to all individuals and platforms who provided help and inspiration for this work.

                Enjoy the game!`
        },
        game: {
            title: 'Merge Hikaru',//问题
            score: 'Score:',
            target: 'Target:',
            next: 'Next:',
            restart: 'Restart',
            pause: 'Pause',
            continue: 'Continue',
            instructions: 'Game Instructions',
            controlMove: 'Move:',
            controlMouse: 'Mouse',
            controlArrow: 'Arrow Keys',
            controlDrop: 'Drop:',
            controlSpace: 'Spacebar',
            controlDesc1: 'Control the falling “illegiti-mates” pieces and place them in suitable positions', //问题
            controlDesc2: 'When two identical pieces touch, they merge into a larger “illegiti-mates” fragment',//问题
            controlDesc3: 'If pieces stack up to the top line, the “illegiti-mates” is cut and the game ends',
            reference: 'Merge Chart',
            gameOver: 'Game Over!',
            finalScore: 'Final Score:',
            highestScore: 'Highest Score:',
            watermelonCount: 'You have merged',
            watermelonUnit: 'unnameable entities!',
            playAgain: 'Play Again',
            victoryTitle: 'Witnessed the Descent of the Unnameable',
            victoryDesc: 'You merged "???"',
            victoryTime: 'Time:',
            victoryScore: 'Current Score:',
            continueBtn: 'Continue',
            cashoutBtn: 'Cash Out',
            victoryHint: 'Hint: Continue merging for higher scores!',
            footer: '· Fan-Made ·',
            footer2: 'Resources from: pixabay, aigei.com, DOVA-SYNDROME, manga'
        },
        fruits: ['Xiphoid Process', 'Left Hand', 'Right Leg', 'Left Leg', 'Hip', 'Upper Body', 'Head', '"Hikaru"', '“illegiti-mates”', '???']
    },
    
    'ja': {
        menu: {
            title: 'メニュー',
            totalTime: 'プレイ時間',
            highestScore: 'ハイスコア',
            totalWheelCount: '落とし子の数',
            currentScore: '現在スコア',
            settings: 'オプション',
            gameMusic: '音楽・BGM',
            gameSound: '効果音・SE',
            language: '言語',
            restart: 'リトライ',
            resetStats: 'リセット',
            about: '『合成大遺子』について',
            version: '～合成大遺子～ヒカルをつなげてシンカさせよう v2.0',
            hint: '役に立つかも：ESCキーでメニューを閉じることができます',
            confirmReset: 'すべてのゲームデータをリセットしますか？この操作は後戻りできません。',
            resetComplete: 'ゲームデータをリセットしました！',
            aboutText: `合成大落とし子 v2.0
            【制作・スペシャルサンクス】
            当ゲームの制作にあたり、下記の団体及び個人からの素材とサポートを参考・使用させていただきました。心より感謝申し上げます。
            ■フリー素材サイト
            • Pixabay (https://pixabay.com/)
            • DOVA-SYNDROME (https://dova-s.jp/)
            • 爱给网 (https://m.aigei.com/)
            ■ 公式及び原作素材
            • 「光が死んだ夏」公式サイト
            • 「光が死んだ夏」漫画原作関連素材
            ■ 制作
            • 制作者：木桂 Cinnamon
            • 日本語翻訳：村で年の近い高校児たった二名なのにだれもかれもホモ寄りなんてクビタチはもうおしまいや
            ■ テスト・サポート
            • QQグループ747065236の皆様、テスト、フィードバック、サポートに感謝いたします
            最後に、感動あふれる素晴らしい原作にもお礼の一言を。ご協力、ご参考になってくださった個人や団体の方々に、心から感謝を申し上げます。
            どうぞお楽しみください！`
        },
        game: {
            title: '～合成大遺子～ヒカルをつなげてシンカさせよう',
            score: 'スコア:',
            target: '目指せ:',
            next: 'ネクスト',
            restart: 'リトライ',
            pause: '一時停止',
            continue: '続ける',
            instructions: '遊ぶ方',
            controlMove: 'カーソルの動かす方：',
            controlMouse: 'マウス',
            controlArrow: '矢印キー',
            controlDrop: '落下：',
            controlSpace: 'スペースキー',
            controlDesc1: 'ヒカルのカケラを移動し、目当ての所に落下させることができます',
            controlDesc2: '同じカケラ同士がぶつけると、より大きなヒカルのカケラに変化していく',
            controlDesc3: '積み上げたカケラが上部のワイヤーまで触れると、ヒカルが分断されゲーム終了です',
            reference: 'シンカリスト',
            gameOver: 'ゲームオーバー!',
            finalScore: '獲得スコア:',
            highestScore: 'ハイスコア:',
            watermelonCount: 'あなたは',
            watermelonUnit: 'つの名状しがたい存在にシンカさせました!',
            playAgain: 'もう一度やってみる',
            victoryTitle: '降りてきた名状しがたい存在を目撃しました',
            victoryDesc: '???にシンカさせました',
            victoryTime: 'プレイ時間:',
            victoryScore: '現在スコア:',
            continueBtn: '続ける',
            cashoutBtn: '終わりする',
            victoryHint: '役に立つかも: どんどんぶつけ合えハイスコアを目指しましょう！',
            footer: '·  ひかなつＦＡ  ·',
            footer2: 'クレジット：pixabay、爱给网、DOVA-SYNDROME、漫画'
        },
        fruits: ['胸の骨', 'ヒダリテ', 'ミギアシ', 'ヒダリアシ', 'マタグラ', 'カラダ', 'ナマクビ', 'ヒカル', '落とし子', '？？？']
    }
};

// 导出语言配置
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LANGUAGES;
}