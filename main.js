// 游戏主逻辑
document.addEventListener('DOMContentLoaded', () => {
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
        canvasWidth: 500,
        canvasHeight: 700,
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
        warningLineHeight: 110  // 警戒线高度
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
        dangerCounter:0

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

    // 音效
    const mergeSound = document.getElementById('merge-sound');
    const dropSound = document.getElementById('drop-sound');
    const gameOverSound = document.getElementById('game-over-sound');

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
            isGameFocused: false
        };

        // 清除所有物理实体
        World.clear(world, false);
        World.add(world, [ground, leftWall, rightWall]);

        // 清空画布
        canvasEl.innerHTML = '';

        // 更新UI
        updateScore();
        updateNextFruit();
        updateHighestScore();
        gameOverModal.style.display = 'none';

        // 生成水果参考表
        generateFruitReference();

        // 设置目标水果
        targetFruitEl.textContent = CONFIG.fruitTypes[CONFIG.fruitTypes.length - 1].name;

        // 创建第一个预览水果
        createNewFruit();

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
            restitution: 0.2,      // 弹性
            friction: 0.05,         // 摩擦力
            frictionAir: 0.001,     // 空气摩擦力
            density: 0.01,        // 密度
            label: 'fruit',
            render: { fillStyle: fruitType.color }
        });
        
        // 添加自定义属性
        body.fruitType = type;
        body.isMerging = false;
        
        // 添加到世界
        World.add(world, body);
        
        // 创建对应的 DOM 元素
        const el = drawFruit(type, x, y);
        canvasEl.appendChild(el);
        
        // 保存到游戏状态
        const fruitObj = {
            body: body,
            el: el,
            type: type
        };
        
        return fruitObj;
    }

    // 绘制水果 DOM 元素
    function drawFruit(type, x, y) {
        const fruitType = CONFIG.fruitTypes[type];
        const fruitEl = document.createElement('div');
        fruitEl.className = 'fruit';
        fruitEl.style.width = `${fruitType.radius * 2}px`;
        fruitEl.style.height = `${fruitType.radius * 2}px`;
        fruitEl.style.backgroundColor = fruitType.color;
        fruitEl.style.position = 'absolute';
        fruitEl.style.borderRadius = '50%';
        fruitEl.style.display = 'flex';
        fruitEl.style.alignItems = 'center';
        fruitEl.style.justifyContent = 'center';
        fruitEl.style.color = 'white';
        fruitEl.style.fontWeight = 'bold';
        fruitEl.style.textShadow = '1px 1px 2px rgba(0, 0, 0, 0.5)';
        fruitEl.style.userSelect = 'none';
        fruitEl.style.border = '3px solid rgba(255, 255, 255, 0.3)';
        fruitEl.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.3), inset 0 -8px 16px rgba(0, 0, 0, 0.2), inset 0 8px 16px rgba(255, 255, 255, 0.1)';
        fruitEl.style.transform = `translate(${x - fruitType.radius}px, ${y - fruitType.radius}px)`;
        
        // 添加水果名称
        const fruitName = document.createElement('span');
        fruitName.textContent = fruitType.name.substring(0, 2);
        fruitName.style.fontSize = `${Math.max(12, fruitType.radius / 3)}px`;
        fruitEl.appendChild(fruitName);
        
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
        
        // 创建新的预览水果
        // 延迟1秒后创建新的预览水果
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
    function updateNextFruit() {
        const fruitType = CONFIG.fruitTypes[gameState.nextFruitType];
        nextFruitEl.style.backgroundColor = fruitType.color;
        nextFruitEl.style.width = `${fruitType.radius}px`;
        nextFruitEl.style.height = `${fruitType.radius}px`;
        nextFruitEl.setAttribute('data-type', gameState.nextFruitType);
    }

    // 生成水果参考表
    function generateFruitReference() {
        fruitReferenceList.innerHTML = '';
        
        CONFIG.fruitTypes.forEach((fruit, index) => {
            const fruitItem = document.createElement('div');
            fruitItem.className = 'fruit-ref-item';
            
            fruitItem.innerHTML = `
                <div class="fruit-ref-icon" style="background-color: ${fruit.color}; width: ${fruit.radius}px; height: ${fruit.radius}px;"></div>
                <span class="fruit-ref-name">${fruit.name}</span>
                <span class="fruit-ref-score">${fruit.score}分</span>
            `;
            
            fruitReferenceList.appendChild(fruitItem);
        });
    }

    // 检查游戏结束
    function checkGameOver() {
        let dangerousCount = 0;
        let criticalCount = 0;
        
        for (let i = 0; i < gameState.fruits.length; i++) {
            const fruit = gameState.fruits[i];
            const body = fruit.body;
            
            // 计算速度
            const speed = Math.sqrt(body.velocity.x * body.velocity.x + body.velocity.y * body.velocity.y);
            
            // 位置检测
            const fruitTop = body.position.y - body.circleRadius;
            
            // 临界区域（警戒线上方20px）
            if (fruitTop < CONFIG.warningLineHeight - 20) {
                // 速度检测：只有慢速水果才认为是危险的
                if (speed < 1.0) {
                    dangerousCount++;
                    
                    // 如果水果已经超过警戒线
                    if (fruitTop < CONFIG.warningLineHeight) {
                        criticalCount++;
                    }
                }
            }
        }
        
        // 如果有水果超过警戒线且静止，立即结束游戏
        if (criticalCount > 0) {
            gameState.dangerCounter++;
            
            // 需要连续几帧检测到危险才真正结束游戏（防止误判）
            if (gameState.dangerCounter > 10) {
                endGame();
            }
        } else {
            // 重置危险计数器
            gameState.dangerCounter = Math.max(0, gameState.dangerCounter - 1);
        }
        
        // 如果危险水果太多，也结束游戏
        if (dangerousCount >= 5) {
            endGame();
        }
    }


    // 结束游戏
    function endGame() {
        gameState.isGameOver = true;
        
        // 停止 Matter.js 引擎
        Runner.stop(runner);
        
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
        canvasEl.style.outline = '3px solid #4c51bf';
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
    restartBtn.addEventListener('click', initGame);
    
    pauseBtn.addEventListener('click', () => {
        gameState.isPaused = !gameState.isPaused;
        pauseBtn.innerHTML = gameState.isPaused ? 
            '<i class="fas fa-play"></i> 继续' : 
            '<i class="fas fa-pause"></i> 暂停';
            
        if (gameState.isPaused) {
            Runner.stop(runner);
        } else {
            Runner.run(runner, engine);
        }
    });
    
    soundBtn.addEventListener('click', () => {
        gameState.isSoundOn = !gameState.isSoundOn;
        soundBtn.innerHTML = gameState.isSoundOn ? 
            '<i class="fas fa-volume-up"></i> 音效' : 
            '<i class="fas fa-volume-mute"></i> 音效';
    });
    
    playAgainBtn.addEventListener('click', initGame);

    // 初始化游戏
    initGame();
});