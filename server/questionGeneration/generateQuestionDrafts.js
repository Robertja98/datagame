function shuffle(items) {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }

  return copy;
}

function buildOptions(correctAnswer, distractors) {
  const options = shuffle([correctAnswer, ...distractors]);
  return {
    options,
    answerIndex: options.indexOf(correctAnswer),
  };
}

function normalizeDifficultyLevels(levels) {
  if (!Array.isArray(levels)) {
    return [1, 2, 3, 4];
  }

  const normalized = [...new Set(levels.map((level) => Number(level)).filter((level) => level >= 1 && level <= 4))];
  return normalized.length > 0 ? normalized : [1, 2, 3, 4];
}

function createCalculationDraft(difficulty) {
  if (difficulty === 1) {
    const favourable = 4 + Math.floor(Math.random() * 8);
    const total = favourable + 4 + Math.floor(Math.random() * 8);
    const correct = (favourable / total).toFixed(2);
    const distractors = [(Math.max(0.1, favourable / (total + 2))).toFixed(2), (Math.min(0.95, (favourable + 2) / total)).toFixed(2)];
    const { options, answerIndex } = buildOptions(correct, distractors);

    return {
      prompt: `A survey found ${favourable} students prefer probability out of ${total} students. What is the probability that a random student prefers probability?`,
      options,
      answerIndex,
      explanation: `Probability is favourable outcomes over total outcomes, so ${favourable}/${total} = ${correct}.`,
      difficulty,
      category: 'calculation',
    };
  }

  if (difficulty === 2) {
    const n = 6 + Math.floor(Math.random() * 4);
    const r = 2 + Math.floor(Math.random() * 2);
    const numerator = factorial(n);
    const denominator = factorial(r) * factorial(n - r);
    const correct = String(numerator / denominator);
    const distractors = [String(n * r), String(numerator / factorial(n - r))];
    const { options, answerIndex } = buildOptions(correct, distractors);

    return {
      prompt: `How many committees of ${r} can be chosen from ${n} students?`,
      options,
      answerIndex,
      explanation: `Use combinations: ${n}C${r} = ${correct}.`,
      difficulty,
      category: 'calculation',
    };
  }

  if (difficulty === 3) {
    const variant = Math.floor(Math.random() * 6);

    if (variant === 0) {
      const q1 = 8 + Math.floor(Math.random() * 10);
      const q3 = q1 + 6 + Math.floor(Math.random() * 8);
      const correct = String(q3 - q1);
      const distractors = [String(q3 + q1), String(q3 - q1 + 4)];
      const { options, answerIndex } = buildOptions(correct, distractors);

      return {
        prompt: `A data set has Q1 = ${q1} and Q3 = ${q3}. What is the interquartile range?`,
        options,
        answerIndex,
        explanation: `IQR = Q3 - Q1, so ${q3} - ${q1} = ${correct}.`,
        difficulty,
        category: 'calculation',
      };
    }

    if (variant === 1) {
      const mean = 60 + Math.floor(Math.random() * 16);
      const standardDeviation = 4 + Math.floor(Math.random() * 5);
      const zScore = [-2, -1.5, -1, 1, 1.5, 2][Math.floor(Math.random() * 6)];
      const xValue = mean + zScore * standardDeviation;
      const correct = zScore.toFixed(1).replace('.0', '');
      const distractors = [((xValue - mean) / (standardDeviation + 2)).toFixed(1).replace('.0', ''), (zScore + 0.5).toFixed(1).replace('.0', '')];
      const { options, answerIndex } = buildOptions(correct, distractors);

      return {
        prompt: `A score of ${xValue} comes from a distribution with mean ${mean} and standard deviation ${standardDeviation}. What is the z-score?`,
        options,
        answerIndex,
        explanation: `Use z = (x - mean) / SD = (${xValue} - ${mean}) / ${standardDeviation} = ${correct}.`,
        difficulty,
        category: 'calculation',
      };
    }

    if (variant === 2) {
      const values = [2, 4, 4, 4, 5, 5, 7, 9];
      const correct = '2.0';
      const { options, answerIndex } = buildOptions(correct, ['2.5', '1.4']);

      return {
        prompt: `The values ${values.join(', ')} have mean 5. What is the population standard deviation to one decimal place?`,
        options,
        answerIndex,
        explanation: 'The squared deviations sum to 32, so variance is 32/8 = 4 and the population standard deviation is 2.0.',
        difficulty,
        category: 'calculation',
      };
    }

    if (variant === 3) {
      const { options, answerIndex } = buildOptions('2.5', ['2.8', '3.0']);

      return {
        prompt: 'A frequency table shows x-values 1, 2, 3, 4 with frequencies 2, 3, 3, 2. What is the mean?',
        options,
        answerIndex,
        explanation: 'Use the weighted mean: (1·2 + 2·3 + 3·3 + 4·2) / 10 = 2.5.',
        difficulty,
        category: 'calculation',
      };
    }

    if (variant === 4) {
      const { options, answerIndex } = buildOptions('34%', ['68%', '13.5%']);

      return {
        prompt: 'A normal distribution is sketched with the mean in the center. Approximately what percent of values lie between the mean and 1 standard deviation above the mean?',
        options,
        answerIndex,
        explanation: 'About 68% of values lie within 1 standard deviation of the mean, so half of that is about 34%.',
        difficulty,
        category: 'word-problem',
      };
    }

    const mean = 64 + Math.floor(Math.random() * 12);
    const standardDeviation = 3 + Math.floor(Math.random() * 5);
    const zScore = [-1.5, -1, 1, 1.5, 2][Math.floor(Math.random() * 5)];
    const correct = String(mean + zScore * standardDeviation);
    const distractors = [String(mean - zScore * standardDeviation), String(mean + (zScore + 1) * standardDeviation)];
    const { options, answerIndex } = buildOptions(correct, distractors);

    return {
      prompt: `A student has a z-score of ${zScore} in a distribution with mean ${mean} and standard deviation ${standardDeviation}. What is the original x-value?`,
      options,
      answerIndex,
      explanation: `Use x = mean + z(SD) = ${mean} + (${zScore})(${standardDeviation}) = ${correct}.`,
      difficulty,
      category: 'calculation',
    };
  }

  const variant = Math.floor(Math.random() * 7);

  if (variant === 0) {
    const eventA = 0.2 + Math.floor(Math.random() * 4) * 0.1;
    const eventB = 0.3 + Math.floor(Math.random() * 4) * 0.1;
    const intersection = Math.max(0.1, Math.min(eventA, eventB) - 0.1);
    const correct = (eventA + eventB - intersection).toFixed(2);
    const distractors = [(eventA + eventB).toFixed(2), (eventA * eventB).toFixed(2)];
    const { options, answerIndex } = buildOptions(correct, distractors);

    return {
      prompt: `If P(A) = ${eventA.toFixed(1)}, P(B) = ${eventB.toFixed(1)}, and P(A and B) = ${intersection.toFixed(1)}, what is P(A or B)?`,
      options,
      answerIndex,
      explanation: `Use P(A or B) = P(A) + P(B) - P(A and B) = ${correct}.`,
      difficulty,
      category: 'calculation',
    };
  }

  if (variant === 1) {
    const mean = 90 + Math.floor(Math.random() * 21);
    const standardDeviation = 5 + Math.floor(Math.random() * 6);
    const zScore = [1.2, 1.5, 1.8, 2.0, -1.2][Math.floor(Math.random() * 5)];
    const xValue = (mean + zScore * standardDeviation).toFixed(1).replace('.0', '');
    const correct = zScore.toFixed(1).replace('.0', '');
    const distractors = [((Number(xValue) - mean) / (standardDeviation + 1)).toFixed(1).replace('.0', ''), (zScore + 0.5).toFixed(1).replace('.0', '')];
    const { options, answerIndex } = buildOptions(correct, distractors);

    return {
      prompt: `In a normal distribution with mean ${mean} and standard deviation ${standardDeviation}, what is the z-score for x = ${xValue}?`,
      options,
      answerIndex,
      explanation: `Use z = (x - mean) / SD = (${xValue} - ${mean}) / ${standardDeviation} = ${correct}.`,
      difficulty,
      category: 'calculation',
    };
  }

  if (variant === 2) {
    const mean = 450 + Math.floor(Math.random() * 61);
    const standardDeviation = 10 + Math.floor(Math.random() * 8);
    const zScore = [-1.5, -1, 1, 1.5, 2][Math.floor(Math.random() * 5)];
    const correct = String(mean + zScore * standardDeviation);
    const distractors = [String(mean - zScore * standardDeviation), String(mean + (zScore + 0.5) * standardDeviation)];
    const { options, answerIndex } = buildOptions(correct, distractors);

    return {
      prompt: `A manufacturing process has mean output ${mean} grams and standard deviation ${standardDeviation} grams. What x-value corresponds to z = ${zScore}?`,
      options,
      answerIndex,
      explanation: `Use x = mean + z(SD) = ${mean} + (${zScore})(${standardDeviation}) = ${correct}.`,
      difficulty,
      category: 'calculation',
    };
  }

  if (variant === 3) {
    const { options, answerIndex } = buildOptions('1.6', ['1.2', '2.0']);

    return {
      prompt: 'A frequency table has x-values 3, 5, 7 with frequencies 2, 5, 3. What is the population standard deviation to one decimal place?',
      options,
      answerIndex,
      explanation: 'The weighted mean is 5.2. The weighted squared deviations sum to 25.6, so variance is 2.56 and the standard deviation is 1.6.',
      difficulty,
      category: 'calculation',
    };
  }

  if (variant === 4) {
    const { options, answerIndex } = buildOptions('13.5%', ['34%', '27%']);

    return {
      prompt: 'On a normal curve, what percent of values lie between z = 1 and z = 2?',
      options,
      answerIndex,
      explanation: 'By the empirical rule, one side between 1 and 2 standard deviations is (95 - 68) / 2 = 13.5%.',
      difficulty,
      category: 'word-problem',
    };
  }

  if (variant === 5) {
    const { options, answerIndex } = buildOptions('5%', ['2.5%', '32%']);

    return {
      prompt: 'A normal distribution graph marks the interval from z = -2 to z = 2. Approximately what percent of values are outside that interval?',
      options,
      answerIndex,
      explanation: 'About 95% of values lie within 2 standard deviations, so about 5% lie outside.',
      difficulty,
      category: 'word-problem',
    };
  }

  const probability = 0.5 + Math.floor(Math.random() * 4) * 0.1;
  const trials = 8 + Math.floor(Math.random() * 5);
  const correct = String((probability * trials).toFixed(1).replace('.0', ''));
  const distractors = [String(trials - probability * trials), probability.toFixed(1)];
  const { options, answerIndex } = buildOptions(correct, distractors);

  return {
    prompt: `A Grade 12 student estimates they answer a multiple-choice question correctly with probability ${probability.toFixed(1)}. Over ${trials} independent questions, what is the expected number answered correctly?`,
    options,
    answerIndex,
    explanation: `In a binomial setting, expected value is np = ${trials} x ${probability.toFixed(1)} = ${correct}.`,
    difficulty,
    category: 'calculation',
  };
}

