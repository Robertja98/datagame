import './admin.css';
import type { QuestionStatsRecord } from './game/questionTracker';

type HealthResponse = {
  ok: boolean;
  storeType: string;
  storageFile: string;
};

type GeneratedQuestionDraft = {
  id: string;
  prompt: string;
  options: string[];
  answerIndex: number;
  explanation: string;
  difficulty: 1 | 2 | 3 | 4;
  category: 'calculation' | 'definition' | 'formula' | 'word-problem';
  createdAt: string;
};

type DashboardData = {
  health: HealthResponse;
  stats: QuestionStatsRecord[];
  drafts: GeneratedQuestionDraft[];
};

type DraftGenerationSettings = {
  count: number;
  difficultyLevels: Array<1 | 2 | 3 | 4>;
};

let generatedDrafts: GeneratedQuestionDraft[] = [];
let selectedDraftIds = new Set<string>();
let draftGenerationSettings: DraftGenerationSettings = {
  count: 12,
  difficultyLevels: [2, 3, 4],
};

async function requestJson<T>(input: string, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);

  if (!response.ok) {
    const responseText = await response.text();
    throw new Error(responseText ? `Request failed: ${response.status} ${responseText}` : `Request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

function shuffleOptions(items: string[]): string[] {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }

  return copy;
}

function buildDraftOptions(correctAnswer: string, distractors: string[]) {
  const options = shuffleOptions([correctAnswer, ...distractors]);
  return {
    options,
    answerIndex: options.indexOf(correctAnswer),
  };
}

function stampLocalDraft(draft: Omit<GeneratedQuestionDraft, 'id' | 'createdAt'>, index: number, createdAt: string): GeneratedQuestionDraft {
  return {
    ...draft,
    id: `local-draft-${Date.now()}-${index + 1}`,
    createdAt,
  };
}

function getSelectedDifficultyLevels(): Array<1 | 2 | 3 | 4> {
  return draftGenerationSettings.difficultyLevels.length > 0 ? draftGenerationSettings.difficultyLevels : [1, 2, 3, 4];
}

function buildLocalCalculationDraft(difficulty: 1 | 2 | 3 | 4): Omit<GeneratedQuestionDraft, 'id' | 'createdAt'> {
  if (difficulty === 1) {
    const favourable = 3 + Math.floor(Math.random() * 8);
    const total = favourable + 5 + Math.floor(Math.random() * 8);
    const correct = (favourable / total).toFixed(2);
    const { options, answerIndex } = buildDraftOptions(correct, [
      (favourable / (total + 1)).toFixed(2),
      ((favourable + 1) / total).toFixed(2),
    ]);

    return {
      prompt: `A class survey showed ${favourable} students out of ${total} prefer studying probability. What is the probability that a random student prefers probability?`,
      options,
      answerIndex,
      explanation: `Probability is favourable outcomes divided by total outcomes, so ${favourable}/${total} = ${correct}.`,
      difficulty,
      category: 'calculation',
    };
  }

  if (difficulty === 2) {
    const n = 6 + Math.floor(Math.random() * 4);
    const r = 2 + Math.floor(Math.random() * 2);
    const combination = factorial(n) / (factorial(r) * factorial(n - r));
    const { options, answerIndex } = buildDraftOptions(String(combination), [String(n * r), String(factorial(n) / factorial(n - r))]);

    return {
      prompt: `How many different committees of ${r} can be formed from ${n} students?`,
      options,
      answerIndex,
      explanation: `This is a combination because order does not matter, so ${n}C${r} = ${combination}.`,
      difficulty,
      category: 'calculation',
    };
  }

  if (difficulty === 3) {
    const variant = Math.floor(Math.random() * 3);

    if (variant === 0) {
      const q1 = 7 + Math.floor(Math.random() * 8);
      const q3 = q1 + 6 + Math.floor(Math.random() * 8);
      const correct = String(q3 - q1);
      const { options, answerIndex } = buildDraftOptions(correct, [String(q3 + q1), String(q3 - q1 + 3)]);

      return {
        prompt: `A data set has Q1 = ${q1} and Q3 = ${q3}. What is the interquartile range?`,
        options,
        answerIndex,
        explanation: `Interquartile range is Q3 - Q1, so ${q3} - ${q1} = ${correct}.`,
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
      const { options, answerIndex } = buildDraftOptions(correct, [
        ((xValue - mean) / (standardDeviation + 2)).toFixed(1).replace('.0', ''),
        (zScore + 0.5).toFixed(1).replace('.0', ''),
      ]);

      return {
        prompt: `A score of ${xValue} comes from a distribution with mean ${mean} and standard deviation ${standardDeviation}. What is the z-score?`,
        options,
        answerIndex,
        explanation: `Use z = (x - mean) / SD = (${xValue} - ${mean}) / ${standardDeviation} = ${correct}.`,
        difficulty,
        category: 'calculation',
      };
    }

    const mean = 64 + Math.floor(Math.random() * 12);
    const standardDeviation = 3 + Math.floor(Math.random() * 5);
    const zScore = [-1.5, -1, 1, 1.5, 2][Math.floor(Math.random() * 5)];
    const correct = String(mean + zScore * standardDeviation);
    const { options, answerIndex } = buildDraftOptions(correct, [String(mean - zScore * standardDeviation), String(mean + (zScore + 1) * standardDeviation)]);

    return {
      prompt: `A student has a z-score of ${zScore} in a distribution with mean ${mean} and standard deviation ${standardDeviation}. What is the original x-value?`,
      options,
      answerIndex,
      explanation: `Use x = mean + z(SD) = ${mean} + (${zScore})(${standardDeviation}) = ${correct}.`,
      difficulty,
      category: 'calculation',
    };
  }

  const variant = Math.floor(Math.random() * 4);

  if (variant === 0) {
    const probabilityA = 0.2 + Math.floor(Math.random() * 4) * 0.1;
    const probabilityB = 0.3 + Math.floor(Math.random() * 4) * 0.1;
    const intersection = Math.max(0.1, Math.min(probabilityA, probabilityB) - 0.1);
    const correct = (probabilityA + probabilityB - intersection).toFixed(2);
    const { options, answerIndex } = buildDraftOptions(correct, [
      (probabilityA + probabilityB).toFixed(2),
      (probabilityA * probabilityB).toFixed(2),
    ]);

    return {
      prompt: `If P(A) = ${probabilityA.toFixed(1)}, P(B) = ${probabilityB.toFixed(1)}, and P(A and B) = ${intersection.toFixed(1)}, what is P(A or B)?`,
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
    const { options, answerIndex } = buildDraftOptions(correct, [
      ((Number(xValue) - mean) / (standardDeviation + 1)).toFixed(1).replace('.0', ''),
      (zScore + 0.5).toFixed(1).replace('.0', ''),
    ]);

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
    const { options, answerIndex } = buildDraftOptions(correct, [String(mean - zScore * standardDeviation), String(mean + (zScore + 0.5) * standardDeviation)]);

    return {
      prompt: `A manufacturing process has mean output ${mean} grams and standard deviation ${standardDeviation} grams. What x-value corresponds to z = ${zScore}?`,
      options,
      answerIndex,
      explanation: `Use x = mean + z(SD) = ${mean} + (${zScore})(${standardDeviation}) = ${correct}.`,
      difficulty,
      category: 'calculation',
    };
  }

  const probability = 0.5 + Math.floor(Math.random() * 4) * 0.1;
  const trials = 8 + Math.floor(Math.random() * 5);
  const correct = String((probability * trials).toFixed(1).replace('.0', ''));
  const { options, answerIndex } = buildDraftOptions(correct, [String(trials - probability * trials), probability.toFixed(1)]);

  return {
    prompt: `A Grade 12 student estimates they answer a multiple-choice question correctly with probability ${probability.toFixed(1)}. Over ${trials} independent questions, what is the expected number answered correctly?`,
    options,
    answerIndex,
    explanation: `In a binomial setting, expected value is np = ${trials} x ${probability.toFixed(1)} = ${correct}.`,
    difficulty,
    category: 'calculation',
  };
}

function buildLocalDefinitionDraft(difficulty: 1 | 2 | 3 | 4): Omit<GeneratedQuestionDraft, 'id' | 'createdAt'> {
  const definitions: Record<1 | 2 | 3 | 4, [string, string, string, string][]> = {
    1: [
      ['What is the mode of a data set?', 'The value that appears most often', 'The average of the values', 'The middle value only'],
      ['What does the range measure?', 'The spread between the smallest and largest values', 'The number of categories in a graph', 'The average distance from the median'],
    ],
    2: [
      ['What is a permutation?', 'An arrangement where order matters', 'A selection where order does not matter', 'A graph that shows cumulative totals'],
      ['What is a combination?', 'A selection where order does not matter', 'An arrangement where order matters', 'The total number of data points'],
    ],
    3: [
      ['What does expected value represent?', 'The long-run average outcome of a random process', 'The highest possible score in a distribution', 'The same value as the mode in every case'],
      ['What does interquartile range describe?', 'The spread of the middle 50% of the data', 'The gap between the mean and the mode', 'The total spread of the entire data set'],
    ],
    4: [
      ['What does standard deviation measure?', 'The typical distance values are from the mean', 'The number of values above the median', 'The exact probability of one outcome'],
      ['What is a binomial distribution?', 'A model for a fixed number of independent success-failure trials', 'A chart with equal category widths', 'Any distribution with two modes'],
    ],
  };

  const [prompt, correct, distractorA, distractorB] = definitions[difficulty][Math.floor(Math.random() * definitions[difficulty].length)];
  const { options, answerIndex } = buildDraftOptions(correct, [distractorA, distractorB]);

  return {
    prompt,
    options,
    answerIndex,
    explanation: `${correct} is the correct definition for this term.`,
    difficulty,
    category: 'definition',
  };
}

function buildLocalFormulaDraft(difficulty: 1 | 2 | 3 | 4): Omit<GeneratedQuestionDraft, 'id' | 'createdAt'> {
  const formulas: Record<1 | 2 | 3 | 4, [string, string, string, string][]> = {
    1: [
      ['Which formula gives basic probability?', 'favourable outcomes / total outcomes', 'Q3 - Q1', 'maximum + minimum'],
      ['Which formula gives the range?', 'maximum - minimum', 'Q1 - Q3', 'favourable outcomes / total outcomes'],
    ],
    2: [
      ['Which formula gives combinations?', 'nCr = n! / (r!(n-r)!)', 'nPr = n! / (n-r)!', 'E(X) = Σ[x·P(x)]'],
      ['Which formula gives permutations?', 'nPr = n! / (n-r)!', 'nCr = n! / (r!(n-r)!)', 'variance = SD'],
    ],
    3: [
      ['Which formula gives the interquartile range?', 'Q3 - Q1', 'Q1 - Q3', 'maximum - minimum'],
      ['Which formula gives P(A or B)?', 'P(A)+P(B)-P(A and B)', 'P(A)P(B)', 'P(A)/P(B)'],
    ],
    4: [
      ['Which formula gives expected value for a discrete random variable?', 'E(X) = Σ[x·P(x)]', 'nCr = n! / (r!(n-r)!)', 'Q3 - Q1'],
      ['Which formula links variance and standard deviation?', 'variance = (standard deviation)^2', 'standard deviation = variance + mean', 'variance = mean / standard deviation'],
    ],
  };

  const [prompt, correct, distractorA, distractorB] = formulas[difficulty][Math.floor(Math.random() * formulas[difficulty].length)];
  const { options, answerIndex } = buildDraftOptions(correct, [distractorA, distractorB]);

  return {
    prompt,
    options,
    answerIndex,
    explanation: `${correct} is the correct formula for this question.`,
    difficulty,
    category: 'formula',
  };
}

function buildLocalWordProblemDraft(difficulty: 1 | 2 | 3 | 4): Omit<GeneratedQuestionDraft, 'id' | 'createdAt'> {
  if (difficulty <= 2) {
    const players = 7 + Math.floor(Math.random() * 4);
    const correct = String(players * (players - 1));
    const { options, answerIndex } = buildDraftOptions(correct, [String((players * (players - 1)) / 2), String(players + players - 1)]);

    return {
      prompt: `A school team needs a captain and vice-captain from ${players} players. How many different leadership pairs are possible?`,
      options,
      answerIndex,
      explanation: `Order matters because the positions are different, so use a permutation: ${players}P2 = ${correct}.`,
      difficulty,
      category: 'word-problem',
    };
  }

  if (difficulty === 3) {
    const zScore = [1.0, 1.5, -1.0][Math.floor(Math.random() * 3)];
    const correct = zScore === 1 ? '84th percentile' : zScore === 1.5 ? '93rd percentile' : '16th percentile';
    const distractors = zScore === 1 ? ['50th percentile', '98th percentile'] : zScore === 1.5 ? ['84th percentile', '16th percentile'] : ['7th percentile', '50th percentile'];
    const { options, answerIndex } = buildDraftOptions(correct, distractors);

    return {
      prompt: `A student earns a z-score of ${zScore} on a statistics test. Approximately what percentile is that score?`,
      options,
      answerIndex,
      explanation: `A z-score of ${zScore} corresponds to about the ${correct} on the standard normal distribution.`,
      difficulty,
      category: 'word-problem',
    };
  }

  const mean = 74 + Math.floor(Math.random() * 10);
  const standardDeviation = 5 + Math.floor(Math.random() * 4);
  const zScore = [1.0, 1.5, 2.0][Math.floor(Math.random() * 3)];
  const xValue = mean + zScore * standardDeviation;
  const correct = zScore === 1 ? '84th percentile' : zScore === 1.5 ? '93rd percentile' : '98th percentile';
  const distractors = zScore === 1 ? ['50th percentile', '93rd percentile'] : zScore === 1.5 ? ['84th percentile', '98th percentile'] : ['93rd percentile', '75th percentile'];
  const { options, answerIndex } = buildDraftOptions(correct, distractors);

  return {
    prompt: `A scholarship exam score of ${xValue} comes from a normal distribution with mean ${mean} and standard deviation ${standardDeviation}. About what percentile is the score?`,
    options,
    answerIndex,
    explanation: `Compute z = (${xValue} - ${mean}) / ${standardDeviation} = ${zScore}. That is about the ${correct}.`,
    difficulty,
    category: 'word-problem',
  };
}

function factorial(value: number): number {
  let total = 1;

  for (let current = 2; current <= value; current += 1) {
    total *= current;
  }

  return total;
}

function generateDraftsLocally(count = 8, difficultyLevels: Array<1 | 2 | 3 | 4> = [1, 2, 3, 4]): GeneratedQuestionDraft[] {
  const categories: GeneratedQuestionDraft['category'][] = ['calculation', 'definition', 'formula', 'word-problem'];
  const drafts: GeneratedQuestionDraft[] = [];
  const createdAt = new Date().toISOString();

  for (let index = 0; index < count; index += 1) {
    const difficulty = difficultyLevels[index % difficultyLevels.length];
    const category = categories[index % categories.length];

    if (category === 'calculation') {
      drafts.push(stampLocalDraft(buildLocalCalculationDraft(difficulty), index, createdAt));
      continue;
    }

    if (category === 'definition') {
      drafts.push(stampLocalDraft(buildLocalDefinitionDraft(difficulty), index, createdAt));
      continue;
    }

    if (category === 'word-problem') {
      drafts.push(stampLocalDraft(buildLocalWordProblemDraft(difficulty), index, createdAt));
      continue;
    }

    drafts.push(stampLocalDraft(buildLocalFormulaDraft(difficulty), index, createdAt));
  }

  return drafts;
}

function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function getPdfUrl(record: QuestionStatsRecord): string {
  return `/review-pdfs/${record.pdfStoredName}`;
}

async function loadDashboardData(): Promise<DashboardData> {
  const [health, stats, draftResponse] = await Promise.all([
    requestJson<HealthResponse>('/api/health'),
    requestJson<QuestionStatsRecord[]>('/api/question-stats'),
    requestJson<{ drafts: GeneratedQuestionDraft[] }>('/api/question-drafts').catch(() => ({ drafts: generatedDrafts })),
  ]);

  generatedDrafts = draftResponse.drafts;
  selectedDraftIds = new Set([...selectedDraftIds].filter((draftId) => generatedDrafts.some((draft) => draft.id === draftId)));

  return { health, stats, drafts: generatedDrafts };
}

function renderDashboard(health: HealthResponse, stats: QuestionStatsRecord[], drafts: GeneratedQuestionDraft[], statusMessage = ''): string {
  const totalUsed = stats.reduce((sum, record) => sum + record.usedCount, 0);
  const totalCorrect = stats.reduce((sum, record) => sum + record.correctCount, 0);
  const totalIncorrect = stats.reduce((sum, record) => sum + record.incorrectCount, 0);
  const totalAnswered = totalCorrect + totalIncorrect;
  const flaggedCount = stats.filter((record) => record.flagged).length;
  const approvedCustomCount = stats.filter((record) => record.id.startsWith('custom-')).length;
  const hardestMisses = [...stats]
    .sort((left, right) => right.incorrectCount - left.incorrectCount || right.usedCount - left.usedCount)
    .slice(0, 8);

  return `
    <main class="shell">
      <section class="hero">
        <div>
          <p class="eyebrow">Question Review Dashboard</p>
          <h1>Track weak questions before they get into the real bank.</h1>
          <p class="intro">Generate drafts, approve strong ones into the live gameplay bank, and export the queue if you want to review it outside the game.</p>
        </div>
        <div class="hero-card">
          <div class="hero-label">Active Store</div>
          <div class="hero-value">${health.storeType.toUpperCase()}</div>
          <div class="hero-meta">${health.storageFile}</div>
          <div class="generation-controls">
            <label class="generation-field">
              <span>Draft count</span>
              <select class="generation-select" data-generation-setting="count">
                ${[8, 12, 16].map((value) => `<option value="${value}" ${draftGenerationSettings.count === value ? 'selected' : ''}>${value}</option>`).join('')}
              </select>
            </label>
            <div class="generation-field">
              <span>Difficulty mix</span>
              <div class="generation-checkboxes">
                ${([1, 2, 3, 4] as const).map((level) => `
                  <label class="generation-checkbox-label">
                    <input type="checkbox" class="generation-checkbox" data-difficulty-level="${level}" ${draftGenerationSettings.difficultyLevels.includes(level) ? 'checked' : ''} />
                    <span>L${level}</span>
                  </label>
                `).join('')}
              </div>
            </div>
          </div>
          <a class="export-link" href="/api/question-stats/export">Download CSV Export</a>
          <a class="export-link" href="/dungeon-master.html">Open Dungeon Master Console</a>
          <button class="secondary-action" data-action="generate-drafts">Generate New Questions</button>
          <button class="secondary-action" data-action="reset-all">Reset All Counters</button>
        </div>
      </section>

      ${statusMessage ? `<section class="status-banner">${statusMessage}</section>` : ''}

      <section class="metrics">
        <article class="metric-card"><span>Questions tracked</span><strong>${stats.length}</strong></article>
        <article class="metric-card"><span>Total shown</span><strong>${totalUsed}</strong></article>
        <article class="metric-card"><span>Accuracy</span><strong>${totalAnswered === 0 ? '0%' : formatPercent(totalCorrect / totalAnswered)}</strong></article>
        <article class="metric-card flagged"><span>Flagged</span><strong>${flaggedCount}</strong></article>
        <article class="metric-card"><span>Draft queue</span><strong>${drafts.length}</strong></article>
        <article class="metric-card"><span>Approved custom</span><strong>${approvedCustomCount}</strong></article>
      </section>

      <section class="panel generated-panel">
        <div class="panel-header draft-toolbar-header">
          <div>
            <h2>Generated Draft Questions</h2>
            <p>Approve selected drafts to move them into the live question bank. Rejected drafts are removed from the queue.</p>
          </div>
          <div class="draft-toolbar">
            <button class="secondary-action" data-action="approve-selected" ${selectedDraftIds.size === 0 ? 'disabled' : ''}>Approve Selected</button>
            <button class="secondary-action" data-action="reject-selected" ${selectedDraftIds.size === 0 ? 'disabled' : ''}>Reject Selected</button>
            <button class="secondary-action" data-action="approve-all" ${drafts.length === 0 ? 'disabled' : ''}>Approve All</button>
            <a class="export-link draft-export-link" href="/api/question-drafts/export?format=json">Export Drafts JSON</a>
            <a class="export-link draft-export-link" href="/api/question-drafts/export?format=csv">Export Drafts CSV</a>
          </div>
        </div>
        ${drafts.length > 0 ? `
          <div class="list">
            ${drafts
              .map(
                (draft, index) => `
                  <article class="list-item generated-item">
                    <div>
                      <div class="pill-row">
                        <span class="pill">Draft ${index + 1}</span>
                        <span class="pill">${draft.id}</span>
                        <span class="pill">${draft.category}</span>
                        <span class="pill">L${draft.difficulty}</span>
                        <span class="pill">${new Date(draft.createdAt).toLocaleString()}</span>
                      </div>
                      <h3>${draft.prompt}</h3>
                    </div>
                    <div class="draft-options">
                      ${draft.options
                        .map((option, optionIndex) => `<div class="draft-option ${optionIndex === draft.answerIndex ? 'draft-option-correct' : ''}">${option}</div>`)
                        .join('')}
                    </div>
                    <div class="pdf-meta">
                      <span>Answer: ${draft.options[draft.answerIndex]}</span>
                      <span>${draft.explanation}</span>
                    </div>
                    <div class="action-row draft-action-row">
                      <label class="draft-select-label">
                        <input class="draft-checkbox" type="checkbox" data-draft-id="${draft.id}" ${selectedDraftIds.has(draft.id) ? 'checked' : ''} />
                        <span>Select draft</span>
                      </label>
                      <button data-action="approve-draft" data-draft-id="${draft.id}">Approve</button>
                      <button data-action="reject-draft" data-draft-id="${draft.id}">Reject</button>
                    </div>
                  </article>
                `,
              )
              .join('')}
          </div>
        ` : '<p class="empty-state">No drafts are waiting. Generate a batch, then approve the ones worth adding to gameplay.</p>'}
      </section>

      <section class="grid">
        <section class="panel">
          <div class="panel-header">
            <h2>Most Missed Questions</h2>
            <p>Use this to spot prompts that are unclear, too hard, or badly phrased.</p>
          </div>
          <div class="list">
            ${hardestMisses
              .map(
                (record) => `
                  <article class="list-item">
                    <div>
                      <div class="pill-row">
                        <span class="pill">${record.id}</span>
                        <span class="pill">${record.category}</span>
                        <span class="pill">L${record.difficulty}</span>
                        ${record.flagged ? '<span class="pill pill-flagged">flagged</span>' : ''}
                        ${record.pdfStoredName ? '<span class="pill pill-pdf">pdf attached</span>' : ''}
                      </div>
                      <h3>${record.prompt}</h3>
                    </div>
                    <div class="list-metrics">
                      <span>Used ${record.usedCount}</span>
                      <span>Wrong ${record.incorrectCount}</span>
                      <span>Right ${record.correctCount}</span>
                    </div>
                    <div class="action-row">
                      ${record.flagged ? `<button data-action="unflag" data-question-id="${record.id}">Unflag</button>` : ''}
                      <button data-action="reset-question" data-question-id="${record.id}">Reset Counts</button>
                      <button data-action="open-upload" data-question-id="${record.id}">Upload PDF</button>
                      <input class="upload-input" type="file" accept="application/pdf,.pdf" data-question-id="${record.id}" />
                    </div>
                    <div class="pdf-meta">
                      ${record.pdfStoredName ? `<a class="pdf-link" href="${getPdfUrl(record)}" target="_blank" rel="noreferrer">${record.pdfOriginalName}</a>` : '<span>No PDF uploaded yet</span>'}
                      ${record.pdfUploadedAt ? `<span>Uploaded ${new Date(record.pdfUploadedAt).toLocaleString()}</span>` : ''}
                    </div>
                  </article>
                `,
              )
              .join('')}
          </div>
        </section>

        <section class="panel">
          <div class="panel-header">
            <h2>All Questions</h2>
            <p>Every question tracked by the backend store, including approved custom questions added from the draft queue.</p>
          </div>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Prompt</th>
                  <th>Type</th>
                  <th>Level</th>
                  <th>Used</th>
                  <th>Right</th>
                  <th>Wrong</th>
                  <th>Flagged</th>
                  <th>PDF</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${stats
                  .map(
                    (record) => `
                      <tr>
                        <td>${record.id}</td>
                        <td>${record.prompt}</td>
                        <td>${record.category}</td>
                        <td>${record.difficulty}</td>
                        <td>${record.usedCount}</td>
                        <td>${record.correctCount}</td>
                        <td>${record.incorrectCount}</td>
                        <td>${record.flagged ? 'Yes' : 'No'}</td>
                        <td>
                          ${record.pdfStoredName ? `<a class="pdf-link" href="${getPdfUrl(record)}" target="_blank" rel="noreferrer">${record.pdfOriginalName}</a>` : 'None'}
                        </td>
                        <td>
                          <div class="table-actions">
                            ${record.flagged ? `<button data-action="unflag" data-question-id="${record.id}">Unflag</button>` : ''}
                            <button data-action="reset-question" data-question-id="${record.id}">Reset</button>
                            <button data-action="open-upload" data-question-id="${record.id}">Upload PDF</button>
                            <input class="upload-input" type="file" accept="application/pdf,.pdf" data-question-id="${record.id}" />
                          </div>
                        </td>
                      </tr>
                    `,
                  )
                  .join('')}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </main>
  `;
}

async function uploadQuestionPdf(questionId: string, file: File): Promise<string> {
  const formData = new FormData();
  formData.append('questionId', questionId);
  formData.append('pdf', file);

  const response = await fetch('/api/question-stats/upload-pdf', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.status}`);
  }

  return `PDF uploaded for ${questionId}.`;
}

