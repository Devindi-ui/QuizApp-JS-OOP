//Authentication Part



//Base question class
class Question {
  constructor (id, text, points = 1) {
    this._id = id;
    this._text = text;
    this._points = points;
  }

  get id () {
    return this._id
  }

  set id (id) {
    this._id = id
  }

  set text (text) {
    this._text = text
  }

  get text () {
    return this._text;
  }

  get points () {
    return this._points;
  }

  checkAnswer (answer) {
    throw new Error('Method must be implemented')
  }

  displayOptions (container) {
    throw new Error('Method must be implemented')
  }
}

//Multiple choice question class - child
class MultipleChoiceQuestion extends Question {
  constructor (id, text, options, correctAnswer, points = 1) {
    super(id, text, points)
    this._options = options
    this._correctAnswer = correctAnswer;
  }

  get options () {
    return this._options;
  }

  checkAnswer (answer) {
    return answer === this._correctAnswer;
  }

  displayOptions (container) {
    container.innerHTML = ''
    const prefixes = ['A', 'B', 'C', 'D']

    this._options.forEach((option, index) => {
      const optionElement = document.createElement('div')
      optionElement.className = 'option'
      optionElement.dataset.value = prefixes[index]
      optionElement.innerHTML = `
                <div class="option-prefix">${prefixes[index]}</div>
                <div class="option-text">${option}</div>
            `

      optionElement.addEventListener('click', () => {
        document
          .querySelectorAll('.option')
          .forEach(opt => opt.classList.remove('selected'))
        optionElement.classList.add('selected')
      })
      container.appendChild(optionElement)
    })
  }
}

// TrueFalse choice question cls
class TrueFalseQuestion extends Question {
  constructor (id, text, correctAnswer, points = 1) {
    super(id, text, points)
    this._correctAnswer = correctAnswer
  }

  checkAnswer (answer) {
    return (answer === 'true') === this._correctAnswer;
  }

  displayOptions (container) {
    container.innerHTML = '';

    const trueOption = document.createElement('div');
    trueOption.className = 'option';
    trueOption.dataset.value = 'true';
    trueOption.innerHTML = `
            <div class="option-prefix">T</div>
            <div class="option-text">True</div>
        `;

    const falseOption = document.createElement('div');
    falseOption.className = 'option';
    falseOption.dataset.value = 'false';
    falseOption.innerHTML = `
            <div class="option-prefix">F</div>
            <div class="option-text">False</div>
        `;

    [trueOption, falseOption].forEach(option => {
      option.addEventListener('click', () => {
        document
          .querySelectorAll('.option')
          .forEach(opt => opt.classList.remove('selected'))
        option.classList.add('selected')
      })
    })

    container.appendChild(trueOption)
    container.appendChild(falseOption)
  }
}

//Quiz cls -manage the quiz questions and flow
class Quiz {
  constructor (questions, timePerQuestion = 30) {
    this._questions = questions;
    this._currentQuestionIndex = 0;
    this._score = 0;
    this._timePerQuestion = timePerQuestion;
    this._timeRemaining = timePerQuestion;
    this._timeInterval = null;
    this._userAnswers = new Array(questions.length).fill(null);
    this._startTime = null;
    this._endTime = null;
  }

  get currentQuestion () {
    return this._questions[this._currentQuestionIndex];
  }

  get questions () {
    return this._questions;
  }

  get currentQuestionIndex () {
    return this._currentQuestionIndex;
  }

  get score () {
    return this._score;
  }

  get totalPoints () {
    return this._questions.reduce((total, question) => total + question.points, 0);
  }

  get timeRemaining () {
    return this._timeRemaining;
  }

  start () {
    this._startTime = new Date();
    this.startTimer();
  }

  end () {
    this._endTime = new Date()
    clearInterval(this._timerInterval)
  }

  startTimer () {
    clearInterval(this._timerInterval)
    this._timeRemaining = this._timePerQuestion

    this._timerInterval = setInterval(() => {
      this._timeRemaining--

      if (this._timeRemaining <= 0) {
        clearInterval(this._timerInterval)
        this.nextQuestion();
      }
    }, 1000)
  }

  submitAnswer (answer) {
    this._userAnswers[this._currentQuestionIndex] = answer

    if (this.currentQuestion.checkAnswer(answer)) {
      this._score += this.currentQuestion.points
      return true;
    }

    return false;
  }

  nextQuestion () {
    clearInterval(this._timeInterval)

    if (this._currentQuestionIndex < this._questions.length - 1) {
      this._currentQuestionIndex++
      this.startTimer()
      return true
    }

    return false
  }

  previousQuestion () {
    clearInterval(this._timerInterval)

    if (this._currentQuestionIndex > 0) {
      this._currentQuestionIndex--
      this.startTimer()
      return true
    }

    return false
  }

  get userAnswers () {
    return this._userAnswers
  }

