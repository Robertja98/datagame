import type { MathQuestion } from './questions';

export type QuestionStatsRecord = {
  id: string;
  prompt: string;
  difficulty: MathQuestion['difficulty'];
  category: MathQuestion['category'];
  usedCount: number;
  correctCount: number;
  incorrectCount: number;
  flagged: boolean;
  lastUsedAt: string;
  pdfOriginalName: string;
  pdfStoredName: string;
  pdfUploadedAt: string;
};

type QuestionSyncDefinition = Pick<MathQuestion, 'id' | 'prompt' | 'difficulty' | 'category'>;

async function requestJson<T>(input: string, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    throw new Error(`Tracker request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

function toQuestionDefinition(question: MathQuestion): QuestionSyncDefinition {
  return {
    id: question.id,
    prompt: question.prompt,
    difficulty: question.difficulty,
    category: question.category,
  };
}

export async function initializeQuestionTracker(questionBank: MathQuestion[]): Promise<string[]> {
  const response = await requestJson<{ flaggedQuestionIds: string[] }>('/api/question-stats/sync', {
    method: 'POST',
    body: JSON.stringify({ questions: questionBank.map(toQuestionDefinition) }),
  });

  return response.flaggedQuestionIds;
}

export async function fetchApprovedCustomQuestions(): Promise<MathQuestion[]> {
  return requestJson<MathQuestion[]>('/api/questions/custom');
}

export async function recordQuestionUsed(question: MathQuestion): Promise<void> {
  await requestJson('/api/question-stats/used', {
    method: 'POST',
    body: JSON.stringify({ question: toQuestionDefinition(question) }),
  });
}

export async function recordQuestionAnswered(question: MathQuestion, isCorrect: boolean): Promise<void> {
  await requestJson('/api/question-stats/answer', {
    method: 'POST',
    body: JSON.stringify({ questionId: question.id, isCorrect }),
  });
}

export async function flagQuestion(question: MathQuestion): Promise<string[]> {
  const response = await requestJson<{ flaggedQuestionIds: string[] }>('/api/question-stats/flag', {
    method: 'POST',
    body: JSON.stringify({ questionId: question.id }),
  });

  return response.flaggedQuestionIds;
}

export function downloadQuestionStatsCsv(): void {
  const link = document.createElement('a');
  link.href = '/api/question-stats/export';
  link.download = 'data-game-question-stats.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}