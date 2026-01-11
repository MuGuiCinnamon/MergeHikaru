// 游戏主逻辑
document.addEventListener('DOMContentLoaded', () => {
    // 初始化动态背景
    initDynamicBackground();
    // Matter.js 模块
    const {
        Engine,
        Render,
        Runner,
        World,
        Bodies,
        Events,
        Body,
        Composite
    } = Matter;

    // 游戏配置
    const CONFIG = {
        canvasWidth: 400,
        canvasHeight: 600,
        fruitTypes: [
            { name: '剑突', radius: 20, color: '#e53e3e', score: 1 },
            { name: '左手', radius: 30, color: '#dd6b20', score: 2 },
            { name: '右腿', radius: 40, color: '#805ad5', score: 5 },
            { name: '左腿', radius: 50, color: '#d69e2e', score: 10 },
            { name: '胯部', radius: 60, color: '#38a169', score: 20 },
            { name: '上身', radius: 70, color: '#ecc94b', score: 40 },
            { name: '头部', radius: 80, color: '#ed8936', score: 80 },
            { name: '"光"', radius: 90, color: '#d69e2e', score: 160 },
            { name: '遗子', radius: 100, color: '#48bb78', score: 320 },
            { name: '？？？', radius: 110, color: '#276749', score: 640 }
        ],
        nextFruitTypes: [0, 1, 2, 3],
        warningLineHeight: 10  // 警戒线高度
    };

    // 游戏状态
    let gameState = {
        score: 0,
        highestScore: localStorage.getItem('highestScore') || 0,
        fruits: [],          // 存储 {body, el, type} 对象
        currentFruit: null,  // 当前预览的水果 {type, el, x}
        nextFruitType: 0,
        isGameOver: false,
        isPaused: false,
        isSoundOn: true,
        watermelonCount: 0,
        gameSpeed: 1,
        isGameFocused: false,
        isAboutToEnd:false,
        dangerCounter:0,
        isMusicOn: true,
        backgroundMusicVolume: 0.5,
        victoryAchieved: false,        
        startTime: Date.now(),         
        victoryTime: 0,                
        hasShownVictory: false,        

    };

    // DOM元素
    const canvasEl = document.getElementById('game-canvas');
    const scoreEl = document.getElementById('score');
    const finalScoreEl = document.getElementById('final-score');
    const highestScoreEl = document.getElementById('highest-score');
    const watermelonCountEl = document.getElementById('watermelon-count');
    const nextFruitEl = document.getElementById('next-fruit');
    const restartBtn = document.getElementById('restart-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const soundBtn = document.getElementById('sound-btn');
    const playAgainBtn = document.getElementById('play-again-btn');
    const gameOverModal = document.getElementById('game-over');
    const fruitReferenceList = document.getElementById('fruit-reference-list');
    const targetFruitEl = document.getElementById('target-fruit');
    const victoryModal = document.getElementById('victory-modal');
    const victoryTimeEl = document.getElementById('victory-time');
    const victoryScoreEl = document.getElementById('victory-score');
    const continueBtn = document.getElementById('continue-btn');
    const cashoutBtn = document.getElementById('cashout-btn');


    // 音效
    const mergeSound = document.getElementById('merge-sound');
    const dropSound = document.getElementById('drop-sound');
    const gameOverSound = document.getElementById('game-over-sound');
    const backgroundMusic = document.getElementById('background-music');

    // ========== Matter.js 初始化 ==========
    const engine = Engine.create();
    engine.gravity.y = 0.8;  // 重力值，可以调整
    engine.gravity.x = 0;
    engine.gravity.scale = 0.003;

    const world = engine.world;
    const runner = Runner.create();

    // 创建墙体
    const wallThickness = 50;
    const ground = Bodies.rectangle(
        CONFIG.canvasWidth / 2,
        CONFIG.canvasHeight + wallThickness / 2,
        CONFIG.canvasWidth,
        wallThickness,
        { isStatic: true, label: 'wall' }
    );

    const leftWall = Bodies.rectangle(
        -wallThickness / 2,
        CONFIG.canvasHeight / 2,
        wallThickness,
        CONFIG.canvasHeight,
        { isStatic: true, label: 'wall' }
    );

    const rightWall = Bodies.rectangle(
        CONFIG.canvasWidth + wallThickness / 2,
        CONFIG.canvasHeight / 2,
        wallThickness,
        CONFIG.canvasHeight,
        { isStatic: true, label: 'wall' }
    );

    World.add(world, [ground, leftWall, rightWall]);

    // ========== 游戏核心函数 ==========

    // 初始化游戏
    function initGame() {
        // 重置游戏状态
        gameState = {
            score: 0,
            highestScore: localStorage.getItem('highestScore') || 0,
            fruits: [],
            currentFruit: null,
            nextFruitType: getRandomFruitType(),
            isGameOver: false,
            isPaused: false,
            isSoundOn: true,
            watermelonCount: 0,
            gameSpeed: 1,
            isGameFocused: false,
            isMusicOn: true,
            backgroundMusicVolume: 0.5,
            victoryAchieved: false,
            startTime: Date.now(),
            victoryTime: 0,
            hasShownVictory: false,
            watermelonCount: 0, // 确保重置计数
        };

        

        // 清除所有物理实体
        World.clear(world, false);
        World.add(world, [ground, leftWall, rightWall]);


        // 清空画布
        canvasEl.innerHTML = '';

        // 清理所有现有的特殊效果定时器
        gameState.fruits.forEach(fruit => {
            if (fruit.specialTimer) {
                clearTimeout(fruit.specialTimer);
                //console.log(`✅ 清理定时器: 水果类型=${fruit.type}, ID=${fruit.fruitId}`);
            }
        });

        // 更新UI
        updateScore();
        updateNextFruit();
        updateHighestScore();
        victoryModal.style.display = 'none';
        gameOverModal.style.display = 'none';

        // 设置背景音乐
        
        

        // 生成水果参考表
        generateFruitReference();

        // 设置目标水果 
        targetFruitEl.textContent = CONFIG.fruitTypes[CONFIG.fruitTypes.length - 1].name;

        // 创建第一个预览水果
        setTimeout(() => {
            // 创建第一个预览水果
            createNewFruit();
        }, 100);

        // 启动 Matter.js 引擎
        Runner.run(runner, engine);
    }

    // 生成随机水果类型
    function getRandomFruitType() {
        return CONFIG.nextFruitTypes[Math.floor(Math.random() * CONFIG.nextFruitTypes.length)];
    }

    // 创建预览水果
    function createNewFruit() {
        const type = gameState.nextFruitType;
        const fruitType = CONFIG.fruitTypes[type];
        
        // 创建预览 DOM 元素
        const el = drawFruit(type, CONFIG.canvasWidth / 2, 50);
        canvasEl.appendChild(el);
        
        gameState.currentFruit = {
            type: type,
            el: el,
            x: CONFIG.canvasWidth / 2
        };

        // 更新下一个水果
        gameState.nextFruitType = getRandomFruitType();
        updateNextFruit();
    }

    // 创建物理水果实体
    function createFruit(type, x, y) {
        const fruitType = CONFIG.fruitTypes[type];
        
        // 创建 Matter.js 物理实体
        const body = Bodies.circle(x, y, fruitType.radius, {
            restitution: 0.2,
            friction: 0.05,
            frictionAir: 0.001,
            density: 0.01,
            label: 'fruit',
            render: { fillStyle: fruitType.color }
        });
        
        // 添加自定义属性
        body.fruitType = type;
        body.isMerging = false;
        body.fruitId = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        
        // 添加到世界
        World.add(world, body);
        
        // 创建对应的 DOM 元素（使用精灵图）
        const el = drawFruit(type, x, y, false); // 初始不是特殊状态
        canvasEl.appendChild(el);
        
        // 保存到游戏状态
        const fruitObj = {
            body: body,
            el: el,
            type: type,
            fruitId: body.fruitId,
            specialTimer: null,
            isSpecialState: false
        };
        
        // 特殊效果
        if (type === 6 || type === 9) { // 头部
            startHeadSpecialEffect(fruitObj);
        } 
        else if (type === 8) { // 遗子
            startYiziSpecialEffect(fruitObj);
        }
        
        return fruitObj;
    }
    // 切换水果图片
    // 切换水果图片 - 精灵图版本
    function switchFruitImage(fruitObj, special) {
        if (!fruitObj.el) return;
        
        const type = fruitObj.type;
        const baseClass = `fruit fruit-sprite fruit-game fruit-type-${type}`;
        
        // 移除特殊类或普通类
        fruitObj.el.className = special ? 
            `${baseClass} fruit-type-${type}-special` : 
            baseClass;
        
        fruitObj.isSpecialState = special;
    }
    // 头部特殊效果
    // 头部特殊效果
    function startHeadSpecialEffect(fruitObj) {
        // 随机延迟：1-10秒
        const randomDelay = 1000 + Math.random() * 9000;
        
        fruitObj.specialTimer = setTimeout(() => {
            if (!fruitObj.el || !fruitObj.el.parentNode) return;
            
            // 切换到特殊图片
            switchFruitImage(fruitObj, true);
            
            // 5秒后恢复
            setTimeout(() => {
                if (!fruitObj.el || !fruitObj.el.parentNode) return;
                
                // 恢复普通图片
                switchFruitImage(fruitObj, false);
                
                // 重新启动效果
                startHeadSpecialEffect(fruitObj);
            }, 5000);
            
        }, randomDelay);
    }

    // 遗子特殊效果
    function startYiziSpecialEffect(fruitObj) {
        let isSpecial = false;
        
        function toggleEffect() {
            if (!fruitObj.el || !fruitObj.el.parentNode) return;
            
            isSpecial = !isSpecial;
            switchFruitImage(fruitObj, isSpecial);
            
            // 1秒后再次切换
            fruitObj.specialTimer = setTimeout(toggleEffect, 1000);
        }
        
        // 1秒后开始
        fruitObj.specialTimer = setTimeout(toggleEffect, 1000);
    }


    // 绘制水果 DOM 元素 - 修改后版本
    // 修改绘制水果DOM元素的函数
    function drawFruit(type, x, y, isSpecial = false) {
        const fruitType = CONFIG.fruitTypes[type];
        const fruitEl = document.createElement('div');

        // 使用精灵图类
        const specialClass = isSpecial ? ' fruit-type-${type}-special' : '';
        fruitEl.className = `fruit fruit-sprite fruit-game fruit-type-${type}${specialClass}`;
        
        // 其他属性保持不变
        fruitEl.dataset.fruitId = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        fruitEl.dataset.fruitType = type;
        fruitEl.style.width = `${fruitType.radius * 2}px`;
        fruitEl.style.height = `${fruitType.radius * 2}px`;

        //fruitEl.style.border = '3px solid rgba(255, 0, 0, 0.3)';
        fruitEl.style.position = 'absolute';
        fruitEl.style.borderRadius = '100%';
        /*fruitEl.style.display = 'flex';
        fruitEl.style.alignItems = 'center';
        fruitEl.style.justifyContent = 'center';
        fruitEl.style.userSelect = 'none';
        fruitEl.style.border = '3px solid rgba(0, 0, 0, 0)';*/
        fruitEl.style.transform = `translate(${x - fruitType.radius}px, ${y - fruitType.radius}px)`;
        
        return fruitEl;
    }

    // 放下当前水果
    function dropCurrentFruit() {
        if (!gameState.currentFruit || gameState.isGameOver || gameState.isPaused) return;
        
        // 创建物理实体
        const fruit = createFruit(
            gameState.currentFruit.type,
            gameState.currentFruit.x,
            50
        );
        
        // 添加到游戏状态
        gameState.fruits.push(fruit);
        
        // 移除预览元素
        canvasEl.removeChild(gameState.currentFruit.el);
        gameState.currentFruit = null;
        
        // 播放下落音效
        if (gameState.isSoundOn) {
            dropSound.currentTime = 0;
            dropSound.play();
        }
        if (gameState.isMusicOn) {
            backgroundMusic.volume = gameState.backgroundMusicVolume;
            if (!gameState.isPaused && !gameState.isGameOver) {
                backgroundMusic.play().catch(e => console.log('背景音乐播放失败:', e));
            }
        } else {
            backgroundMusic.pause();
        }
        
        setTimeout(() => {
            if (!gameState.isGameOver && !gameState.isPaused) {
                createNewFruit();
            }
        }, 500); // 1000ms = 1秒延迟
    }

    // 更新分数显示
    function updateScore() {
        scoreEl.textContent = gameState.score;
        
        // 更新最高分
        if (gameState.score > gameState.highestScore) {
            gameState.highestScore = gameState.score;
            localStorage.setItem('highestScore', gameState.highestScore);
            updateHighestScore();
        }
    }

    // 更新最高分显示
    function updateHighestScore() {
        highestScoreEl.textContent = gameState.highestScore;
    }

    // 更新下一个水果显示
    // 更新下一个水果显示 - 修改后版本
    function updateNextFruit() {
        const fruitType = CONFIG.fruitTypes[gameState.nextFruitType];
        
        // 清空并添加精灵图类
        nextFruitEl.innerHTML = '';
        nextFruitEl.className = 'next-fruit fruit-sprite fruit-next';
        nextFruitEl.classList.add(`fruit-type-${gameState.nextFruitType}`);
        
        // 设置大小
        nextFruitEl.style.borderRadius = '50%';
        nextFruitEl.style.border = '2px solid rgba(255, 255, 255, 0.5)';
        nextFruitEl.style.display = 'block'; 
        nextFruitEl.setAttribute('data-type', gameState.nextFruitType);
    }

    // 生成水果参考表
    function generateFruitReference() {
        fruitReferenceList.innerHTML = '';
        
        CONFIG.fruitTypes.forEach((fruit, index) => {
            const fruitItem = document.createElement('div');
            fruitItem.className = 'fruit-ref-item';
            
            const iconEl = document.createElement('div');
            iconEl.className = `fruit-ref-icon fruit-sprite fruit-ref fruit-type-${index}`; // 使用精灵图类
            iconEl.style.cssText = `
                border-radius: 50%;
                
                box-shadow: 0 3px 8px rgba(0, 0, 0, 0.3);
            `;
            
            fruitItem.appendChild(iconEl);
            
            const nameEl = document.createElement('span');
            nameEl.className = 'fruit-ref-name';
            nameEl.textContent = fruit.name;
            
            const scoreEl = document.createElement('span');
            scoreEl.className = 'fruit-ref-score';
            scoreEl.textContent = `${fruit.score}分`;
            
            fruitItem.appendChild(nameEl);
            fruitItem.appendChild(scoreEl);
            
            fruitReferenceList.appendChild(fruitItem);
        });
    }

    // 显示胜利界面
    function showVictoryModal() {
        if (gameState.isGameOver) return;
        
        // 暂停游戏
        gameState.isPaused = true;
        Runner.stop(runner);
        pauseBtn.innerHTML = '<i class="fas fa-play"></i> 继续';
        
        // 更新界面信息
        victoryTimeEl.textContent = gameState.victoryTime;
        victoryScoreEl.textContent = gameState.score;
        
        // 播放胜利音效
        if (gameState.isSoundOn) {
            // 可以添加专门的胜利音效
            const victorySound = new Audio('assets/audio/victory.mp3');
            victorySound.volume = 0.5;
            victorySound.play().catch(e => console.log('胜利音效播放失败'));
        }
        
        // 显示界面
        victoryModal.style.display = 'flex';
    }

    // 隐藏胜利界面
    function hideVictoryModal() {
        victoryModal.style.display = 'none';
    }

    // 继续游戏
    function continueGame() {
        hideVictoryModal();
        gameState.isPaused = false;
        Runner.run(runner, engine);
        pauseBtn.innerHTML = '<i class="fas fa-pause"></i> 暂停';
        
        // 恢复背景音乐
        if (gameState.isMusicOn) {
            backgroundMusic.play().catch(e => console.log('背景音乐恢复失败'));
        }
    }

    // 立即结算
    function cashoutGame() {
        hideVictoryModal();
        endGame(); // 使用现有的游戏结束逻辑
    }

    // 检查游戏结束
    function checkGameOver() {
        let aboveLineCount = 0;  // 超过警戒线的水果数量
        let frameThreshold = 80; // 帧数阈值
        
        for (let i = 0; i < gameState.fruits.length; i++) {
            const fruit = gameState.fruits[i];
            const body = fruit.body;
            
            // 计算水果顶部位置
            const fruitTop = body.position.y - body.circleRadius;
            
            // 检查是否超过警戒线
            if (fruitTop < CONFIG.warningLineHeight) {
                // 增加持续时间
                if (!fruit.aboveDuration) {
                    fruit.aboveDuration = 1;
                } else {
                    fruit.aboveDuration++;
                }
                
                // 如果这个水果持续时间超过阈值，立即结束游戏
                if (fruit.aboveDuration >= frameThreshold) {
                    console.log(`游戏结束！水果 ${fruit.fruitId} 已超过警戒线${frameThreshold}帧`);
                    endGame();
                    return;
                }
                
                // 统计超过警戒线的水果数量
                aboveLineCount++;
            } else {
                // 重置持续时间
                fruit.aboveDuration = 0;
            }
        }
        
        // 如果没有任何水果超过警戒线，可以提前返回
        if (aboveLineCount === 0) {
            return;
        }
        
        // 可选：如果有水果超过警戒线但还没到阈值，可以显示警告
        /*if (aboveLineCount > 0) {
            // 这里可以添加警告效果，比如闪烁警戒线
            showWarningEffect();
        }*/
    }

    


    // 结束游戏
    function endGame() {
        gameState.isGameOver = true;
        
        // 停止 Matter.js 引擎
        Runner.stop(runner);

        // 隐藏胜利界面（如果显示着）
        victoryModal.style.display = 'none';
        
        // 更新最终分数
        finalScoreEl.textContent = gameState.score;
        watermelonCountEl.textContent = gameState.watermelonCount;
        
        // 显示游戏结束模态框
        gameOverModal.style.display = 'flex';
        
        // 播放游戏结束音效
        if (gameState.isSoundOn) {
            gameOverSound.currentTime = 0;
            gameOverSound.play();
        }
    }

    // ========== Matter.js 事件监听 ==========

    // 同步物理位置到 DOM
    Events.on(engine, 'afterUpdate', () => {
        // 同步所有水果的位置
        gameState.fruits.forEach(fruit => {
            const { x, y } = fruit.body.position;
            const radius = fruit.body.circleRadius;
            fruit.el.style.transform = `translate(${x - radius}px, ${y - radius}px)`;
        });

        // 更新预览水果位置
        if (gameState.currentFruit) {
            const fruitType = CONFIG.fruitTypes[gameState.currentFruit.type];
            const radius = fruitType.radius;
            gameState.currentFruit.el.style.transform = 
                `translate(${gameState.currentFruit.x - radius}px, ${50 - radius}px)`;
        }

        // 检查游戏结束
        if (!gameState.isGameOver && !gameState.isPaused) {
            checkGameOver();
        }
    });

    // 碰撞检测 - 合并水果
    Events.on(engine, 'collisionStart', (event) => {
        const pairs = event.pairs;
        
        for (let i = 0; i < pairs.length; i++) {
            const pair = pairs[i];
            const bodyA = pair.bodyA;
            const bodyB = pair.bodyB;
            
            // 确保都是水果，并且不是正在合并的
            if (bodyA.label !== 'fruit' || bodyB.label !== 'fruit') continue;
            if (bodyA.isMerging || bodyB.isMerging) continue;
            if (bodyA.fruitType !== bodyB.fruitType) continue;
            
            // 检查是否可以合并
            const nextType = bodyA.fruitType + 1;
            if (nextType >= CONFIG.fruitTypes.length) continue;
            
            // 标记为正在合并
            bodyA.isMerging = bodyB.isMerging = true;
            // 清理定时器
            const fruitA = gameState.fruits.find(f => f.body === bodyA);
            const fruitB = gameState.fruits.find(f => f.body === bodyB);
            
            if (fruitA && fruitA.specialTimer) {
                clearTimeout(fruitA.specialTimer);
                //console.log(`🔄 碰撞清理A: ${CONFIG.fruitTypes[fruitA.type].name}, ID=${fruitA.fruitId}`);
            }
            if (fruitB && fruitB.specialTimer) {
                clearTimeout(fruitB.specialTimer);
                //console.log(`🔄 碰撞清理B: ${CONFIG.fruitTypes[fruitB.type].name}, ID=${fruitB.fruitId}`);
            }
            
            // 计算新水果位置
            const x = (bodyA.position.x + bodyB.position.x) / 2;
            const y = (bodyA.position.y + bodyB.position.y) / 2;
            
            // 移除旧水果
            World.remove(world, [bodyA, bodyB]);
            
            // 从游戏状态中移除并删除 DOM
            gameState.fruits = gameState.fruits.filter(fruit => {
                if (fruit.body === bodyA || fruit.body === bodyB) {
                    canvasEl.removeChild(fruit.el);
                    return false;
                }
                return true;
            });
            
            // 创建新水果
            setTimeout(() => {
                const newFruit = createFruit(nextType, x, y);
                gameState.fruits.push(newFruit);
                
                // 更新分数
                gameState.score += CONFIG.fruitTypes[nextType].score;
                updateScore();
                
                // 如果是最终水果，增加计数
                if (nextType === CONFIG.fruitTypes.length - 1) {
                    gameState.watermelonCount++;
                    // 如果是第一次合成轮子，显示胜利界面
                    setTimeout(() => {
                        if (!gameState.hasShownVictory && gameState.watermelonCount === 1) {
                        gameState.victoryAchieved = true;
                        gameState.victoryTime = Math.floor((Date.now() - gameState.startTime) / 1000);
                        showVictoryModal();
                        gameState.hasShownVictory = true;
                        }
                    }, 500); // 1000ms = 1秒延迟
                    
                }
                
                // 播放合并音效
                if (gameState.isSoundOn) {
                    mergeSound.currentTime = 0;
                    mergeSound.play();
                }
            }, 50);
        }
    });

    // ========== 用户输入处理 ==========

    // 当鼠标进入游戏区域时，游戏获得焦点
    canvasEl.addEventListener('mouseenter', () => {
        gameState.isGameFocused = true;
        canvasEl.style.outline = '3px solid #ffffffff';
    });

    // 当鼠标离开游戏区域时，游戏失去焦点
    canvasEl.addEventListener('mouseleave', () => {
        gameState.isGameFocused = false;
        canvasEl.style.outline = 'none';
    });

    // 鼠标/触摸控制
    canvasEl.addEventListener('mousedown', (e) => {
        if (gameState.isGameOver || gameState.isPaused) return;
        
        const rect = canvasEl.getBoundingClientRect();
        const x = e.clientX - rect.left;
        
        if (gameState.currentFruit) {
            gameState.currentFruit.x = x;
        }
        
    });

    canvasEl.addEventListener('mousemove', (e) => {
        if (gameState.isGameOver || gameState.isPaused || !gameState.currentFruit) return;
        
        const rect = canvasEl.getBoundingClientRect();
        const x = e.clientX - rect.left;
        
        // 限制在画布范围内
        const fruitType = CONFIG.fruitTypes[gameState.currentFruit.type];
        const minX = fruitType.radius;
        const maxX = canvasEl.clientWidth - fruitType.radius;
        gameState.currentFruit.x = Math.max(minX, Math.min(maxX, x));
    });

    canvasEl.addEventListener('mouseup', () => {
        if (gameState.isGameOver || gameState.isPaused || !gameState.currentFruit) return;
        dropCurrentFruit();
    });

    // 触摸事件
    canvasEl.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (gameState.isGameOver || gameState.isPaused) return;
        
        const rect = canvasEl.getBoundingClientRect();
        const touch = e.touches[0];
        const x = touch.clientX - rect.left;
        
        if (gameState.currentFruit) {
            gameState.currentFruit.x = x;
        }
    });

    canvasEl.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (gameState.isGameOver || gameState.isPaused || !gameState.currentFruit) return;
        
        const rect = canvasEl.getBoundingClientRect();
        const touch = e.touches[0];
        const x = touch.clientX - rect.left;
        
        // 限制在画布范围内
        const fruitType = CONFIG.fruitTypes[gameState.currentFruit.type];
        const minX = fruitType.radius;
        const maxX = canvasEl.clientWidth - fruitType.radius;
        gameState.currentFruit.x = Math.max(minX, Math.min(maxX, x));
    });

    canvasEl.addEventListener('touchend', (e) => {
        e.preventDefault();
        if (gameState.isGameOver || gameState.isPaused || !gameState.currentFruit) return;
        dropCurrentFruit();
    });

    // 键盘控制
    document.addEventListener('keydown', (e) => {
        const relevantKeys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '];
        
        if (relevantKeys.includes(e.key) && gameState.isGameFocused) {
            e.preventDefault();
            e.stopPropagation();
            
            if (gameState.isGameOver || gameState.isPaused || !gameState.currentFruit) return;
            
            switch(e.key) {
                case 'ArrowLeft':
                    const fruitType = CONFIG.fruitTypes[gameState.currentFruit.type];
                    gameState.currentFruit.x = Math.max(
                        fruitType.radius, 
                        gameState.currentFruit.x - 20
                    );
                    break;
                case 'ArrowRight':
                    const fruitType2 = CONFIG.fruitTypes[gameState.currentFruit.type];
                    gameState.currentFruit.x = Math.min(
                        canvasEl.clientWidth - fruitType2.radius, 
                        gameState.currentFruit.x + 20
                    );
                    break;
                case ' ':
                    dropCurrentFruit();
                    break;
            }
        }
    });

    // 按钮事件
    restartBtn.addEventListener('click', () => {
        // 先完全停止当前游戏
        if (!gameState.isGameOver) {
            Runner.stop(runner);// 结束当前游戏
        }
        
        // 延迟一小段时间再重新开始，确保完全清理
        setTimeout(() => {
            const currentMusicState = gameState.isMusicOn;
            const currentSoundState = gameState.isSoundOn;
            initGame();
            gameState.isMusicOn = currentMusicState;
            gameState.isSoundOn = currentSoundState;
        }, 100);
    });
    
    // 修改 pauseBtn 的点击事件（第471行左右）：
    pauseBtn.addEventListener('click', () => {
        gameState.isPaused = !gameState.isPaused;
        pauseBtn.innerHTML = gameState.isPaused ? 
            '<i class="fas fa-play"></i> 继续' : 
            '<i class="fas fa-pause"></i> 暂停';
            
        if (gameState.isPaused) {
            Runner.stop(runner);
            // 暂停背景音乐
            if (gameState.isMusicOn) {
                backgroundMusic.pause();
            }
        } else {
            Runner.run(runner, engine);
            // 继续播放背景音乐
            if (gameState.isMusicOn) {
                backgroundMusic.play().catch(e => console.log('背景音乐播放失败:', e));
            }
        }
    });
    

    soundBtn.addEventListener('click', () => {
        gameState.isSoundOn = !gameState.isSoundOn;
        gameState.isMusicOn = gameState.isSoundOn; // 背景音乐与音效同步
        
        soundBtn.innerHTML = gameState.isSoundOn ? 
            '<i class="fas fa-volume-up"></i> 音乐' : 
            '<i class="fas fa-volume-mute"></i> 音乐';
        
        // 控制背景音乐
        if (gameState.isMusicOn) {
            backgroundMusic.volume = gameState.backgroundMusicVolume;
            if (!gameState.isPaused && !gameState.isGameOver) {
                backgroundMusic.play().catch(e => console.log('背景音乐播放失败:', e));
            }
        } else {
            backgroundMusic.pause();
        }
    });
    
    playAgainBtn.addEventListener('click', initGame);
    continueBtn.addEventListener('click', continueGame);
    cashoutBtn.addEventListener('click', cashoutGame);

    // 初始化游戏
    initGame();
    
});

