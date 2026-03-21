export type QuestionCategory = 'calculation' | 'definition' | 'formula' | 'word-problem';

export type MathQuestion = {
  id: string;
  prompt: string;
  answer: string;
  explanation: string;
  supportingData?: string[];
  difficulty: 1 | 2 | 3 | 4;
  category: QuestionCategory;
  options?: string[];
  answerIndex?: number;
};

type QuestionDefinition = Omit<MathQuestion, 'id'>;

// Helper to generate distractors for MC questions
function makeOptions(correct: string, distractors: string[]): { options: string[]; answerIndex: number } {
  const options = [correct, ...distractors];
  // Shuffle options so correct isn't always first
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  return { options, answerIndex: options.indexOf(correct) };
}

const questionDefinitions: QuestionDefinition[] = [
    // --- Unit 3 Experimental Probability Practice ---
    { prompt: 'A standard die is rolled 15 times and a 5 comes up 4 times. What is the experimental probability of rolling a 5?', answer: '4/15', explanation: 'Experimental probability = number of times event occurs / number of trials = 4/15.', difficulty: 1, category: 'calculation' },
      { prompt: 'A standard die is rolled 15 times and a 5 comes up 4 times. What is the experimental probability of rolling a 5?', answer: '4/15', explanation: 'Experimental probability = number of times event occurs / number of trials = 4/15.', difficulty: 1, category: 'calculation' },
    { prompt: 'A coin is tossed 12 times and lands on heads 7 times. What is the experimental probability of the coin landing on tails?', answer: '5/12', explanation: 'Tails appeared 5 times out of 12, so probability is 5/12.', difficulty: 1, category: 'calculation' },
      { prompt: 'A coin is tossed 12 times and lands on heads 7 times. What is the experimental probability of the coin landing on tails?', answer: '5/12', explanation: 'Tails appeared 5 times out of 12, so probability is 5/12.', difficulty: 1, category: 'calculation' },
    { prompt: 'A spinner with numbers 1–6 is spun 20 times, and it lands on 3 a total of 6 times. What is the experimental probability of spinning a 3?', answer: '6/20', explanation: 'Experimental probability = 6/20.', difficulty: 1, category: 'calculation' },
      { prompt: 'A spinner with numbers 1–6 is spun 20 times, and it lands on 3 a total of 6 times. What is the experimental probability of spinning a 3?', answer: '6/20', explanation: 'Experimental probability = 6/20.', difficulty: 1, category: 'calculation' },
    { prompt: 'A basketball player makes 18 out of 25 free throw attempts. What is the experimental probability that the player makes a free throw?', answer: '18/25', explanation: 'Experimental probability = 18/25.', difficulty: 1, category: 'calculation' },
      { prompt: 'A basketball player makes 18 out of 25 free throw attempts. What is the experimental probability that the player makes a free throw?', answer: '18/25', explanation: 'Experimental probability = 18/25.', difficulty: 1, category: 'calculation' },
    { prompt: 'A bag contains different colored marbles. A student randomly draws a marble 16 times, and blue appears 5 times. What is the experimental probability of drawing a blue marble?', answer: '5/16', explanation: 'Blue appeared 5 times out of 16 draws, so probability is 5/16.', difficulty: 1, category: 'calculation' },
      { prompt: 'A bag contains different colored marbles. A student randomly draws a marble 16 times, and blue appears 5 times. What is the experimental probability of drawing a blue marble?', answer: '5/16', explanation: 'Blue appeared 5 times out of 16 draws, so probability is 5/16.', difficulty: 1, category: 'calculation' },
    { prompt: 'A soccer player scores 14 goals out of 22 shots on goal. What is the experimental probability that the player scores on a shot?', answer: '14/22', explanation: 'Experimental probability = 14/22.', difficulty: 1, category: 'calculation' },
      { prompt: 'A soccer player scores 14 goals out of 22 shots on goal. What is the experimental probability that the player scores on a shot?', answer: '14/22', explanation: 'Experimental probability = 14/22.', difficulty: 1, category: 'calculation' },
    { prompt: 'Maya correctly answers 24 out of 30 math questions on a quiz. What is the experimental probability that Maya answers a question correctly?', answer: '24/30', explanation: 'Probability = 24/30 = 0.8.', difficulty: 1, category: 'calculation' },
      { prompt: 'Maya correctly answers 24 out of 30 math questions on a quiz. What is the experimental probability that Maya answers a question correctly?', answer: '24/30', explanation: 'Probability = 24/30 = 0.8.', difficulty: 1, category: 'calculation' },
    { prompt: 'Maya answers 6 out of the next 10 questions correctly. What is her new overall experimental probability (total correct out of total attempted)?', answer: '30/40', explanation: 'Total correct: 24+6=30, total attempted: 30+10=40, so probability = 30/40 = 0.75.', difficulty: 1, category: 'calculation' },
      { prompt: 'Maya answers 6 out of the next 10 questions correctly. What is her new overall experimental probability (total correct out of total attempted)?', answer: '30/40', explanation: 'Total correct: 24+6=30, total attempted: 30+10=40, so probability = 30/40 = 0.75.', difficulty: 1, category: 'calculation' },
    { prompt: 'A baseball player gets 9 hits out of 20 at-bats. What is the experimental probability of getting a hit?', answer: '9/20', explanation: 'Probability = 9/20.', difficulty: 1, category: 'calculation' },
      { prompt: 'A baseball player gets 9 hits out of 20 at-bats. What is the experimental probability of getting a hit?', answer: '9/20', explanation: 'Probability = 9/20.', difficulty: 1, category: 'calculation' },
    { prompt: 'A baseball player gets 9 hits out of 20 at-bats, then gets 3 hits in the next 10 at-bats. What is the new overall experimental probability?', answer: '12/30', explanation: 'Total hits: 9+3=12, total at-bats: 20+10=30, so probability = 12/30 = 0.4.', difficulty: 1, category: 'calculation' },
      { prompt: 'A baseball player gets 9 hits out of 20 at-bats, then gets 3 hits in the next 10 at-bats. What is the new overall experimental probability?', answer: '12/30', explanation: 'Total hits: 9+3=12, total at-bats: 20+10=30, so probability = 12/30 = 0.4.', difficulty: 1, category: 'calculation' },
    { prompt: 'A six-sided die is rolled 40 times. The result 4 appears 9 times. What is the experimental probability of rolling a 4?', answer: '9/40', explanation: 'Probability = 9/40.', difficulty: 1, category: 'calculation' },
      { prompt: 'A six-sided die is rolled 40 times. The result 4 appears 9 times. What is the experimental probability of rolling a 4?', answer: '9/40', explanation: 'Probability = 9/40.', difficulty: 1, category: 'calculation' },
    { prompt: 'A six-sided die is rolled 40 times. The results are: 1 appears 5 times, 2 appears 8 times, 3 appears 6 times, 4 appears 9 times, 5 appears 7 times, 6 appears 5 times. What is the experimental probability of rolling an even number?', answer: '22/40', explanation: 'Even numbers: 2(8), 4(9), 6(5) = 8+9+5=22, so 22/40.', difficulty: 1, category: 'calculation' },
      { prompt: 'A six-sided die is rolled 40 times. The results are: 1 appears 5 times, 2 appears 8 times, 3 appears 6 times, 4 appears 9 times, 5 appears 7 times, 6 appears 5 times. What is the experimental probability of rolling an even number?', answer: '22/40', explanation: 'Even numbers: 2(8), 4(9), 6(5) = 8+9+5=22, so 22/40.', difficulty: 1, category: 'calculation' },
    { prompt: 'A six-sided die is rolled 40 times. The results are: 1 appears 5 times, 2 appears 8 times, 3 appears 6 times, 4 appears 9 times, 5 appears 7 times, 6 appears 5 times. What is the experimental probability of rolling a number greater than 4?', answer: '12/40', explanation: 'Greater than 4: 5(7), 6(5) = 7+5=12, so 12/40.', difficulty: 1, category: 'calculation' },
      { prompt: 'A six-sided die is rolled 40 times. The results are: 1 appears 5 times, 2 appears 8 times, 3 appears 6 times, 4 appears 9 times, 5 appears 7 times, 6 appears 5 times. What is the experimental probability of rolling a number greater than 4?', answer: '12/40', explanation: 'Greater than 4: 5(7), 6(5) = 7+5=12, so 12/40.', difficulty: 1, category: 'calculation' },

    // --- Unit 3 Theoretical Probability Practice ---
    { prompt: 'A bag contains 4 red marbles, 3 blue marbles, and 2 yellow marbles. One marble is chosen at random. What is the theoretical probability of choosing a blue marble?', answer: '3/9', explanation: 'Total marbles: 4+3+2=9. Blue: 3/9.', difficulty: 1, category: 'calculation' },
    { prompt: 'What is the theoretical probability of rolling an even number on a standard six-sided die?', answer: '1/2', explanation: 'Even numbers: 2, 4, 6. Probability: 3/6 = 1/2.', difficulty: 1, category: 'calculation' },
    { prompt: 'What is the theoretical probability of rolling a number greater than 4 on a standard six-sided die?', answer: '1/3', explanation: 'Greater than 4: 5, 6. Probability: 2/6 = 1/3.', difficulty: 1, category: 'calculation' },
    { prompt: 'What is the theoretical probability of drawing a spade from a standard deck of 52 cards?', answer: '1/4', explanation: 'There are 4 suits, so 13/52 = 1/4.', difficulty: 1, category: 'calculation' },
    { prompt: 'What is the theoretical probability of drawing a queen from a standard deck of 52 cards?', answer: '1/13', explanation: 'There are 4 queens, so 4/52 = 1/13.', difficulty: 1, category: 'calculation' },
    { prompt: 'What is the theoretical probability of drawing a black card from a standard deck of 52 cards?', answer: '1/2', explanation: 'Half the cards are black: 26/52 = 1/2.', difficulty: 1, category: 'calculation' },
    { prompt: 'You are playing a card game. You lose if you draw a red card from a full deck of 52 playing cards. What is the theoretical probability that you will win on the first draw?', answer: '1/2', explanation: 'Red cards: 26/52. Win = black card: 26/52 = 1/2.', difficulty: 1, category: 'calculation' },
    { prompt: 'A spinner has 5 equal sections labeled A, B, C, D, and E. What is the probability of landing on C?', answer: '1/5', explanation: 'Each section is equally likely: 1/5.', difficulty: 1, category: 'calculation' },
    { prompt: 'A spinner has 5 equal sections labeled A, B, C, D, and E. What is the probability of landing on a letter before D in the alphabet?', answer: '3/5', explanation: 'A, B, C are before D: 3/5.', difficulty: 1, category: 'calculation' },
    { prompt: 'Sara has a blue shirt, a white shirt, and a black shirt. She also has blue shoes, black shoes, and red shoes. How many possible outfits can Sara make?', answer: '9', explanation: '3 shirts x 3 shoes = 9 outfits.', difficulty: 1, category: 'calculation' },
    // The following two questions are subparts of the same scenario. Prepend the scenario to each sub-question for clarity.
    { prompt: 'A bag contains 5 green balls, 3 yellow balls, and 2 purple balls. Two balls are chosen one at a time without replacement. What is the probability that both balls are green?', answer: '2/9', explanation: 'First: 5/10, then 4/9. Multiply: 5/10 x 4/9 = 20/90 = 2/9 ≈ 0.22.', difficulty: 2, category: 'calculation' },
    { prompt: 'A bag contains 5 green balls, 3 yellow balls, and 2 purple balls. Two balls are chosen one at a time without replacement. What is the probability that the first ball is yellow and the second ball is purple?', answer: '1/15', explanation: 'First: 3/10, then 2/9. Multiply: 3/10 x 2/9 = 6/90 = 1/15.', difficulty: 2, category: 'calculation' },
  { prompt: 'A class survey shows 12 of 20 students prefer statistics. What is P(statistics)?', answer: '0.6', explanation: 'Probability is favourable over total, so 12/20 = 0.6.', difficulty: 1, category: 'calculation' },
  { prompt: 'The mean of 4, 6, 8, 10 is:', answer: '7', explanation: 'The sum is 28 and 28/4 = 7.', difficulty: 1, category: 'calculation' },
  { prompt: 'A spinner has 8 equal sectors. The probability of landing on one sector is:', answer: '1/8', explanation: 'Each equally likely outcome has probability 1/8.', difficulty: 1, category: 'calculation' },
  { prompt: 'The median of 3, 5, 7, 11, 13 is:', answer: '7', explanation: 'The middle value in the ordered list is 7.', difficulty: 1, category: 'calculation' },
  { prompt: 'A bag has 5 red and 5 blue counters. The probability of red is:', answer: '1/2', explanation: 'There are 5 red counters out of 10 total, so the probability is 1/2.', difficulty: 1, category: 'calculation' },
  { prompt: 'The mode of 2, 4, 4, 5, 7 is:', answer: '4', explanation: 'The mode is the value that appears most often, which is 4.', difficulty: 1, category: 'calculation' },
  { prompt: 'What does the mean of a data set represent?', answer: 'The average value', explanation: 'The mean is the arithmetic average of the data values.', difficulty: 1, category: 'definition' },
  { prompt: 'What is the median?', answer: 'The middle value in an ordered set', explanation: 'The median is the middle value once the data are ordered.', difficulty: 1, category: 'definition' },
  { prompt: 'The formula for probability of an event A is:', answer: 'favourable outcomes / total outcomes', explanation: 'Basic probability is favourable outcomes divided by total possible outcomes.', difficulty: 1, category: 'formula' },
  { prompt: 'The range of a data set is calculated by:', answer: 'maximum - minimum', explanation: 'Range measures spread from the smallest value to the largest.', difficulty: 1, category: 'formula' },

  { prompt: 'How many ways can 5 different books be arranged on a shelf?', answer: '120', explanation: 'This is a permutation: 5! = 120.', difficulty: 2, category: 'calculation' },
  { prompt: 'How many committees of 3 can be chosen from 6 students?', answer: '20', explanation: 'Use combinations: 6C3 = 20.', difficulty: 2, category: 'calculation' },
  { prompt: 'If P(A) = 0.3 and P(B) = 0.5 for independent events, P(A and B) is:', answer: '0.15', explanation: 'For independent events, multiply: 0.3 x 0.5 = 0.15.', difficulty: 2, category: 'calculation' },
  { prompt: 'If the odds in favour of an event are 3:2, the probability is:', answer: '3/5', explanation: 'Odds 3:2 means 3 favourable out of 5 total, so 3/5.', difficulty: 2, category: 'calculation' },
  { prompt: 'A class has 7 girls and 5 boys. If one student is chosen at random, P(boy) is:', answer: '5/12', explanation: 'There are 5 boys out of 12 students, so the probability is 5/12.', difficulty: 2, category: 'calculation' },
  { prompt: 'How many 2-letter arrangements can be made from A, B, C, D without repetition?', answer: '12', explanation: 'This is a permutation: 4P2 = 4 x 3 = 12.', difficulty: 2, category: 'calculation' },
  { prompt: 'What is a permutation?', answer: 'A selection where order matters', explanation: 'Permutations count arrangements where order changes the outcome.', difficulty: 2, category: 'definition' },
  { prompt: 'What is a combination?', answer: 'A choice where order does not matter', explanation: 'Combinations count selections where order does not matter.', difficulty: 2, category: 'definition' },
  // Formula questions (multiple-choice)
  (() => { const { options, answerIndex } = makeOptions('nCr = n! / (r!(n-r)!)', ['nPr = n! / (n-r)!', 'n! / r!']); return { prompt: 'Which formula gives the number of combinations of r objects from n?', answer: 'nCr = n! / (r!(n-r)!)', explanation: 'The combination formula divides by r! because order does not matter.', difficulty: 2, category: 'formula', options, answerIndex }; })(),
  (() => { const { options, answerIndex } = makeOptions('nPr = n! / (n-r)!', ['nCr = n! / (r!(n-r)!)', 'n! / r!']); return { prompt: 'Which formula gives the number of permutations of r objects from n?', answer: 'nPr = n! / (n-r)!', explanation: 'The permutation formula counts ordered arrangements.', difficulty: 2, category: 'formula', options, answerIndex }; })(),

  { prompt: 'A die is rolled twice. The probability of getting two even numbers is:', answer: '1/4', explanation: 'Each even result has probability 1/2, so (1/2)(1/2) = 1/4.', difficulty: 3, category: 'calculation' },
  { prompt: 'How many ways can 4 students be chosen from 9?', answer: '126', explanation: 'Use combinations: 9C4 = 126.', difficulty: 3, category: 'calculation' },
  { prompt: 'If the mean of five numbers is 18, their total sum is:', answer: '90', explanation: 'Sum = mean x number of values, so 18 x 5 = 90.', difficulty: 3, category: 'calculation' },
  { prompt: 'In a binomial setting with n = 4 and p = 0.5, P(exactly 2 successes) is:', answer: '6/16', explanation: 'Use 4C2(0.5)^4 = 6/16.', difficulty: 3, category: 'calculation' },
  { prompt: 'A set has Q1 = 12 and Q3 = 20. The interquartile range is:', answer: '8', explanation: 'IQR = Q3 - Q1 = 20 - 12 = 8.', difficulty: 3, category: 'calculation' },
  { prompt: 'If P(A) = 0.7, P(B) = 0.5, and P(A and B) = 0.4, then P(A or B) is:', answer: '0.8', explanation: 'Use P(A or B) = P(A) + P(B) - P(A and B) = 0.8.', difficulty: 3, category: 'calculation' },
  { prompt: 'A test score of 78 comes from a distribution with mean 70 and standard deviation 4. What is the z-score?', answer: '2', explanation: 'Use z = (x - mean) / SD = (78 - 70) / 4 = 2.', difficulty: 3, category: 'calculation' },
  { prompt: 'A student has a z-score of -1.5 in a class where the mean mark is 68 and the standard deviation is 6. What mark did the student earn?', answer: '59', explanation: 'Use x = mean + z(SD) = 68 + (-1.5)(6) = 59.', difficulty: 3, category: 'calculation' },
  { prompt: 'The data values are 4, 6, 8, 10, 12. What is the population standard deviation to one decimal place?', answer: '2.8', explanation: 'The mean is 8. The squared deviations sum to 40, so variance is 40/5 = 8 and the standard deviation is about 2.8.', difficulty: 3, category: 'calculation' },
  { prompt: 'The values 2, 4, 4, 4, 5, 5, 7, 9 have a mean of 5. What is the population standard deviation to one decimal place?', answer: '2.0', explanation: 'The squared deviations sum to 32, so variance is 32/8 = 4 and the population standard deviation is 2.0.', difficulty: 3, category: 'calculation' },
  { prompt: 'A frequency table shows x-values 1, 2, 3, 4 with frequencies 2, 3, 3, 2. What is the mean?', answer: '2.5', explanation: 'Use the weighted mean: (1·2 + 2·3 + 3·3 + 4·2) / 10 = 2.5.', supportingData: ['Frequency table', 'x: 1   2   3   4', 'f: 2   3   3   2'], difficulty: 3, category: 'calculation' },
  // Word-problem questions (multiple-choice)
  (() => { const { options, answerIndex } = makeOptions('34%', ['68%', '50%']); return { prompt: 'A normal distribution is sketched with the mean in the center. Approximately what percent of values lie between the mean and 1 standard deviation above the mean?', answer: '34%', explanation: 'About 68% of values lie within 1 standard deviation of the mean, so half of that is about 34%.', supportingData: ['Empirical rule', 'Within 1 standard deviation: 68%', 'One side of the mean to z = 1: 34%'], difficulty: 3, category: 'word-problem', options, answerIndex }; })(),
  (() => { const { options, answerIndex } = makeOptions('68%', ['34%', '95%']); return { prompt: 'A normal curve model shows one mark at z = -1 and another at z = 1. Approximately what percent of the data lies between them?', answer: '68%', explanation: 'By the empirical rule, about 68% of the data lies within 1 standard deviation of the mean.', supportingData: ['Marked interval', 'z = -1   through   z = 1', 'Central area: about 68%'], difficulty: 3, category: 'word-problem', options, answerIndex }; })(),
  (() => { const { options, answerIndex } = makeOptions('84th percentile', ['50th percentile', '97th percentile']); return { prompt: 'A student writes a standardized statistics test and earns a z-score of 1.0. About what percentile is this result?', answer: '84th percentile', explanation: 'A z-score of 1.0 is approximately the 84th percentile on the standard normal curve.', supportingData: ['Standard normal reference', 'z = 0.0 -> 50th percentile', 'z = 1.0 -> about 84th percentile'], difficulty: 3, category: 'word-problem', options, answerIndex }; })(),
  (() => { const { options, answerIndex } = makeOptions('56', ['64', '72']); return { prompt: 'A club is choosing a president and vice-president from 8 students. How many different ordered pairs are possible?', answer: '56', explanation: 'Order matters for the two roles, so use a permutation: 8P2 = 8 x 7 = 56.', difficulty: 3, category: 'word-problem', options, answerIndex }; })(),
  { prompt: 'What does interquartile range measure?', answer: 'Spread of the middle 50% of data', explanation: 'IQR focuses on the spread of the central half of the data.', difficulty: 3, category: 'definition' },
  { prompt: 'What is expected value?', answer: 'The long-run average outcome', explanation: 'Expected value is the weighted average of outcomes over many trials.', difficulty: 3, category: 'definition' },
  { prompt: 'Which formula gives P(A or B)?', answer: 'P(A)+P(B)-P(A and B)', explanation: 'For general events, subtract the overlap once.', difficulty: 3, category: 'formula' },
  { prompt: 'The interquartile range formula is:', answer: 'Q3 - Q1', explanation: 'IQR is the upper quartile minus the lower quartile.', difficulty: 3, category: 'formula' },

  { prompt: 'How many distinct arrangements can be made from the letters in DATA?', answer: '12', explanation: 'There are 4! / 2! = 12 distinct arrangements because A repeats twice.', difficulty: 4, category: 'calculation' },
  { prompt: 'A larger standard deviation usually means the data are:', answer: 'more spread out', explanation: 'A larger standard deviation indicates greater spread from the mean.', difficulty: 4, category: 'calculation' },
  { prompt: 'If E(X) = 12 and E(Y) = 4, then E(X - Y) is:', answer: '8', explanation: 'Expected value is linear, so E(X - Y) = 12 - 4 = 8.', difficulty: 4, category: 'calculation' },
  { prompt: 'A test has 8 multiple-choice questions with 4 answers each. Guessing all of them, the expected number correct is:', answer: '2', explanation: 'Expected correct answers = np = 8 x 1/4 = 2.', difficulty: 4, category: 'calculation' },
  { prompt: 'How many ways can 3 prizes be awarded to 10 students if order matters and no student can win twice?', answer: '720', explanation: 'Awarding distinct prizes is a permutation: 10P3 = 10 x 9 x 8 = 720.', difficulty: 4, category: 'calculation' },
  { prompt: 'If events A and B are mutually exclusive with P(A) = 0.35 and P(B) = 0.25, then P(A or B) is:', answer: '0.60', explanation: 'Mutually exclusive events add directly, so 0.35 + 0.25 = 0.60.', difficulty: 4, category: 'calculation' },
  { prompt: 'An IQ score of 124 comes from a normal distribution with mean 100 and standard deviation 16. What is the z-score?', answer: '1.5', explanation: 'Use z = (x - mean) / SD = (124 - 100) / 16 = 1.5.', difficulty: 4, category: 'calculation' },
  { prompt: 'A machine fills bottles with a mean volume of 500 mL and a standard deviation of 8 mL. If a bottle has z = -1.25, what volume was filled?', answer: '490 mL', explanation: 'Use x = mean + z(SD) = 500 + (-1.25)(8) = 490 mL.', difficulty: 4, category: 'calculation' },
  { prompt: 'A student records the number of minutes classmates study each night as 20, 22, 24, 24, 30. What is the population standard deviation to one decimal place?', answer: '3.4', explanation: 'The mean is 24. The squared deviations sum to 58, so variance is 58/5 = 11.6 and the standard deviation is about 3.4.', difficulty: 4, category: 'calculation' },
  { prompt: 'A frequency table has x-values 3, 5, 7 with frequencies 2, 5, 3. What is the population standard deviation to one decimal place?', answer: '1.6', explanation: 'The weighted mean is 5.2. The weighted squared deviations sum to 25.6, so variance is 2.56 and the standard deviation is 1.6.', supportingData: ['Frequency table', 'x: 3   5   7', 'f: 2   5   3'], difficulty: 4, category: 'calculation' },
  { prompt: 'A grouped data summary for daily sales shows values 10, 20, 30, 40 with frequencies 1, 4, 4, 1. What is the mean daily sale?', answer: '25', explanation: 'Use the weighted mean: (10·1 + 20·4 + 30·4 + 40·1) / 10 = 25.', supportingData: ['Grouped summary', 'Value: 10  20  30  40', 'Freq :  1   4   4   1'], difficulty: 4, category: 'calculation' },
  (() => { const { options, answerIndex } = makeOptions('13.5%', ['34%', '2.5%']); return { prompt: 'On a normal curve, what percent of values lie between z = 1 and z = 2?', answer: '13.5%', explanation: 'By the empirical rule, one side between 1 and 2 standard deviations is (95 - 68) / 2 = 13.5%.', supportingData: ['Empirical rule', 'Within 1 standard deviation: 68%', 'Within 2 standard deviations: 95%'], difficulty: 4, category: 'word-problem', options, answerIndex }; })(),
  (() => { const { options, answerIndex } = makeOptions('5%', ['2.5%', '10%']); return { prompt: 'A normal distribution graph marks the interval from z = -2 to z = 2. Approximately what percent of values are outside that interval?', answer: '5%', explanation: 'About 95% of values lie within 2 standard deviations, so about 5% lie outside.', supportingData: ['Marked interval', 'z = -2   through   z = 2', 'Outside the central 95%: about 5%'], difficulty: 4, category: 'word-problem', options, answerIndex }; })(),
  { prompt: 'A data set is 12, 15, 18, 21, 24, 27. What is the population standard deviation to one decimal place?', answer: '5.1', explanation: 'The mean is 19.5. The squared deviations sum to 157.5, so variance is 26.25 and the standard deviation is about 5.1.', difficulty: 4, category: 'calculation' },
  { prompt: 'A basketball player makes 70% of free throws. Over 10 independent shots, what is the expected number of successful shots?', answer: '7', explanation: 'For a binomial setting, the expected value is np = 10 x 0.7 = 7.', difficulty: 4, category: 'calculation' },
  { prompt: 'In a survey, 55% of students have a part-time job, 40% play sports, and 18% do both. What percent do at least one of the two activities?', answer: '77%', explanation: 'Use P(A or B) = 0.55 + 0.40 - 0.18 = 0.77, or 77%.', difficulty: 4, category: 'calculation' },
  (() => { const { options, answerIndex } = makeOptions('98th percentile', ['84th percentile', '50th percentile']); return { prompt: 'A scholarship score of 96 comes from a normal distribution with mean 84 and standard deviation 6. About what percentile is that result?', answer: '98th percentile', explanation: 'First compute z = (96 - 84) / 6 = 2. A z-score of 2 is about the 98th percentile.', supportingData: ['Compute first', 'z = (96 - 84) / 6 = 2', 'z = 2 is about the 98th percentile'], difficulty: 4, category: 'word-problem', options, answerIndex }; })(),
  (() => { const { options, answerIndex } = makeOptions('498 g', ['502 g', '510 g']); return { prompt: 'A cereal factory fills boxes with mean mass 510 g and standard deviation 8 g. A box has z = -1.5. What mass did that box have?', answer: '498 g', explanation: 'Use x = mean + z(SD) = 510 + (-1.5)(8) = 498 g.', difficulty: 4, category: 'word-problem', options, answerIndex }; })(),
  (() => { const { options, answerIndex } = makeOptions('3', ['4', '2']); return { prompt: 'An exam has 12 multiple-choice questions. A student guesses on every question and each has 4 options. What is the expected number correct?', answer: '3', explanation: 'This is a binomial setting with n = 12 and p = 1/4, so the expected value is np = 3.', difficulty: 4, category: 'word-problem', options, answerIndex }; })(),
  { prompt: 'What does standard deviation describe?', answer: 'Average spread from the mean', explanation: 'Standard deviation measures typical distance from the mean.', difficulty: 4, category: 'definition' },
  { prompt: 'What does a binomial distribution model?', answer: 'Fixed number of independent trials with success/failure outcomes', explanation: 'Binomial distributions model repeated independent yes/no trials.', difficulty: 4, category: 'definition' },
  { prompt: 'Which formula gives expected value for a discrete random variable?', answer: 'E(X) = Σ[x·P(x)]', explanation: 'Expected value multiplies each outcome by its probability and sums the results.', difficulty: 4, category: 'formula' },
  { prompt: 'Which formula connects variance and standard deviation?', answer: 'variance = (standard deviation)^2', explanation: 'Variance is the square of the standard deviation.', difficulty: 4, category: 'formula' },
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
