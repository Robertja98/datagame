import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { QuestionStatsStore } from './QuestionStatsStore.js';
import { normalizeQuestionRecord, serializeRecords, sortRecords } from './questionStatsRecordUtils.js';

function parseCsvLine(line) {
  const values = [];
  let current = '';
  let insideQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    const nextCharacter = line[index + 1];

    if (character === '"') {
      if (insideQuotes && nextCharacter === '"') {
        current += '"';
        index += 1;
      } else {
        insideQuotes = !insideQuotes;
      }
      continue;
    }

    if (character === ',' && !insideQuotes) {
      values.push(current);
      current = '';
      continue;
    }

    current += character;
  }

  values.push(current);
  return values;
}

export class CsvQuestionStatsStore extends QuestionStatsStore {
  constructor(filePath) {
    super();
    this.filePath = filePath;
    this.records = new Map();
    this.loaded = false;
  }

  async syncQuestions(questions) {
    await this.ensureLoaded();

    for (const question of questions) {
      this.upsertQuestion(question);
    }

    await this.persist();
    return this.listQuestionStats();
  }

  async recordQuestionUsed(question) {
    await this.ensureLoaded();
    const record = this.upsertQuestion(question);

    record.usedCount += 1;
    record.lastUsedAt = new Date().toISOString();
    await this.persist();

    return record;
  }

  async recordQuestionAnswered(questionId, isCorrect) {
    await this.ensureLoaded();
    const record = this.records.get(questionId);

    if (!record) {
      throw new Error(`Unknown question id: ${questionId}`);
    }

    if (isCorrect) {
      record.correctCount += 1;
    } else {
      record.incorrectCount += 1;
    }

    await this.persist();
    return record;
  }

  async flagQuestion(questionId) {
    return this.setQuestionFlag(questionId, true);
  }

  async setQuestionFlag(questionId, flagged) {
    await this.ensureLoaded();
    const record = this.records.get(questionId);

    if (!record) {
      throw new Error(`Unknown question id: ${questionId}`);
    }

    record.flagged = flagged;
    await this.persist();
    return record;
  }

  async resetQuestionStats(questionId) {
    await this.ensureLoaded();
    const record = this.records.get(questionId);

    if (!record) {
      throw new Error(`Unknown question id: ${questionId}`);
    }

    record.usedCount = 0;
    record.correctCount = 0;
    record.incorrectCount = 0;
    record.lastUsedAt = '';
    await this.persist();
    return record;
  }

  async resetAllQuestionStats() {
    await this.ensureLoaded();

    for (const record of this.records.values()) {
      record.usedCount = 0;
      record.correctCount = 0;
      record.incorrectCount = 0;
      record.lastUsedAt = '';
    }

    await this.persist();
    return this.listQuestionStats();
  }

  async setQuestionPdf(questionId, pdfInfo) {
    await this.ensureLoaded();
    const record = this.records.get(questionId);

    if (!record) {
      throw new Error(`Unknown question id: ${questionId}`);
    }

    record.pdfOriginalName = pdfInfo.pdfOriginalName;
    record.pdfStoredName = pdfInfo.pdfStoredName;
    record.pdfUploadedAt = pdfInfo.pdfUploadedAt;
    await this.persist();
    return record;
  }

  async listQuestionStats() {
    await this.ensureLoaded();
    return sortRecords(this.records.values());
  }

  async getFlaggedQuestionIds() {
    const records = await this.listQuestionStats();
    return records.filter((record) => record.flagged).map((record) => record.id);
  }

  async exportCsv() {
    const records = await this.listQuestionStats();
    return serializeRecords(records);
  }

  async ensureLoaded() {
    if (this.loaded) {
      return;
    }

    await mkdir(path.dirname(this.filePath), { recursive: true });

    try {
      const existing = await readFile(this.filePath, 'utf8');
      const lines = existing.split(/\r?\n/).filter((line) => line.trim().length > 0);

      for (const line of lines.slice(1)) {
        const [id, prompt, difficulty, category, usedCount, correctCount, incorrectCount, flagged, lastUsedAt, pdfOriginalName = '', pdfStoredName = '', pdfUploadedAt = ''] = parseCsvLine(line);
        this.records.set(id, {
          id,
          prompt,
          difficulty: Number(difficulty),
          category,
          usedCount: Number(usedCount),
          correctCount: Number(correctCount),
          incorrectCount: Number(incorrectCount),
          flagged: flagged === 'true',
          lastUsedAt,
          pdfOriginalName,
          pdfStoredName,
          pdfUploadedAt,
        });
      }
    } catch {
      await this.persist();
    }

    this.loaded = true;
  }

  upsertQuestion(question) {
    const existing = this.records.get(question.id);

    if (existing) {
      existing.prompt = question.prompt;
      existing.difficulty = question.difficulty;
      existing.category = question.category;
      return existing;
    }

    const record = normalizeQuestionRecord(question);
    this.records.set(question.id, record);
    return record;
  }

  async persist() {
    const records = sortRecords(this.records.values());
    await writeFile(this.filePath, serializeRecords(records), 'utf8');
  }
}