function createDefinitionDraft(difficulty) {
  const definitions = {
    1: [
      ['What does range measure in a data set?', 'The spread between the smallest and largest values', 'The value in the middle position', 'The average of all values'],
      ['What is the mode of a data set?', 'The value that appears most often', 'The difference between quartiles', 'The number of possible outcomes'],
    ],
    2: [
      ['What is a permutation?', 'An arrangement where order matters', 'A selection where order does not matter', 'A graph showing frequencies'],
      ['What is a combination?', 'A selection where order does not matter', 'An arrangement where order matters', 'The sum of all outcomes'],
    ],
    3: [
      ['What does expected value describe?', 'The long-run average result of a random process', 'The most likely single outcome only', 'The middle score in a distribution'],
      ['What does interquartile range describe?', 'The spread of the middle 50% of the data', 'The spread of every data point from the mean', 'The difference between the mode and the median'],
    ],
    4: [
      ['What does standard deviation measure?', 'Typical distance from the mean', 'The count of all data values', 'The probability of the median'],
      ['What does a binomial distribution model?', 'A fixed number of independent success-failure trials', 'Any set of continuous measurements', 'A graph with equal class widths'],
    ],
  };

  const [prompt, correct, distractorA, distractorB] = definitions[difficulty][Math.floor(Math.random() * definitions[difficulty].length)];
  const { options, answerIndex } = buildOptions(correct, [distractorA, distractorB]);

  return {
    prompt,
    options,
    answerIndex,
    explanation: `${correct} is the best definition in this context.`,
    difficulty,
    category: 'definition',
  };
}

