class QuizApp {
    constructor() {
        this.currentQuestionIndex = 0;
        this.selectedAnswers = new Array(10).fill(null);
        this.quizQuestions = [];
        this.initializeElements();
        this.attachEventListeners();
    }

    initializeElements() {
        // 获取DOM元素
        this.welcomeScreen = document.getElementById('welcome-screen');
        this.quizContainer = document.getElementById('quiz-container');
        this.resultsContainer = document.getElementById('results-container');
        this.questionContainer = document.getElementById('question-container');
        this.progressBar = document.getElementById('progress-bar');
        this.questionCounter = document.getElementById('question-counter');
        this.startBtn = document.getElementById('start-btn');
        this.prevBtn = document.getElementById('prev-btn');
        this.nextBtn = document.getElementById('next-btn');
        this.submitBtn = document.getElementById('submit-btn');
        this.retryBtn = document.getElementById('retry-btn');

        // 确保所有元素都存在
        if (!this.welcomeScreen || !this.quizContainer || !this.resultsContainer || 
            !this.questionContainer || !this.progressBar || !this.questionCounter || 
            !this.startBtn || !this.prevBtn || !this.nextBtn || !this.submitBtn || !this.retryBtn) {
            console.error('Some required elements are missing from the DOM');
            return;
        }
    }

    attachEventListeners() {
        if (this.startBtn) {
            this.startBtn.addEventListener('click', () => this.startQuiz());
        }
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.showPreviousQuestion());
        }
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.showNextQuestion());
        }
        if (this.submitBtn) {
            this.submitBtn.addEventListener('click', () => this.submitQuiz());
        }
        if (this.retryBtn) {
            this.retryBtn.addEventListener('click', () => this.resetQuiz());
        }
    }

    startQuiz() {
        // 检查题库是否为空
        if (!questions || questions.length === 0) {
            alert('题库加载失败，请刷新页面重试！');
            return;
        }

        // 从题库随机选择10道题
        this.quizQuestions = this.getRandomQuestions(10);
        
        // 检查是否成功获取了题目
        if (this.quizQuestions.length < 10) {
            alert('题目数量不足，请联系管理员！');
            return;
        }

        this.welcomeScreen.classList.add('d-none');
        this.quizContainer.classList.remove('d-none');
        this.resultsContainer.classList.add('d-none');
        this.showQuestion(0);
    }

    getRandomQuestions(count) {
        if (!questions || questions.length === 0) {
            console.error('Questions array is empty or undefined');
            return [];
        }
        const shuffled = [...questions].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    showQuestion(index) {
        if (!this.quizQuestions || !this.quizQuestions[index]) {
            console.error('Invalid question index or questions not loaded');
            return;
        }

        const question = this.quizQuestions[index];
        this.currentQuestionIndex = index;
        
        // 更新进度
        this.updateProgress();
        
        // 创建题目HTML
        this.questionContainer.innerHTML = `
            <div class="question-item fade-in">
                <h3 class="mb-4">第 ${index + 1} 题：${question.question}</h3>
                <div class="options">
                    ${question.options.map((option, i) => `
                        <div class="option-item ${this.selectedAnswers[index] === i ? 'selected' : ''}"
                             onclick="quizApp.selectAnswer(${i})">
                            ${String.fromCharCode(65 + i)}. ${option}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        // 更新按钮状态
        this.updateNavigationButtons();
    }

    selectAnswer(optionIndex) {
        if (optionIndex < 0 || optionIndex >= 4) {
            console.error('Invalid option index');
            return;
        }

        this.selectedAnswers[this.currentQuestionIndex] = optionIndex;
        const options = document.querySelectorAll('.option-item');
        options.forEach((option, index) => {
            option.classList.toggle('selected', index === optionIndex);
        });
        this.updateNavigationButtons();
    }

    updateProgress() {
        if (!this.progressBar || !this.questionCounter) {
            console.error('Progress elements not found');
            return;
        }

        const progress = ((this.currentQuestionIndex + 1) / 10) * 100;
        this.progressBar.style.width = `${progress}%`;
        this.questionCounter.textContent = `题目 ${this.currentQuestionIndex + 1}/10`;
    }

    updateNavigationButtons() {
        if (!this.prevBtn || !this.nextBtn || !this.submitBtn) {
            console.error('Navigation buttons not found');
            return;
        }

        // 更新上一题按钮状态
        this.prevBtn.disabled = this.currentQuestionIndex === 0;
        
        // 更新下一题和提交按钮状态
        const isLastQuestion = this.currentQuestionIndex === 9;
        this.nextBtn.classList.toggle('d-none', isLastQuestion);
        this.submitBtn.classList.toggle('d-none', !isLastQuestion);
        
        // 如果是最后一题，检查是否所有题目都已答完
        if (isLastQuestion) {
            const allAnswered = !this.selectedAnswers.includes(null);
            this.submitBtn.disabled = !allAnswered;
        }
    }

    showPreviousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.showQuestion(this.currentQuestionIndex - 1);
        }
    }

    showNextQuestion() {
        if (this.currentQuestionIndex < 9) {
            this.showQuestion(this.currentQuestionIndex + 1);
        }
    }

    submitQuiz() {
        // 检查是否所有题目都已答完
        if (this.selectedAnswers.includes(null)) {
            alert('请确保所有题目都已作答！');
            return;
        }

        this.quizContainer.classList.add('d-none');
        this.resultsContainer.classList.remove('d-none');

        // 计算得分和生成答案解析
        let score = 0;
        let reviewHTML = '';

        this.quizQuestions.forEach((question, index) => {
            const isCorrect = this.selectedAnswers[index] === question.correct;
            if (isCorrect) score++;

            reviewHTML += `
                <div class="question-item mb-4">
                    <h4>第 ${index + 1} 题</h4>
                    <p>${question.question}</p>
                    <div class="options">
                        ${question.options.map((option, i) => `
                            <div class="option-item ${this.getAnswerClass(i, question.correct, this.selectedAnswers[index])}">
                                ${String.fromCharCode(65 + i)}. ${option}
                            </div>
                        `).join('')}
                    </div>
                    <div class="explanation">
                        <p><strong>解析：</strong>${question.explanation}</p>
                        <p><strong>法条依据：</strong>${question.reference}</p>
                    </div>
                </div>
            `;
        });

        const scoreElement = document.getElementById('score');
        const answersReviewElement = document.getElementById('answers-review');
        
        if (scoreElement && answersReviewElement) {
            scoreElement.textContent = score;
            answersReviewElement.innerHTML = reviewHTML;
        }
    }

    getAnswerClass(optionIndex, correctAnswer, selectedAnswer) {
        if (optionIndex === correctAnswer) {
            return 'correct';
        }
        if (optionIndex === selectedAnswer && selectedAnswer !== correctAnswer) {
            return 'incorrect';
        }
        return '';
    }

    resetQuiz() {
        this.currentQuestionIndex = 0;
        this.selectedAnswers = new Array(10).fill(null);
        this.resultsContainer.classList.add('d-none');
        this.welcomeScreen.classList.remove('d-none');
        this.quizContainer.classList.add('d-none');
    }
}

// 等待DOM加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    window.quizApp = new QuizApp();
});