  get timeSpent () {
    if (!this._startTime) return 0

    const end = this._endTime || new Date()
    return Math.floor((end - this._startTime) / 1000)
  }

  formatTimeSpent () {
    const totalSeconds = this.timeSpent
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes.toString().padStart(2,'0')}:${seconds.toString().padStart(2, '0')}`;
  }
}

class User {
  constructor (name) {
    this._name = name;
    this._quizzesTaken = 0;
    this._totalScore = 0;
    this._totalPossibleScore = 0;
  }

  get name () {
    return this._name
  }

  completeQuiz (quiz) {
    this._quizzesTaken++
    this._totalScore += quiz.score
    this._totalPossibleScore += quiz.totalPoints
  }

  get averageScore () {
    if (this._quizzesTaken === 0) return 0
    return (this._totalScore / this._totalPossibleScore) * 100
  }

  get stats () {
    return {
      quizzesTaken: this._quizzesTaken,
      totalScore: this._totalScore,
      totalPossibleScore: this._totalPossibleScore,
      averageScore: this.averageScore
    }
  }
}

class QuizManager {
  //singleton to manage quize creation and user sections

  constructor () {
    if (QuizManager.instance) {
      return QuizManager.instance
    }

    this._currentQuiz = null
    this._currentUser = null
    this._quizzes = {
      general: [
        new MultipleChoiceQuestion(
          1,
          'What is the capital of France?',
          ['London', 'Berlin', 'Paris', 'Madrid'],
          'C'
        ),
        new TrueFalseQuestion(
          2,
          'The Earth is the third planet from the Sun.',
          true
        ),
        new MultipleChoiceQuestion(
          3,
          "Which element has the chemical symbol 'O'?",
          ['Gold', 'Oxygen', 'Osmium', 'Oganesson'],
          'B'
        ),
        new MultipleChoiceQuestion(
          4,
          'Who painted the Mona Lisa?',
          [
            'Vincent van Gogh',
            'Pablo Picasso',
            'Leonardo da Vinci',
            'Michelangelo'
          ],
          'C'
        ),
         new TrueFalseQuestion(
          2,
          'The Mars is the third planet from the Sun.',
          true
        ),

      ],
      science: [
        new MultipleChoiceQuestion(
          1,
          'What is the smallest unit of life?',
          ['Atom', 'Cell', 'Molecule', 'Organelle'],
          'B',
        ),
        new MultipleChoiceQuestion(
          2,
          'Which planet is known as the Red Planet?',
          ['Venus', 'Mars', 'Jupiter', 'Saturn'],
          'B'
        ),
        new TrueFalseQuestion(3, 'Light travels faster than sound.', true),
        new MultipleChoiceQuestion(
          4,
          'What is the chemical formula for water?',
          ['H2O', 'CO2', 'NaCl', 'O2'],
          'A'
        ),
        new MultipleChoiceQuestion(
          5,
          'Which scientist proposed the theory of relativity?',
          ['Isaac Newton', 'Albert Einstein', 'Niels Bohr', 'Stephen Hawking'],
          'B',
        )
      ],
      programming: [
        new MultipleChoiceQuestion(
          1,
          'Which of the following is not a JavaScript data type?',
          ['String', 'Boolean', 'Float', 'Symbol'],
          'C'
        ),
        new TrueFalseQuestion(2, 'CSS is a programming language.', false),
        new MultipleChoiceQuestion(
          3,
          'Which keyword is used to declare a variable in JavaScript?',
          ['var', 'let', 'const', 'All of the above'],
          'D',
        ),
        new MultipleChoiceQuestion(
          4,
          'What does API stand for?',
          [
            'Application Programming Interface',
            'Advanced Programming Instruction',
            'Application Process Integration',
            'Automated Programming Interface'
          ],
          'A'
        ),
        new MultipleChoiceQuestion(
          5,
          'Which method is used to add an element to the end of an array in JavaScript?',
          ['push()', 'pop()', 'shift()', 'unshift()'],
          'A'
        )
      ]
    }

    QuizManager.instance = this;

  }
  createQuiz (type) {
    if (this._quizzes[type]) {
      this._currentQuiz = new Quiz(this._quizzes[type]);
      return this._currentQuiz;
    }
  }

  getCurrentQuiz () {
    return this._currentQuiz;
  }

  setCurrentUser (user) {
    this._currentUser = user;
  }

  getCurrentUser () {
    return this._currentUser;
  }

  getQuizTypes () {
    return Object.keys(this_quizzes)
  }
}

class UIController {
  //Handle all DOM manipulation and user interactions

  constructor () {
    this.QuizManager = new QuizManager()
    this.initializeEventListners()
  }

  initializeEventListners () {
    document.getElementById('startBtn').addEventListener('click', () => {
      const selectedQuiz = document.querySelector('.option-card.active')
      if (selectedQuiz) {
        this.startQuiz(selectedQuiz.dataset.quizType);
      } else {
        alert('Please select a quize type first')
      }
    })

    //quiz option selection
    document.querySelectorAll('.option-card').forEach(card => {
      card.addEventListener('click', () => {
        document
          .querySelectorAll('.option-card')
          .forEach(c => c.classList.remove('active'))
        card.classList.add('active')
      })
    })

    //navigation buttons
    document.getElementById('nextBtn').addEventListener('click', () => {
      this.nextQuestion()
    })
    document.getElementById('previousBtn').addEventListener('click', () => {
      this.previousQuestion()
    })
    document.getElementById('submitBtn').addEventListener('click', () => {
      this.submitQuiz()
    })

    // restart quiz
    // document.getElementById('restartBtn').addEventListener
    // ('click', () => {
    //     this.showScreen('welcomeScreen');
    // });
  }

  startQuiz (quizType) {
    const quiz = this.QuizManager.createQuiz(quizType);
    if (quiz) {
      //Create a default user for the quiz
      const user = new User('Guest')
      this.QuizManager.setCurrentUser(user)

      quiz.start();
      this.showScreen('quizScreen');
      this.displayQuestion();
      this.updateTimerDisplay()

      setInterval(() => {
        this.updateTimerDisplay()
      }, 1000)
    }
  }

  displayQuestion () {
    const quiz = this.QuizManager.getCurrentQuiz()
    if (!quiz) return

    const question = quiz.currentQuestion
    document.getElementById('questionCount').textContent = `Question ${
      quiz._currentQuestionIndex + 1
    } of ${quiz.questions.length}`;

    document.getElementById('questionText').textContent = question.text

    const optionsContainer = document.getElementById('optionsContainer')
    question.displayOptions(optionsContainer)

    //show/hide navigation buttons
    document.getElementById('previousBtn').style.display =
      quiz._currentQuestionIndex > 0 ? 'block' : 'none';
    document.getElementById('nextBtn').style.display =
      quiz._currentQuestionIndex < quiz.questions.length ? 'block' : 'none';
    document.getElementById('submitBtn').style.display =
      quiz._currentQuestionIndex === quiz.questions.length - 1 ? 'block' : 'none';
  }

  updateTimerDisplay () {
    const quiz = this.QuizManager.getCurrentQuiz()
    if (!quiz) return

    document.getElementById('timer').textContent = `00:${quiz.timeRemaining
      .toString()
      .padStart(2, '0')}`
  }

  nextQuestion () {
    const quiz = this.QuizManager.getCurrentQuiz()
    if (!quiz) return

    //save answer before moving to next question
    const selectedOption = document.querySelector('.option.selected')
    if (selectedOption) {
      quiz.submitAnswer(selectedOption.dataset.value)
    }

    if (quiz.nextQuestion()) {
      this.displayQuestion()
    } else {
      this.submitQuiz()
    }
  }

  previousQuestion () {
    const quiz = this.QuizManager.getCurrentQuiz()
    if (!quiz) return

    if (quiz.previousQuestion()) {
      this.displayQuestion()
    }
  }

  submitQuiz () {
    const quiz = this.QuizManager.getCurrentQuiz()
    const user = this.QuizManager.getCurrentUser()

    if (!user || !quiz) return

    const selectedOption = document.querySelector('.option.selected')
    if (selectedOption) {
      quiz.submitAnswer(selectedOption.dataset.value)
    }

    quiz.end()
    user.completeQuiz(quiz)

    this.showResults()
  }

  showResults () {
    const quiz = this.QuizManager.getCurrentQuiz();
    const user = this.QuizManager.getCurrentUser();
    // alert(quiz);

    if (!user || !quiz) return

    const percentage = (quiz.score / quiz.totalPoints) * 100

    // alert(quiz.score);
    // alert(quiz.totalPoints);
    document.getElementById(
      'scoreText'
    ).textContent = `Your score ${quiz.score} out of ${quiz.totalPoints}!`

    document.getElementById('scoreDetail').textContent =
      this.getScoreMessage(percentage);

    const correctAnswerCount = quiz.userAnswers.filter((answer, index) => 
        quiz.questions[index].checkAnswer(answer)
    ).length;

    document.getElementById('correctAnswers').textContent = correctAnswerCount;

    document.getElementById('incorrectAnswers').textContent =
      quiz.questions.length - correctAnswerCount;

    document.getElementById('timeSpent').textContent = quiz.formatTimeSpent();
    document.getElementById('progressBar').style.width = `${percentage}%`;

    this.showScreen('resultsScreen');
  }

  getScoreMessage (percentage) {
    if (percentage >= 90) return "Outstanding! You're a expert!"
    if (percentage >= 70) return 'Great job! You have excelent knowledge!'
    if (percentage >= 50)
      return 'Good effort! Keep learning and improve yourself!'
    return "Keep practicing! You'll do better next time"
  }

  showScreen (screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
      screen.classList.remove('active');
    })
    document.getElementById(screenId).classList.add('active');
  }
}

//Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const uiController = new UIController()
})
