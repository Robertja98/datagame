export type MathQuestion = {
  prompt: string;
  options: string[];
  answerIndex: number;
  explanation: string;
  difficulty: 1 | 2 | 3 | 4;
};

export const questions: MathQuestion[] = [
  {
    prompt: 'A class survey shows 12 of 20 students prefer statistics. What is P(statistics)?',
    options: ['0.6', '0.4', '0.75'],
    answerIndex: 0,
    explanation: 'Probability is favourable over total, so 12/20 = 0.6.',
    difficulty: 1,
  },
  {
    prompt: 'The mean of 4, 6, 8, 10 is:',
    options: ['6', '7', '8'],
    answerIndex: 1,
    explanation: 'The sum is 28 and 28/4 = 7.',
    difficulty: 1,
  },
  {
    prompt: 'A spinner has 8 equal sectors. The probability of landing on one sector is:',
    options: ['1/16', '1/8', '1/4'],
    answerIndex: 1,
    explanation: 'Each equally likely outcome has probability 1/8.',
    difficulty: 1,
  },
  {
    prompt: 'The median of 3, 5, 7, 11, 13 is:',
    options: ['7', '8', '9'],
    answerIndex: 0,
    explanation: 'The middle value in the ordered list is 7.',
    difficulty: 1,
  },
  {
    prompt: 'A bag has 5 red and 5 blue counters. The probability of red is:',
    options: ['1/2', '1/5', '2/5'],
    answerIndex: 0,
    explanation: 'There are 5 red counters out of 10 total, so the probability is 1/2.',
    difficulty: 1,
  },
  {
    prompt: 'The mode of 2, 4, 4, 5, 7 is:',
    options: ['4', '5', '22/5'],
    answerIndex: 0,
    explanation: 'The mode is the value that appears most often, which is 4.',
    difficulty: 1,
  },
  {
    prompt: 'How many ways can 5 different books be arranged on a shelf?',
    options: ['25', '120', '60'],
    answerIndex: 1,
    explanation: 'This is a permutation: 5! = 120.',
    difficulty: 2,
  },
  {
    prompt: 'How many committees of 3 can be chosen from 6 students?',
    options: ['20', '18', '120'],
    answerIndex: 0,
    explanation: 'Use combinations: 6C3 = 20.',
    difficulty: 2,
  },
  {
    prompt: 'If P(A) = 0.3 and P(B) = 0.5 for independent events, P(A and B) is:',
    options: ['0.15', '0.8', '0.2'],
    answerIndex: 0,
    explanation: 'For independent events, multiply: 0.3 x 0.5 = 0.15.',
    difficulty: 2,
  },
  {
    prompt: 'If the odds in favour of an event are 3:2, the probability is:',
    options: ['3/5', '2/5', '1/5'],
    answerIndex: 0,
    explanation: 'Odds 3:2 means 3 favourable out of 5 total, so 3/5.',
    difficulty: 2,
  },
  {
    prompt: 'A class has 7 girls and 5 boys. If one student is chosen at random, P(boy) is:',
    options: ['5/12', '7/12', '1/5'],
    answerIndex: 0,
    explanation: 'There are 5 boys out of 12 students, so the probability is 5/12.',
    difficulty: 2,
  },
  {
    prompt: 'How many 2-letter arrangements can be made from A, B, C, D without repetition?',
    options: ['8', '12', '16'],
    answerIndex: 1,
    explanation: 'This is a permutation: 4P2 = 4 x 3 = 12.',
    difficulty: 2,
  },
  {
    prompt: 'A die is rolled twice. The probability of getting two even numbers is:',
    options: ['1/4', '1/3', '1/6'],
    answerIndex: 0,
    explanation: 'Each even result has probability 1/2, so (1/2)(1/2) = 1/4.',
    difficulty: 3,
  },
  {
    prompt: 'How many ways can 4 students be chosen from 9?',
    options: ['126', '3024', '36'],
    answerIndex: 0,
    explanation: 'Use combinations: 9C4 = 126.',
    difficulty: 3,
  },
  {
    prompt: 'If the mean of five numbers is 18, their total sum is:',
    options: ['23', '90', '18'],
    answerIndex: 1,
    explanation: 'Sum = mean x number of values, so 18 x 5 = 90.',
    difficulty: 3,
  },
  {
    prompt: 'In a binomial setting with n = 4 and p = 0.5, P(exactly 2 successes) is:',
    options: ['6/16', '4/16', '8/16'],
    answerIndex: 0,
    explanation: 'Use 4C2(0.5)^4 = 6/16.',
    difficulty: 3,
  },
  {
    prompt: 'A set has Q1 = 12 and Q3 = 20. The interquartile range is:',
    options: ['8', '16', '32'],
    answerIndex: 0,
    explanation: 'IQR = Q3 - Q1 = 20 - 12 = 8.',
    difficulty: 3,
  },
  {
    prompt: 'If P(A) = 0.7, P(B) = 0.5, and P(A and B) = 0.4, then P(A or B) is:',
    options: ['0.8', '0.6', '0.9'],
    answerIndex: 0,
    explanation: 'Use P(A or B) = P(A) + P(B) - P(A and B) = 0.8.',
    difficulty: 3,
  },
  {
    prompt: 'How many distinct arrangements can be made from the letters in DATA?',
    options: ['24', '12', '4'],
    answerIndex: 1,
    explanation: 'There are 4! / 2! = 12 distinct arrangements because A repeats twice.',
    difficulty: 4,
  },
  {
    prompt: 'A larger standard deviation usually means the data are:',
    options: ['more spread out', 'more symmetric', 'closer to the median'],
    answerIndex: 0,
    explanation: 'A larger standard deviation indicates greater spread from the mean.',
    difficulty: 4,
  },
  {
    prompt: 'If E(X) = 12 and E(Y) = 4, then E(X - Y) is:',
    options: ['3', '8', '16'],
    answerIndex: 1,
    explanation: 'Expected value is linear, so E(X - Y) = 12 - 4 = 8.',
    difficulty: 4,
  },
  {
    prompt: 'A test has 8 multiple-choice questions with 4 answers each. Guessing all of them, the expected number correct is:',
    options: ['2', '4', '1'],
    answerIndex: 0,
    explanation: 'Expected correct answers = np = 8 x 1/4 = 2.',
    difficulty: 4,
  },
  {
    prompt: 'How many ways can 3 prizes be awarded to 10 students if order matters and no student can win twice?',
    options: ['120', '720', '1000'],
    answerIndex: 1,
    explanation: 'Awarding distinct prizes is a permutation: 10P3 = 10 x 9 x 8 = 720.',
    difficulty: 4,
  },
  {
    prompt: 'If events A and B are mutually exclusive with P(A) = 0.35 and P(B) = 0.25, then P(A or B) is:',
    options: ['0.60', '0.0875', '0.10'],
    answerIndex: 0,
    explanation: 'Mutually exclusive events add directly, so 0.35 + 0.25 = 0.60.',
    difficulty: 4,
  },
];

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }

  return copy;
}

export class QuestionDeck {
  private unlockedDifficulty: 1 | 2 | 3 | 4;
  private queue: MathQuestion[] = [];

  constructor(initialDifficulty: 1 | 2 | 3 | 4 = 1) {
    this.unlockedDifficulty = initialDifficulty;
    this.refill();
  }

  setDifficulty(nextDifficulty: 1 | 2 | 3 | 4): void {
    if (nextDifficulty === this.unlockedDifficulty) {
      return;
    }

    this.unlockedDifficulty = nextDifficulty;
    this.refill();
  }

  nextQuestion(): MathQuestion {
    if (this.queue.length === 0) {
      this.refill();
    }

    const question = this.queue.shift();

    if (!question) {
      throw new Error('Question deck is unexpectedly empty.');
    }

    return question;
  }

  private refill(): void {
    this.queue = shuffle(questions.filter((question) => question.difficulty <= this.unlockedDifficulty));
  }
}

export function getDifficultyLabel(difficulty: 1 | 2 | 3 | 4): string {
  switch (difficulty) {
    case 1:
      return 'Foundations';
    case 2:
      return 'Applied Probability';
    case 3:
      return 'Combinatorics';
    case 4:
      return 'Exam Challenge';
  }
}