// 动态背景类
class DynamicBackground {
    constructor() {
        this.canvas = document.getElementById('dynamic-background');
        this.ctx = this.canvas.getContext('2d');
        
        // 线条配置
        this.config = {
            lineCount: 5,           // 线条数量（3-7之间）
            lineWidth: 4,           // 线条内部宽度
            outlineWidth: 2,        // 边缘勾线宽度
            lineColor: '#ffffff',   // 线条颜色
            outlineColor: '#4c51bf', // 边缘颜色
            maxDistance: 300,       // 线条最大长度
            segmentCount: 20,       // 每条线的分段数
            mouseInfluence: 0.3,    // 鼠标影响系数（0-1）
            waveAmplitude: 30,      // 波浪振幅
            waveFrequency: 0.02,    // 波浪频率
            movementSpeed: 0.005,   // 运动速度
            centerX: 0,             // 中心点X（会在resize中设置）
            centerY: 0,             // 中心点Y（会在resize中设置）
            lines: []               // 线条数据
        };
        
        // 鼠标位置
        this.mouse = {
            x: 0,
            y: 0,
            prevX: 0,
            prevY: 0,
            velocity: { x: 0, y: 0 }
        };
        
        // 动画相关
        this.time = 0;
        this.animationId = null;
        
        // 初始化
        this.init();
    }
    