async function generateDrafts(): Promise<string> {
  const difficultyLevels = getSelectedDifficultyLevels();

  try {
    const response = await requestJson<{ drafts: GeneratedQuestionDraft[] }>('/api/question-drafts/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ count: draftGenerationSettings.count, difficultyLevels }),
    });

    generatedDrafts = response.drafts;
    selectedDraftIds.clear();
    return `Draft queue now contains ${generatedDrafts.length} generated questions using levels ${difficultyLevels.join(', ')}.`;
  } catch (error) {
    const message = error instanceof Error ? error.message : '';

    if (message.includes('404')) {
      generatedDrafts = generateDraftsLocally(draftGenerationSettings.count, difficultyLevels);
      selectedDraftIds.clear();
      return `Generated ${generatedDrafts.length} draft questions locally because the running backend does not have the draft endpoint yet. Restart the server to enable shared backend generation.`;
    }

    throw error;
  }
}

async function approveDrafts(draftIds: string[]): Promise<string> {
  const response = await requestJson<{ approvedQuestions: { id: string }[]; drafts: GeneratedQuestionDraft[] }>('/api/question-drafts/approve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ draftIds }),
  });

  generatedDrafts = response.drafts;
  selectedDraftIds.clear();
  return `Approved ${response.approvedQuestions.length} draft question${response.approvedQuestions.length === 1 ? '' : 's'} into the live game bank.`;
}

