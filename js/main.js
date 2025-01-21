// 初始化变量
let currentQuestionIndex = 0;
let selectedAnswers = new Array(10).fill(null);
let shuffledQuestions = [];
let startTime;

// DOM 元素引用
let elements = {};

// 在DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    initializeElements();
    addEventListeners();
});

// 初始化DOM元素引用
function initializeElements() {
    const elementIds = {
        welcomeScreen: 'welcome-screen',
        quizContainer: 'quiz-container',
        resultsContainer: 'results-container',
        questionContainer: 'question-container',
        progressBar: 'progress-bar',
        questionCounter: 'question-counter',
        score: 'score',
        accuracy: 'accuracy',
        timeUsed: 'time-used',
        scoreMessage: 'score-message',
        answersReview: 'answers-review',
        startBtn: 'start-btn',
        prevBtn: 'prev-btn',
        nextBtn: 'next-btn',
        submitBtn: 'submit-btn',
        retryBtn: 'retry-btn',
        shareBtn: 'share-btn'
    };

    elements = Object.entries(elementIds).reduce((acc, [key, id]) => {
        acc[key] = document.getElementById(id);
        return acc;
    }, {});
}

// 添加事件监听器
function addEventListeners() {
    const { startBtn, prevBtn, nextBtn, submitBtn, retryBtn, shareBtn } = elements;
    
    if (startBtn) startBtn.addEventListener('click', startQuiz);
    if (prevBtn) prevBtn.addEventListener('click', showPreviousQuestion);
    if (nextBtn) nextBtn.addEventListener('click', showNextQuestion);
    if (submitBtn) submitBtn.addEventListener('click', showResults);
    if (retryBtn) retryBtn.addEventListener('click', resetQuiz);
    if (shareBtn) shareBtn.addEventListener('click', handleShare);
}

// 处理分享功能
function handleShare() {
    const { score, timeUsed, accuracy } = elements;
    if (!score || !timeUsed || !accuracy) return;

    const shareText = `我在《科普法》知识测试中获得了${score.textContent}分！用时${timeUsed.textContent}分钟，正确率${accuracy.textContent}%。快来测试一下你的《科普法》知识水平吧！`;
    
    try {
        if (navigator.share) {
            navigator.share({
                title: '《科普法》知识测试结果',
                text: shareText
            }).catch(() => {
                copyToClipboard(shareText);
            });
        } else {
            copyToClipboard(shareText);
        }
    } catch (error) {
        console.error('Share failed:', error);
        copyToClipboard(shareText);
    }
}

// 复制到剪贴板
function copyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    try {
        document.execCommand('copy');
        alert('分享文本已复制到剪贴板！');
    } catch (err) {
        console.error('Failed to copy text:', err);
    }
    document.body.removeChild(textarea);
}

// 初始化测试
function startQuiz() {
    const { welcomeScreen, quizContainer } = elements;
    if (!welcomeScreen || !quizContainer || !window.questions) return;

    welcomeScreen.classList.add('d-none');
    quizContainer.classList.remove('d-none');
    startTime = Date.now();

    // 随机选择题目
    const totalQuestions = window.questions.length;
    const indices = Array.from({ length: totalQuestions }, (_, i) => i);
    shuffleArray(indices);
    shuffledQuestions = indices.slice(0, 10).map(index => window.questions[index]);
    
    currentQuestionIndex = 0;
    selectedAnswers = new Array(10).fill(null);
    showQuestion(0);
}

// Fisher-Yates 洗牌算法
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// 显示问题
function showQuestion(index) {
    const { questionContainer, progressBar, questionCounter } = elements;
    if (!questionContainer || !shuffledQuestions[index]) return;

    const question = shuffledQuestions[index];
    currentQuestionIndex = index;

    if (progressBar) progressBar.style.width = `${(index + 1) * 10}%`;
    if (questionCounter) questionCounter.textContent = `题目 ${index + 1}/10`;

    const questionHTML = `
        <div class="question mb-4">
            <h4>${index + 1}. ${question.question}</h4>
            ${question.options.map((option, i) => `
                <div class="form-check" data-option="${i}">
                    <input class="form-check-input" type="radio" name="question${index}" value="${i}" 
                        ${selectedAnswers[index] === i ? 'checked' : ''}>
                    <label class="form-check-label">${option}</label>
                </div>
            `).join('')}
        </div>
    `;

    questionContainer.innerHTML = questionHTML;
    addOptionListeners();
    updateNavigationButtons();
}

// 添加选项监听器
function addOptionListeners() {
    const { questionContainer } = elements;
    if (!questionContainer) return;

    const formChecks = questionContainer.querySelectorAll('.form-check');
    formChecks.forEach(formCheck => {
        formCheck.addEventListener('click', () => {
            // 移除所有选项的选中状态
            formChecks.forEach(check => {
                check.classList.remove('selected', 'bg-primary', 'text-white');
                check.querySelector('input').checked = false;
            });

            // 为当前选项添加选中样式
            const input = formCheck.querySelector('input');
            input.checked = true;
            formCheck.classList.add('selected', 'bg-primary', 'text-white');

            const optionIndex = parseInt(formCheck.dataset.option);
            selectedAnswers[currentQuestionIndex] = optionIndex;

            // 添加震动或音效反馈（可选）
            navigator.vibrate?.(50);  // 轻微震动反馈

            if (currentQuestionIndex < 9) {
                setTimeout(showNextQuestion, 300);
            }
        });
    });
}