    init() {
        // 设置画布大小
        this.resize();
        
        // 创建线条数据
        this.createLines();
        
        // 绑定事件
        this.bindEvents();
        
        // 开始动画
        this.animate();
    }
    
    resize() {
        // 更新画布尺寸
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // 设置中心点为页面中心
        this.config.centerX = this.canvas.width / 2;
        this.config.centerY = this.canvas.height / 2;
        
        // 重新创建线条
        this.createLines();
    }
    
    createLines() {
        this.config.lines = [];
        const angleStep = (Math.PI * 2) / this.config.lineCount;
        
        for (let i = 0; i < this.config.lineCount; i++) {
            // 计算线条方向
            const angle = angleStep * i;
            
            // 创建线条分段点
            const segments = [];
            for (let j = 0; j <= this.config.segmentCount; j++) {
                const progress = j / this.config.segmentCount;
                const distance = this.config.maxDistance * progress;
                
                // 基础位置
                let x = this.config.centerX + Math.cos(angle) * distance;
                let y = this.config.centerY + Math.sin(angle) * distance;
                
                // 添加初始波浪
                const waveOffset = Math.sin(progress * Math.PI * 3) * this.config.waveAmplitude * progress;
                const perpendicularAngle = angle + Math.PI / 2;
                x += Math.cos(perpendicularAngle) * waveOffset;
                y += Math.sin(perpendicularAngle) * waveOffset;
                
                segments.push({
                    x, y,
                    baseX: x,
                    baseY: y,
                    progress
                });
            }
            
            this.config.lines.push({
                angle,
                segments,
                hue: (i * 360) / this.config.lineCount, // 可选：不同颜色
                length: this.config.maxDistance
            });
        }
    }
    