function createFormulaDraft(difficulty) {
  const formulas = {
    1: [
      ['Which formula gives probability of an event?', 'favourable outcomes / total outcomes', 'maximum - minimum', 'mean x number of terms'],
      ['Which formula gives the range?', 'maximum - minimum', 'Q3 - Q1', 'P(A)+P(B)'],
    ],
    2: [
      ['Which formula gives the number of combinations?', 'nCr = n! / (r!(n-r)!)', 'nPr = n! / (n-r)!', 'P(A and B) = P(A)+P(B)'],
      ['Which formula gives the number of permutations?', 'nPr = n! / (n-r)!', 'nCr = n! / (r!(n-r)!)', 'variance = SD'],
    ],
    3: [
      ['Which formula gives the interquartile range?', 'Q3 - Q1', 'Q1 - Q3', 'maximum - minimum'],
      ['Which formula gives P(A or B)?', 'P(A)+P(B)-P(A and B)', 'P(A)P(B)', 'P(A)/P(B)'],
    ],
    4: [
      ['Which formula gives expected value for a discrete random variable?', 'E(X) = Σ[x·P(x)]', 'E(X) = n!/(n-r)!', 'E(X) = Q3 - Q1'],
      ['Which formula relates variance and standard deviation?', 'variance = (standard deviation)^2', 'standard deviation = variance + mean', 'variance = mean / standard deviation'],
    ],
  };

  const [prompt, correct, distractorA, distractorB] = formulas[difficulty][Math.floor(Math.random() * formulas[difficulty].length)];
  const { options, answerIndex } = buildOptions(correct, [distractorA, distractorB]);

  return {
    prompt,
    options,
    answerIndex,
    explanation: `${correct} is the correct formula for this concept.`,
    difficulty,
    category: 'formula',
  };
}