// 更新导航按钮状态
function updateNavigationButtons() {
    const { prevBtn, nextBtn, submitBtn } = elements;
    
    if (prevBtn) prevBtn.disabled = currentQuestionIndex === 0;
    if (nextBtn) nextBtn.classList.toggle('d-none', currentQuestionIndex === 9);
    if (submitBtn) submitBtn.classList.toggle('d-none', currentQuestionIndex !== 9);
}

// 显示上一题
function showPreviousQuestion() {
    if (currentQuestionIndex > 0) {
        showQuestion(currentQuestionIndex - 1);
    }
}

// 显示下一题
function showNextQuestion() {
    if (currentQuestionIndex < 9) {
        showQuestion(currentQuestionIndex + 1);
    }
}

// 显示结果
function showResults() {
    const { quizContainer, resultsContainer, answersReview, score, accuracy, timeUsed, scoreMessage } = elements;
    if (!quizContainer || !resultsContainer || !answersReview) return;

    quizContainer.classList.add('d-none');
    resultsContainer.classList.remove('d-none');

    // 计算结果
    const results = calculateResults();
    
    // 更新UI
    if (score) score.textContent = results.score;
    if (accuracy) accuracy.textContent = results.accuracyPercent;
    if (timeUsed) timeUsed.textContent = results.timeUsedMinutes;
    if (scoreMessage) scoreMessage.textContent = getScoreMessage(results.score);

    // 显示答题详情
    answersReview.innerHTML = generateReviewHTML(results.allAnswers);
    
    // 添加选项卡功能
    setupTabs(results);
}

// 计算测试结果
function calculateResults() {
    const endTime = Date.now();
    const timeUsedMinutes = Math.round((endTime - startTime) / 1000 / 60 * 10) / 10;
    
    let score = 0;
    const correctAnswers = [];
    const incorrectAnswers = [];

    shuffledQuestions.forEach((question, index) => {
        const userAnswer = selectedAnswers[index];
        const isCorrect = userAnswer === question.correct;
        
        if (isCorrect) {
            score++;
            correctAnswers.push({ question, userAnswer, index });
        } else {
            incorrectAnswers.push({ question, userAnswer, index });
        }
    });

    return {
        score,
        timeUsedMinutes,
        accuracyPercent: Math.round(score * 100 / 10),
        correctAnswers,
        incorrectAnswers,
        allAnswers: [...correctAnswers, ...incorrectAnswers].sort((a, b) => a.index - b.index)
    };
}

// 获取分数评语
function getScoreMessage(score) {
    if (score === 10) return '太棒了！你完全掌握了《科普法》的内容！';
    if (score >= 8) return '很好！你对《科普法》有很好的理解！';
    if (score >= 6) return '及格了！但还需要多多学习《科普法》哦！';
    return '要加油啦！建议仔细阅读《科普法》！';
}

// 生成答题详情HTML
function generateReviewHTML(answers) {
    return answers.map(({ question, userAnswer, index }) => {
        const isCorrect = userAnswer === question.correct;
        const lawReference = getLawReference(question.type);
        
        return `
            <div class="review-item ${isCorrect ? 'correct' : 'incorrect'}">
                <h5>${index + 1}. ${question.question}</h5>
                <div class="answer user-answer ${isCorrect ? 'correct' : 'incorrect'}">
                    <strong>${isCorrect ? '✓' : '✗'} 你的答案：</strong>${question.options[userAnswer]}
                </div>
                ${!isCorrect ? `
                    <div class="answer correct-answer">
                        <strong>✓ 正确答案：</strong>${question.options[question.correct]}
                    </div>
                ` : ''}
                ${lawReference ? `
                    <div class="law-reference">
                        <h6>相关法条：</h6>
                        <div class="law-content">${lawReference}</div>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

// 设置选项卡功能
function setupTabs(results) {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const { answersReview } = elements;
    if (!answersReview) return;

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            let reviewContent;
            switch (btn.dataset.tab) {
                case 'correct':
                    reviewContent = generateReviewHTML(results.correctAnswers);
                    break;
                case 'incorrect':
                    reviewContent = generateReviewHTML(results.incorrectAnswers);
                    break;
                default:
                    reviewContent = generateReviewHTML(results.allAnswers);
            }
            
            answersReview.innerHTML = reviewContent;
        });
    });
}

// 获取相关法条
function getLawReference(type) {
    const references = {
        'supervision': '第三十三条 科技行政部门和其他有关部门应当依法对科普工作进行监督检查，及时纠正违反本法的行为。',
        'facility': '第二十七条 国家支持科普基地建设，鼓励和支持各类科普场馆、科研基地、工业旅游基地、科技示范基地等建设和发展。',
        'rights': '第九条 公民有获得科普服务、参与科普活动的权利。公民应当树立科学思维，提高科学素养。',
        'education': '第二十六条 各级各类学校应当把科普作为素质教育的重要内容，培养学生的科学兴趣、创新意识和创新能力。'
    };
    
    return references[type] || '';
}

// 重置测试
function resetQuiz() {
    const { resultsContainer, welcomeScreen } = elements;
    
    currentQuestionIndex = 0;
    selectedAnswers = new Array(10).fill(null);
    shuffledQuestions = [];
    
    if (resultsContainer) resultsContainer.classList.add('d-none');
    if (welcomeScreen) welcomeScreen.classList.remove('d-none');
}