async function rejectDrafts(draftIds: string[]): Promise<string> {
  const response = await requestJson<{ drafts: GeneratedQuestionDraft[] }>('/api/question-drafts/reject', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ draftIds }),
  });

  generatedDrafts = response.drafts;
  draftIds.forEach((draftId) => selectedDraftIds.delete(draftId));
  return `Rejected ${draftIds.length} draft question${draftIds.length === 1 ? '' : 's'}.`;
}

async function mutateDashboard(action: string, itemId?: string): Promise<string> {
  if (action === 'unflag' && itemId) {
    await requestJson('/api/question-stats/unflag', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionId: itemId }),
    });
    return `Question ${itemId} was unflagged.`;
  }

  if (action === 'reset-question' && itemId) {
    await requestJson('/api/question-stats/reset-question', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionId: itemId }),
    });
    return `Counters for ${itemId} were reset.`;
  }

  if (action === 'reset-all') {
    const confirmed = window.confirm('Reset counters for every tracked question? This keeps the questions but clears usage and answer totals.');

    if (!confirmed) {
      return 'Reset cancelled.';
    }

    await requestJson('/api/question-stats/reset-all', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return 'All question counters were reset.';
  }

  if (action === 'generate-drafts') {
    return generateDrafts();
  }

  if (action === 'approve-draft' && itemId) {
    return approveDrafts([itemId]);
  }

  if (action === 'reject-draft' && itemId) {
    return rejectDrafts([itemId]);
  }

  if (action === 'approve-selected') {
    if (selectedDraftIds.size === 0) {
      return 'No drafts selected.';
    }

    return approveDrafts([...selectedDraftIds]);
  }

  if (action === 'reject-selected') {
    if (selectedDraftIds.size === 0) {
      return 'No drafts selected.';
    }

    return rejectDrafts([...selectedDraftIds]);
  }

  if (action === 'approve-all') {
    if (generatedDrafts.length === 0) {
      return 'No drafts available to approve.';
    }

    return approveDrafts(generatedDrafts.map((draft) => draft.id));
  }

  return '';
}