function createWordProblemDraft(difficulty) {
  if (difficulty <= 2) {
    const players = 7 + Math.floor(Math.random() * 4);
    const positions = 2;
    const correct = String(players * (players - 1));
    const distractors = [String((players * (players - 1)) / 2), String(players + (players - 1))];
    const { options, answerIndex } = buildOptions(correct, distractors);

    return {
      prompt: `A school team needs to choose a captain and vice-captain from ${players} players. How many different leadership pairs are possible?`,
      options,
      answerIndex,
      explanation: `Order matters because captain and vice-captain are different roles, so use a permutation: ${players}P${positions} = ${correct}.`,
      difficulty,
      category: 'word-problem',
    };
  }

  if (difficulty === 3) {
    const zScore = [1.0, 1.5, -1.0][Math.floor(Math.random() * 3)];
    const percentileMap = {
      '1': '84th percentile',
      '1.5': '93rd percentile',
      '-1': '16th percentile',
    };
    const correct = percentileMap[String(zScore)];
    const distractors = correct === '84th percentile' ? ['50th percentile', '98th percentile'] : correct === '93rd percentile' ? ['84th percentile', '16th percentile'] : ['50th percentile', '7th percentile'];
    const { options, answerIndex } = buildOptions(correct, distractors);

    return {
      prompt: `A student writes a statistics test and earns a z-score of ${zScore}. This places the student at approximately which percentile?`,
      options,
      answerIndex,
      explanation: `A z-score of ${zScore} is approximately the ${correct} on the standard normal curve.`,
      difficulty,
      category: 'word-problem',
    };
  }

  const mean = 72 + Math.floor(Math.random() * 10);
  const standardDeviation = 5 + Math.floor(Math.random() * 4);
  const zScore = [1.0, 1.5, 2.0][Math.floor(Math.random() * 3)];
  const xValue = mean + zScore * standardDeviation;
  const correct = zScore === 1 ? '84th percentile' : zScore === 1.5 ? '93rd percentile' : '98th percentile';
  const distractors = zScore === 1 ? ['50th percentile', '93rd percentile'] : zScore === 1.5 ? ['84th percentile', '98th percentile'] : ['93rd percentile', '75th percentile'];
  const { options, answerIndex } = buildOptions(correct, distractors);

  return {
    prompt: `A scholarship test score of ${xValue} comes from a normal distribution with mean ${mean} and standard deviation ${standardDeviation}. About what percentile is that score?`,
    options,
    answerIndex,
    explanation: `First find z = (${xValue} - ${mean}) / ${standardDeviation} = ${zScore}. A z-score of ${zScore} is about the ${correct}.`,
    difficulty,
    category: 'word-problem',
  };
}

function factorial(value) {
  let total = 1;

  for (let current = 2; current <= value; current += 1) {
    total *= current;
  }

  return total;
}

export function generateQuestionDrafts(batchSize = 8, options = {}) {
  const categories = ['calculation', 'definition', 'formula', 'word-problem'];
  const difficultyLevels = normalizeDifficultyLevels(options.difficultyLevels);
  const drafts = [];

  for (let index = 0; index < batchSize; index += 1) {
    const difficulty = difficultyLevels[index % difficultyLevels.length];
    const category = categories[index % categories.length];

    if (category === 'calculation') {
      drafts.push(createCalculationDraft(difficulty));
      continue;
    }

    if (category === 'definition') {
      drafts.push(createDefinitionDraft(difficulty));
      continue;
    }

    if (category === 'word-problem') {
      drafts.push(createWordProblemDraft(difficulty));
      continue;
    }

    drafts.push(createFormulaDraft(difficulty));
  }

  return drafts;
}