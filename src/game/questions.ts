export type QuestionCategory = 'calculation' | 'definition' | 'formula' | 'word-problem';

export type MathQuestion = {
  id: string;
  prompt: string;
  options: string[];
  answerIndex: number;
  explanation: string;
  supportingData?: string[];
  difficulty: 1 | 2 | 3 | 4;
  category: QuestionCategory;
};

type QuestionDefinition = Omit<MathQuestion, 'id'>;

const questionDefinitions: QuestionDefinition[] = [
  { prompt: 'A class survey shows 12 of 20 students prefer statistics. What is P(statistics)?', options: ['0.6', '0.4', '0.75'], answerIndex: 0, explanation: 'Probability is favourable over total, so 12/20 = 0.6.', difficulty: 1, category: 'calculation' },
  { prompt: 'The mean of 4, 6, 8, 10 is:', options: ['6', '7', '8'], answerIndex: 1, explanation: 'The sum is 28 and 28/4 = 7.', difficulty: 1, category: 'calculation' },
  { prompt: 'A spinner has 8 equal sectors. The probability of landing on one sector is:', options: ['1/16', '1/8', '1/4'], answerIndex: 1, explanation: 'Each equally likely outcome has probability 1/8.', difficulty: 1, category: 'calculation' },
  { prompt: 'The median of 3, 5, 7, 11, 13 is:', options: ['7', '8', '9'], answerIndex: 0, explanation: 'The middle value in the ordered list is 7.', difficulty: 1, category: 'calculation' },
  { prompt: 'A bag has 5 red and 5 blue counters. The probability of red is:', options: ['1/2', '1/5', '2/5'], answerIndex: 0, explanation: 'There are 5 red counters out of 10 total, so the probability is 1/2.', difficulty: 1, category: 'calculation' },
  { prompt: 'The mode of 2, 4, 4, 5, 7 is:', options: ['4', '5', '22/5'], answerIndex: 0, explanation: 'The mode is the value that appears most often, which is 4.', difficulty: 1, category: 'calculation' },
  { prompt: 'What does the mean of a data set represent?', options: ['The average value', 'The middle value only', 'The highest value'], answerIndex: 0, explanation: 'The mean is the arithmetic average of the data values.', difficulty: 1, category: 'definition' },
  { prompt: 'What is the median?', options: ['The most common value', 'The middle value in an ordered set', 'The range divided by 2'], answerIndex: 1, explanation: 'The median is the middle value once the data are ordered.', difficulty: 1, category: 'definition' },
  { prompt: 'The formula for probability of an event A is:', options: ['favourable outcomes / total outcomes', 'sum of all outcomes / favourable outcomes', 'mean x sample size'], answerIndex: 0, explanation: 'Basic probability is favourable outcomes divided by total possible outcomes.', difficulty: 1, category: 'formula' },
  { prompt: 'The range of a data set is calculated by:', options: ['maximum - minimum', 'mean - median', 'Q3 - Q1'], answerIndex: 0, explanation: 'Range measures spread from the smallest value to the largest.', difficulty: 1, category: 'formula' },

  { prompt: 'How many ways can 5 different books be arranged on a shelf?', options: ['25', '120', '60'], answerIndex: 1, explanation: 'This is a permutation: 5! = 120.', difficulty: 2, category: 'calculation' },
  { prompt: 'How many committees of 3 can be chosen from 6 students?', options: ['20', '18', '120'], answerIndex: 0, explanation: 'Use combinations: 6C3 = 20.', difficulty: 2, category: 'calculation' },
  { prompt: 'If P(A) = 0.3 and P(B) = 0.5 for independent events, P(A and B) is:', options: ['0.15', '0.8', '0.2'], answerIndex: 0, explanation: 'For independent events, multiply: 0.3 x 0.5 = 0.15.', difficulty: 2, category: 'calculation' },
  { prompt: 'If the odds in favour of an event are 3:2, the probability is:', options: ['3/5', '2/5', '1/5'], answerIndex: 0, explanation: 'Odds 3:2 means 3 favourable out of 5 total, so 3/5.', difficulty: 2, category: 'calculation' },
  { prompt: 'A class has 7 girls and 5 boys. If one student is chosen at random, P(boy) is:', options: ['5/12', '7/12', '1/5'], answerIndex: 0, explanation: 'There are 5 boys out of 12 students, so the probability is 5/12.', difficulty: 2, category: 'calculation' },
  { prompt: 'How many 2-letter arrangements can be made from A, B, C, D without repetition?', options: ['8', '12', '16'], answerIndex: 1, explanation: 'This is a permutation: 4P2 = 4 x 3 = 12.', difficulty: 2, category: 'calculation' },
  { prompt: 'What is a permutation?', options: ['A selection where order matters', 'A selection where order does not matter', 'A data display using bars'], answerIndex: 0, explanation: 'Permutations count arrangements where order changes the outcome.', difficulty: 2, category: 'definition' },
  { prompt: 'What is a combination?', options: ['A choice where order matters', 'A choice where order does not matter', 'The average of a data set'], answerIndex: 1, explanation: 'Combinations count selections where order does not matter.', difficulty: 2, category: 'definition' },
  { prompt: 'Which formula gives the number of combinations of r objects from n?', options: ['nCr = n! / (r!(n-r)!)', 'nPr = n! / (n-r)!', 'P(A or B) = P(A)+P(B)'], answerIndex: 0, explanation: 'The combination formula divides by r! because order does not matter.', difficulty: 2, category: 'formula' },
  { prompt: 'Which formula gives the number of permutations of r objects from n?', options: ['nPr = n! / (n-r)!', 'nCr = n! / (r!(n-r)!)', 'variance = SD squared'], answerIndex: 0, explanation: 'The permutation formula counts ordered arrangements.', difficulty: 2, category: 'formula' },

  { prompt: 'A die is rolled twice. The probability of getting two even numbers is:', options: ['1/4', '1/3', '1/6'], answerIndex: 0, explanation: 'Each even result has probability 1/2, so (1/2)(1/2) = 1/4.', difficulty: 3, category: 'calculation' },
  { prompt: 'How many ways can 4 students be chosen from 9?', options: ['126', '3024', '36'], answerIndex: 0, explanation: 'Use combinations: 9C4 = 126.', difficulty: 3, category: 'calculation' },
  { prompt: 'If the mean of five numbers is 18, their total sum is:', options: ['23', '90', '18'], answerIndex: 1, explanation: 'Sum = mean x number of values, so 18 x 5 = 90.', difficulty: 3, category: 'calculation' },
  { prompt: 'In a binomial setting with n = 4 and p = 0.5, P(exactly 2 successes) is:', options: ['6/16', '4/16', '8/16'], answerIndex: 0, explanation: 'Use 4C2(0.5)^4 = 6/16.', difficulty: 3, category: 'calculation' },
  { prompt: 'A set has Q1 = 12 and Q3 = 20. The interquartile range is:', options: ['8', '16', '32'], answerIndex: 0, explanation: 'IQR = Q3 - Q1 = 20 - 12 = 8.', difficulty: 3, category: 'calculation' },
  { prompt: 'If P(A) = 0.7, P(B) = 0.5, and P(A and B) = 0.4, then P(A or B) is:', options: ['0.8', '0.6', '0.9'], answerIndex: 0, explanation: 'Use P(A or B) = P(A) + P(B) - P(A and B) = 0.8.', difficulty: 3, category: 'calculation' },
  { prompt: 'A test score of 78 comes from a distribution with mean 70 and standard deviation 4. What is the z-score?', options: ['2', '1.5', '3'], answerIndex: 0, explanation: 'Use z = (x - mean) / SD = (78 - 70) / 4 = 2.', difficulty: 3, category: 'calculation' },
  { prompt: 'A student has a z-score of -1.5 in a class where the mean mark is 68 and the standard deviation is 6. What mark did the student earn?', options: ['59', '77', '62'], answerIndex: 0, explanation: 'Use x = mean + z(SD) = 68 + (-1.5)(6) = 59.', difficulty: 3, category: 'calculation' },
  { prompt: 'The data values are 4, 6, 8, 10, 12. What is the population standard deviation to one decimal place?', options: ['2.8', '3.2', '2.0'], answerIndex: 0, explanation: 'The mean is 8. The squared deviations sum to 40, so variance is 40/5 = 8 and the standard deviation is about 2.8.', difficulty: 3, category: 'calculation' },
  { prompt: 'The values 2, 4, 4, 4, 5, 5, 7, 9 have a mean of 5. What is the population standard deviation to one decimal place?', options: ['2.0', '2.5', '1.4'], answerIndex: 0, explanation: 'The squared deviations sum to 32, so variance is 32/8 = 4 and the population standard deviation is 2.0.', difficulty: 3, category: 'calculation' },
  { prompt: 'A frequency table shows x-values 1, 2, 3, 4 with frequencies 2, 3, 3, 2. What is the mean?', options: ['2.5', '2.8', '3.0'], answerIndex: 0, explanation: 'Use the weighted mean: (1·2 + 2·3 + 3·3 + 4·2) / 10 = 2.5.', supportingData: ['Frequency table', 'x: 1   2   3   4', 'f: 2   3   3   2'], difficulty: 3, category: 'calculation' },
  { prompt: 'A normal distribution is sketched with the mean in the center. Approximately what percent of values lie between the mean and 1 standard deviation above the mean?', options: ['34%', '68%', '13.5%'], answerIndex: 0, explanation: 'About 68% of values lie within 1 standard deviation of the mean, so half of that is about 34%.', supportingData: ['Empirical rule', 'Within 1 standard deviation: 68%', 'One side of the mean to z = 1: 34%'], difficulty: 3, category: 'word-problem' },
  { prompt: 'A normal curve model shows one mark at z = -1 and another at z = 1. Approximately what percent of the data lies between them?', options: ['68%', '34%', '95%'], answerIndex: 0, explanation: 'By the empirical rule, about 68% of the data lies within 1 standard deviation of the mean.', supportingData: ['Marked interval', 'z = -1   through   z = 1', 'Central area: about 68%'], difficulty: 3, category: 'word-problem' },
  { prompt: 'A student writes a standardized statistics test and earns a z-score of 1.0. About what percentile is this result?', options: ['84th percentile', '50th percentile', '98th percentile'], answerIndex: 0, explanation: 'A z-score of 1.0 is approximately the 84th percentile on the standard normal curve.', supportingData: ['Standard normal reference', 'z = 0.0 -> 50th percentile', 'z = 1.0 -> about 84th percentile'], difficulty: 3, category: 'word-problem' },
  { prompt: 'A club is choosing a president and vice-president from 8 students. How many different ordered pairs are possible?', options: ['56', '28', '16'], answerIndex: 0, explanation: 'Order matters for the two roles, so use a permutation: 8P2 = 8 x 7 = 56.', difficulty: 3, category: 'word-problem' },
  { prompt: 'What does interquartile range measure?', options: ['Spread of the middle 50% of data', 'Difference between the largest and smallest value', 'The most common class interval'], answerIndex: 0, explanation: 'IQR focuses on the spread of the central half of the data.', difficulty: 3, category: 'definition' },
  { prompt: 'What is expected value?', options: ['The long-run average outcome', 'The highest possible outcome', 'The number of outcomes in a sample space'], answerIndex: 0, explanation: 'Expected value is the weighted average of outcomes over many trials.', difficulty: 3, category: 'definition' },
  { prompt: 'Which formula gives P(A or B)?', options: ['P(A)+P(B)-P(A and B)', 'P(A)P(B)', 'P(A)/P(B)'], answerIndex: 0, explanation: 'For general events, subtract the overlap once.', difficulty: 3, category: 'formula' },
  { prompt: 'The interquartile range formula is:', options: ['Q3 - Q1', 'Q1 - Q3', 'maximum - minimum'], answerIndex: 0, explanation: 'IQR is the upper quartile minus the lower quartile.', difficulty: 3, category: 'formula' },

  { prompt: 'How many distinct arrangements can be made from the letters in DATA?', options: ['24', '12', '4'], answerIndex: 1, explanation: 'There are 4! / 2! = 12 distinct arrangements because A repeats twice.', difficulty: 4, category: 'calculation' },
  { prompt: 'A larger standard deviation usually means the data are:', options: ['more spread out', 'more symmetric', 'closer to the median'], answerIndex: 0, explanation: 'A larger standard deviation indicates greater spread from the mean.', difficulty: 4, category: 'calculation' },
  { prompt: 'If E(X) = 12 and E(Y) = 4, then E(X - Y) is:', options: ['3', '8', '16'], answerIndex: 1, explanation: 'Expected value is linear, so E(X - Y) = 12 - 4 = 8.', difficulty: 4, category: 'calculation' },
  { prompt: 'A test has 8 multiple-choice questions with 4 answers each. Guessing all of them, the expected number correct is:', options: ['2', '4', '1'], answerIndex: 0, explanation: 'Expected correct answers = np = 8 x 1/4 = 2.', difficulty: 4, category: 'calculation' },
  { prompt: 'How many ways can 3 prizes be awarded to 10 students if order matters and no student can win twice?', options: ['120', '720', '1000'], answerIndex: 1, explanation: 'Awarding distinct prizes is a permutation: 10P3 = 10 x 9 x 8 = 720.', difficulty: 4, category: 'calculation' },
  { prompt: 'If events A and B are mutually exclusive with P(A) = 0.35 and P(B) = 0.25, then P(A or B) is:', options: ['0.60', '0.0875', '0.10'], answerIndex: 0, explanation: 'Mutually exclusive events add directly, so 0.35 + 0.25 = 0.60.', difficulty: 4, category: 'calculation' },
  { prompt: 'An IQ score of 124 comes from a normal distribution with mean 100 and standard deviation 16. What is the z-score?', options: ['1.5', '1.24', '2.0'], answerIndex: 0, explanation: 'Use z = (x - mean) / SD = (124 - 100) / 16 = 1.5.', difficulty: 4, category: 'calculation' },
  { prompt: 'A machine fills bottles with a mean volume of 500 mL and a standard deviation of 8 mL. If a bottle has z = -1.25, what volume was filled?', options: ['490 mL', '510 mL', '492 mL'], answerIndex: 0, explanation: 'Use x = mean + z(SD) = 500 + (-1.25)(8) = 490 mL.', difficulty: 4, category: 'calculation' },
  { prompt: 'A student records the number of minutes classmates study each night as 20, 22, 24, 24, 30. What is the population standard deviation to one decimal place?', options: ['3.4', '4.0', '2.8'], answerIndex: 0, explanation: 'The mean is 24. The squared deviations sum to 58, so variance is 58/5 = 11.6 and the standard deviation is about 3.4.', difficulty: 4, category: 'calculation' },
  { prompt: 'A frequency table has x-values 3, 5, 7 with frequencies 2, 5, 3. What is the population standard deviation to one decimal place?', options: ['1.6', '1.2', '2.0'], answerIndex: 0, explanation: 'The weighted mean is 5.2. The weighted squared deviations sum to 25.6, so variance is 2.56 and the standard deviation is 1.6.', supportingData: ['Frequency table', 'x: 3   5   7', 'f: 2   5   3'], difficulty: 4, category: 'calculation' },
  { prompt: 'A grouped data summary for daily sales shows values 10, 20, 30, 40 with frequencies 1, 4, 4, 1. What is the mean daily sale?', options: ['25', '22', '30'], answerIndex: 0, explanation: 'Use the weighted mean: (10·1 + 20·4 + 30·4 + 40·1) / 10 = 25.', supportingData: ['Grouped summary', 'Value: 10  20  30  40', 'Freq :  1   4   4   1'], difficulty: 4, category: 'calculation' },
  { prompt: 'On a normal curve, what percent of values lie between z = 1 and z = 2?', options: ['13.5%', '34%', '27%'], answerIndex: 0, explanation: 'By the empirical rule, one side between 1 and 2 standard deviations is (95 - 68) / 2 = 13.5%.', supportingData: ['Empirical rule', 'Within 1 standard deviation: 68%', 'Within 2 standard deviations: 95%'], difficulty: 4, category: 'word-problem' },
  { prompt: 'A normal distribution graph marks the interval from z = -2 to z = 2. Approximately what percent of values are outside that interval?', options: ['5%', '2.5%', '32%'], answerIndex: 0, explanation: 'About 95% of values lie within 2 standard deviations, so about 5% lie outside.', supportingData: ['Marked interval', 'z = -2   through   z = 2', 'Outside the central 95%: about 5%'], difficulty: 4, category: 'word-problem' },
  { prompt: 'A data set is 12, 15, 18, 21, 24, 27. What is the population standard deviation to one decimal place?', options: ['5.1', '4.2', '6.0'], answerIndex: 0, explanation: 'The mean is 19.5. The squared deviations sum to 157.5, so variance is 26.25 and the standard deviation is about 5.1.', difficulty: 4, category: 'calculation' },
  { prompt: 'A basketball player makes 70% of free throws. Over 10 independent shots, what is the expected number of successful shots?', options: ['7', '3', '0.7'], answerIndex: 0, explanation: 'For a binomial setting, the expected value is np = 10 x 0.7 = 7.', difficulty: 4, category: 'calculation' },
  { prompt: 'In a survey, 55% of students have a part-time job, 40% play sports, and 18% do both. What percent do at least one of the two activities?', options: ['77%', '95%', '37%'], answerIndex: 0, explanation: 'Use P(A or B) = 0.55 + 0.40 - 0.18 = 0.77, or 77%.', difficulty: 4, category: 'calculation' },
  { prompt: 'A scholarship score of 96 comes from a normal distribution with mean 84 and standard deviation 6. About what percentile is that result?', options: ['98th percentile', '84th percentile', '50th percentile'], answerIndex: 0, explanation: 'First compute z = (96 - 84) / 6 = 2. A z-score of 2 is about the 98th percentile.', supportingData: ['Compute first', 'z = (96 - 84) / 6 = 2', 'z = 2 is about the 98th percentile'], difficulty: 4, category: 'word-problem' },
  { prompt: 'A cereal factory fills boxes with mean mass 510 g and standard deviation 8 g. A box has z = -1.5. What mass did that box have?', options: ['498 g', '522 g', '502 g'], answerIndex: 0, explanation: 'Use x = mean + z(SD) = 510 + (-1.5)(8) = 498 g.', difficulty: 4, category: 'word-problem' },
  { prompt: 'An exam has 12 multiple-choice questions. A student guesses on every question and each has 4 options. What is the expected number correct?', options: ['3', '4', '0.25'], answerIndex: 0, explanation: 'This is a binomial setting with n = 12 and p = 1/4, so the expected value is np = 3.', difficulty: 4, category: 'word-problem' },
  { prompt: 'What does standard deviation describe?', options: ['Average spread from the mean', 'The most frequent value', 'The number of data points'], answerIndex: 0, explanation: 'Standard deviation measures typical distance from the mean.', difficulty: 4, category: 'definition' },
  { prompt: 'What does a binomial distribution model?', options: ['Fixed number of independent trials with success/failure outcomes', 'Any continuous random variable', 'A data set with one median'], answerIndex: 0, explanation: 'Binomial distributions model repeated independent yes/no trials.', difficulty: 4, category: 'definition' },
  { prompt: 'Which formula gives expected value for a discrete random variable?', options: ['E(X) = Σ[x·P(x)]', 'E(X) = n!/(n-r)!', 'E(X) = Q3 - Q1'], answerIndex: 0, explanation: 'Expected value multiplies each outcome by its probability and sums the results.', difficulty: 4, category: 'formula' },
  { prompt: 'Which formula connects variance and standard deviation?', options: ['variance = (standard deviation)^2', 'standard deviation = mean + median', 'variance = Q3 - Q1'], answerIndex: 0, explanation: 'Variance is the square of the standard deviation.', difficulty: 4, category: 'formula' },
];