async function renderInto(app: HTMLDivElement, statusMessage = ''): Promise<void> {
  const { health, stats, drafts } = await loadDashboardData();
  app.innerHTML = renderDashboard(health, stats, drafts, statusMessage);
}

async function bootstrap(): Promise<void> {
  const app = document.querySelector<HTMLDivElement>('#app');

  if (!app) {
    return;
  }

  app.innerHTML = '<main class="shell"><section class="hero"><h1>Loading question review dashboard...</h1></section></main>';

  try {
    await renderInto(app);

    app.addEventListener('click', async (event) => {
      const target = event.target;

      if (!(target instanceof HTMLButtonElement)) {
        return;
      }

      const action = target.dataset.action;
      const itemId = target.dataset.questionId ?? target.dataset.draftId;

      if (!action) {
        return;
      }

      if (action === 'open-upload' && itemId) {
        const input = app.querySelector<HTMLInputElement>(`.upload-input[data-question-id="${itemId}"]`);
        input?.click();
        return;
      }

      target.disabled = true;

      try {
        const statusMessage = await mutateDashboard(action, itemId);
        await renderInto(app, statusMessage);
      } catch (error) {
        await renderInto(app, error instanceof Error ? error.message : 'Dashboard action failed.');
      }
    });

    app.addEventListener('change', async (event) => {
      const target = event.target;

      if (!(target instanceof HTMLInputElement) && !(target instanceof HTMLSelectElement)) {
        return;
      }

      if (target instanceof HTMLInputElement && target.classList.contains('draft-checkbox')) {
        const draftId = target.dataset.draftId;

        if (!draftId) {
          return;
        }

        if (target.checked) {
          selectedDraftIds.add(draftId);
        } else {
          selectedDraftIds.delete(draftId);
        }

        await renderInto(app);
        return;
      }

      if (target instanceof HTMLInputElement && target.classList.contains('generation-checkbox')) {
        const difficultyLevel = Number(target.dataset.difficultyLevel) as 1 | 2 | 3 | 4;

        if (target.checked) {
          draftGenerationSettings = {
            ...draftGenerationSettings,
            difficultyLevels: [...new Set([...draftGenerationSettings.difficultyLevels, difficultyLevel])].sort() as Array<1 | 2 | 3 | 4>,
          };
        } else {
          const nextLevels = draftGenerationSettings.difficultyLevels.filter((level) => level !== difficultyLevel);
          draftGenerationSettings = {
            ...draftGenerationSettings,
            difficultyLevels: nextLevels.length > 0 ? nextLevels : [difficultyLevel],
          };
        }

        await renderInto(app);
        return;
      }

      if (target instanceof HTMLSelectElement && target.classList.contains('generation-select')) {
        draftGenerationSettings = {
          ...draftGenerationSettings,
          count: Number(target.value) || 12,
        };

        return;
      }

      if (!(target instanceof HTMLInputElement) || !target.classList.contains('upload-input')) {
        return;
      }

      const questionId = target.dataset.questionId;
      const file = target.files?.[0];

      if (!questionId || !file) {
        return;
      }

      try {
        const statusMessage = await uploadQuestionPdf(questionId, file);
        await renderInto(app, statusMessage);
      } catch (error) {
        await renderInto(app, error instanceof Error ? error.message : 'PDF upload failed.');
      }
    });
  } catch (error) {
    app.innerHTML = `
      <main class="shell">
        <section class="hero error-state">
          <div>
            <p class="eyebrow">Dashboard unavailable</p>
            <h1>The review page could not reach the tracker backend.</h1>
            <p class="intro">${error instanceof Error ? error.message : 'Unknown error'}</p>
          </div>
        </section>
      </main>
    `;
  }
}

void bootstrap();