    bindEvents() {
        // 窗口大小变化
        window.addEventListener('resize', () => this.resize());
        
        // 鼠标移动
        window.addEventListener('mousemove', (e) => {
            this.mouse.prevX = this.mouse.x;
            this.mouse.prevY = this.mouse.y;
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
            
            // 计算鼠标速度
            this.mouse.velocity.x = this.mouse.x - this.mouse.prevX;
            this.mouse.velocity.y = this.mouse.y - this.mouse.prevY;
        });
        
        // 鼠标离开窗口
        window.addEventListener('mouseleave', () => {
            this.mouse.x = this.config.centerX;
            this.mouse.y = this.config.centerY;
            this.mouse.velocity.x = 0;
            this.mouse.velocity.y = 0;
        });
    }
    
    updateLines() {
        this.time += this.config.movementSpeed;
        
        this.config.lines.forEach((line, lineIndex) => {
            line.segments.forEach((segment, segmentIndex) => {
                // 重置到基础位置
                segment.x = segment.baseX;
                segment.y = segment.baseY;
                
                // 添加波浪效果
                const waveValue = Math.sin(
                    this.time * 2 + 
                    lineIndex * 0.5 + 
                    segment.progress * Math.PI * 8
                ) * this.config.waveAmplitude * segment.progress;
                
                const perpendicularAngle = line.angle + Math.PI / 2;
                segment.x += Math.cos(perpendicularAngle) * waveValue;
                segment.y += Math.sin(perpendicularAngle) * waveValue;
                
                // 鼠标影响
                const dx = segment.x - this.mouse.x;
                const dy = segment.y - this.mouse.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const maxMouseDistance = 200;
                
                if (distance < maxMouseDistance) {
                    const influence = (1 - distance / maxMouseDistance) * this.config.mouseInfluence;
                    
                    // 鼠标位置影响
                    const pushForce = 1 - distance / maxMouseDistance;
                    segment.x += (this.mouse.x - segment.x) * pushForce * 0.1;
                    segment.y += (this.mouse.y - segment.y) * pushForce * 0.1;
                    
                    // 鼠标速度影响
                    segment.x += this.mouse.velocity.x * influence * 0.5;
                    segment.y += this.mouse.velocity.y * influence * 0.5;
                }
                
                // 边界约束（可选）
                segment.x = Math.max(0, Math.min(this.canvas.width, segment.x));
                segment.y = Math.max(0, Math.min(this.canvas.height, segment.y));
            });
        });
    }
    
