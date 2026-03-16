import path from 'node:path';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

function serializeCsvValue(value) {
  const text = String(value ?? '');
  const escaped = text.replace(/"/g, '""');
  return `"${escaped}"`;
}

async function readJsonArray(filePath) {
  try {
    const fileText = await readFile(filePath, 'utf8');
    const parsed = JSON.parse(fileText);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeJsonArray(filePath, items) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(items, null, 2)}\n`, 'utf8');
}

function normalizeQuestion(question) {
  return {
    id: String(question.id),
    prompt: String(question.prompt),
    options: Array.isArray(question.options) ? question.options.map((option) => String(option)) : [],
    answerIndex: Number(question.answerIndex),
    explanation: String(question.explanation),
    difficulty: Number(question.difficulty),
    category: String(question.category),
  };
}

function normalizeDraft(draft) {
  return {
    ...normalizeQuestion(draft),
    createdAt: typeof draft.createdAt === 'string' ? draft.createdAt : new Date().toISOString(),
  };
}

function toDraftCsv(drafts) {
  const header = ['id', 'prompt', 'optionA', 'optionB', 'optionC', 'answerIndex', 'explanation', 'difficulty', 'category', 'createdAt'];
  const lines = drafts.map((draft) => {
    const options = [draft.options[0] ?? '', draft.options[1] ?? '', draft.options[2] ?? ''];
    return [
      draft.id,
      draft.prompt,
      options[0],
      options[1],
      options[2],
      draft.answerIndex,
      draft.explanation,
      draft.difficulty,
      draft.category,
      draft.createdAt,
    ]
      .map(serializeCsvValue)
      .join(',');
  });

  return `${header.join(',')}\n${lines.join('\n')}\n`;
}

export class QuestionDraftRepository {
  constructor(dataDirectory) {
    this.draftFilePath = path.join(dataDirectory, 'generated-question-drafts.json');
    this.customQuestionFilePath = path.join(dataDirectory, 'custom-questions.json');
  }

  async listDrafts() {
    const drafts = await readJsonArray(this.draftFilePath);
    return drafts.map(normalizeDraft);
  }

  async listApprovedQuestions() {
    const questions = await readJsonArray(this.customQuestionFilePath);
    return questions.map(normalizeQuestion);
  }

  async appendDrafts(drafts) {
    const existingDrafts = await this.listDrafts();
    const createdAt = new Date().toISOString();
    const stampedDrafts = drafts.map((draft, index) => ({
      ...normalizeQuestion({ ...draft, id: `draft-${Date.now()}-${index + 1}-${Math.floor(Math.random() * 1000)}` }),
      createdAt,
    }));

    const nextDrafts = [...existingDrafts, ...stampedDrafts];
    await writeJsonArray(this.draftFilePath, nextDrafts);
    return nextDrafts;
  }

  async replaceDrafts(drafts) {
    await writeJsonArray(this.draftFilePath, drafts.map(normalizeDraft));
    return this.listDrafts();
  }

  async rejectDrafts(draftIds) {
    const allDrafts = await this.listDrafts();
    const rejectedIds = new Set(draftIds);
    const remainingDrafts = allDrafts.filter((draft) => !rejectedIds.has(draft.id));
    await writeJsonArray(this.draftFilePath, remainingDrafts);
    return remainingDrafts;
  }

  async approveDrafts(draftIds) {
    const allDrafts = await this.listDrafts();
    const selectedIds = new Set(draftIds.length > 0 ? draftIds : allDrafts.map((draft) => draft.id));
    const selectedDrafts = allDrafts.filter((draft) => selectedIds.has(draft.id));
    const remainingDrafts = allDrafts.filter((draft) => !selectedIds.has(draft.id));
    const approvedQuestions = await this.listApprovedQuestions();
    const createdAt = Date.now();

    const newQuestions = selectedDrafts.map((draft, index) => ({
      ...normalizeQuestion(draft),
      id: `custom-${createdAt}-${approvedQuestions.length + index + 1}`,
    }));

    await writeJsonArray(this.customQuestionFilePath, [...approvedQuestions, ...newQuestions]);
    await writeJsonArray(this.draftFilePath, remainingDrafts);

    return {
      approvedQuestions: newQuestions,
      remainingDrafts,
    };
  }

  async exportDraftsJson() {
    return `${JSON.stringify(await this.listDrafts(), null, 2)}\n`;
  }

  async exportDraftsCsv() {
    return toDraftCsv(await this.listDrafts());
  }
}