export const questions: MathQuestion[] = questionDefinitions.map((question, index) => ({
  ...question,
  id: `q-${index + 1}`,
}));

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }

  return copy;
}

export class QuestionDeck {
  private questionBank: MathQuestion[];
  private unlockedDifficulty: 1 | 2 | 3 | 4;
  private queue: MathQuestion[] = [];
  private excludedQuestionIds = new Set<string>();
  private recentQuestionIds: string[] = [];
  private readonly recentHistoryLimit = 12;

  constructor(questionBank: MathQuestion[] = questions, initialDifficulty: 1 | 2 | 3 | 4 = 1) {
    this.questionBank = [...questionBank];
    this.unlockedDifficulty = initialDifficulty;
    this.refill();
  }

  setQuestionBank(questionBank: MathQuestion[]): void {
    this.questionBank = [...questionBank];
    this.refill();
  }

  setDifficulty(nextDifficulty: 1 | 2 | 3 | 4): void {
    if (nextDifficulty <= this.unlockedDifficulty) {
      return;
    }

    this.unlockedDifficulty = nextDifficulty;
    this.refill();
  }

  setExcludedQuestionIds(questionIds: string[]): void {
    this.excludedQuestionIds = new Set(questionIds);
    this.queue = this.queue.filter((question) => !this.excludedQuestionIds.has(question.id));
  }

  nextQuestion(): MathQuestion {
    if (this.queue.length === 0) {
      this.refill();
    }

    const question = this.queue.shift();

    if (!question) {
      throw new Error('Question deck is unexpectedly empty.');
    }

    this.recentQuestionIds.push(question.id);
    if (this.recentQuestionIds.length > this.recentHistoryLimit) {
      this.recentQuestionIds.shift();
    }

    return question;
  }

  private refill(): void {
    const availableQuestions = this.questionBank.filter(
      (question) => question.difficulty <= this.unlockedDifficulty && !this.excludedQuestionIds.has(question.id),
    );
    const recentQuestionIdSet = new Set(this.recentQuestionIds);
    const nonRecentQuestions = availableQuestions.filter((question) => !recentQuestionIdSet.has(question.id));

    this.queue = shuffle(nonRecentQuestions.length > 0 ? nonRecentQuestions : availableQuestions);
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

export function getCategoryLabel(category: QuestionCategory): string {
  switch (category) {
    case 'calculation':
      return 'Solve';
    case 'definition':
      return 'Definition';
    case 'formula':
      return 'Formula';
    case 'word-problem':
      return 'Word Problem';
  }
}