    drawLines() {
        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.config.lines.forEach((line) => {
            // 绘制线条主体（内部填充）
            this.ctx.beginPath();
            this.ctx.moveTo(line.segments[0].x, line.segments[0].y);
            
            // 创建平滑曲线
            for (let i = 1; i < line.segments.length; i++) {
                const prev = line.segments[i - 1];
                const curr = line.segments[i];
                const cpX = (prev.x + curr.x) / 2;
                const cpY = (prev.y + curr.y) / 2;
                
                this.ctx.quadraticCurveTo(prev.x, prev.y, cpX, cpY);
            }
            
            // 绘制最后一个点
            const last = line.segments[line.segments.length - 1];
            this.ctx.lineTo(last.x, last.y);
            
            // 线条样式
            this.ctx.lineWidth = this.config.lineWidth;
            this.ctx.strokeStyle = this.config.lineColor;
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';
            this.ctx.stroke();
            
            // 绘制边缘勾线（外边框）
            this.ctx.beginPath();
            this.ctx.moveTo(line.segments[0].x, line.segments[0].y);
            
            for (let i = 1; i < line.segments.length; i++) {
                const prev = line.segments[i - 1];
                const curr = line.segments[i];
                const cpX = (prev.x + curr.x) / 2;
                const cpY = (prev.y + curr.y) / 2;
                
                this.ctx.quadraticCurveTo(prev.x, prev.y, cpX, cpY);
            }
            
            this.ctx.lineTo(last.x, last.y);
            
            this.ctx.lineWidth = this.config.lineWidth + this.config.outlineWidth * 2;
            this.ctx.strokeStyle = this.config.outlineColor;
            this.ctx.globalAlpha = 0.3;
            this.ctx.stroke();
            this.ctx.globalAlpha = 1;
            
            // 绘制发光效果
            this.ctx.beginPath();
            this.ctx.moveTo(line.segments[0].x, line.segments[0].y);
            
            for (let i = 1; i < line.segments.length; i++) {
                const prev = line.segments[i - 1];
                const curr = line.segments[i];
                const cpX = (prev.x + curr.x) / 2;
                const cpY = (prev.y + curr.y) / 2;
                
                this.ctx.quadraticCurveTo(prev.x, prev.y, cpX, cpY);
            }
            
            this.ctx.lineTo(last.x, last.y);
            
            // 添加发光效果
            this.ctx.lineWidth = this.config.lineWidth;
            this.ctx.strokeStyle = this.config.lineColor;
            this.ctx.shadowColor = this.config.lineColor;
            this.ctx.shadowBlur = 15;
            this.ctx.stroke();
            this.ctx.shadowBlur = 0;
        });
        

    }
    
    
    
    animate() {
        this.updateLines();
        this.drawLines();
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    // 销毁方法（如果需要）
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
}

// 初始化动态背景
function initDynamicBackground() {
    window.dynamicBackground = new DynamicBackground();
}

