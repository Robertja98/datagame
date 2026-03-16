import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

import { QuestionStatsStore } from './QuestionStatsStore.js';
import { normalizeQuestionRecord, serializeRecords, sortRecords } from './questionStatsRecordUtils.js';

function toRecord(row) {
  return {
    id: row.id,
    prompt: row.prompt,
    difficulty: row.difficulty,
    category: row.category,
    usedCount: row.usedCount,
    correctCount: row.correctCount,
    incorrectCount: row.incorrectCount,
    flagged: Boolean(row.flagged),
    lastUsedAt: row.lastUsedAt,
    pdfOriginalName: row.pdfOriginalName ?? '',
    pdfStoredName: row.pdfStoredName ?? '',
    pdfUploadedAt: row.pdfUploadedAt ?? '',
  };
}

export class SqliteQuestionStatsStore extends QuestionStatsStore {
  constructor(filePath) {
    super();
    this.filePath = filePath;
    this.database = undefined;
    this.loaded = false;
  }

  async syncQuestions(questions) {
    await this.ensureLoaded();

    const statement = this.database.prepare(`
      INSERT INTO question_stats (id, prompt, difficulty, category, usedCount, correctCount, incorrectCount, flagged, lastUsedAt, pdfOriginalName, pdfStoredName, pdfUploadedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        prompt = excluded.prompt,
        difficulty = excluded.difficulty,
        category = excluded.category
    `);

    for (const question of questions) {
      const record = normalizeQuestionRecord(question);
      statement.run(
        record.id,
        record.prompt,
        record.difficulty,
        record.category,
        record.usedCount,
        record.correctCount,
        record.incorrectCount,
        Number(record.flagged),
        record.lastUsedAt,
        record.pdfOriginalName,
        record.pdfStoredName,
        record.pdfUploadedAt,
      );
    }

    return this.listQuestionStats();
  }

  async recordQuestionUsed(question) {
    await this.syncQuestions([question]);

    this.database.prepare(
      'UPDATE question_stats SET usedCount = usedCount + 1, lastUsedAt = ? WHERE id = ?',
    ).run(new Date().toISOString(), question.id);

    return this.getRecord(question.id);
  }

  async recordQuestionAnswered(questionId, isCorrect) {
    await this.ensureLoaded();

    this.database.prepare(
      `UPDATE question_stats SET ${isCorrect ? 'correctCount' : 'incorrectCount'} = ${isCorrect ? 'correctCount' : 'incorrectCount'} + 1 WHERE id = ?`,
    ).run(questionId);

    return this.getRecord(questionId);
  }

  async flagQuestion(questionId) {
    return this.setQuestionFlag(questionId, true);
  }

  async setQuestionFlag(questionId, flagged) {
    await this.ensureLoaded();
    this.database.prepare('UPDATE question_stats SET flagged = ? WHERE id = ?').run(Number(flagged), questionId);
    return this.getRecord(questionId);
  }

  async resetQuestionStats(questionId) {
    await this.ensureLoaded();
    this.database.prepare(
      'UPDATE question_stats SET usedCount = 0, correctCount = 0, incorrectCount = 0, lastUsedAt = ? WHERE id = ?',
    ).run('', questionId);
    return this.getRecord(questionId);
  }

  async resetAllQuestionStats() {
    await this.ensureLoaded();
    this.database.prepare(
      'UPDATE question_stats SET usedCount = 0, correctCount = 0, incorrectCount = 0, lastUsedAt = ?',
    ).run('');
    return this.listQuestionStats();
  }

  async setQuestionPdf(questionId, pdfInfo) {
    await this.ensureLoaded();
    this.database.prepare(
      'UPDATE question_stats SET pdfOriginalName = ?, pdfStoredName = ?, pdfUploadedAt = ? WHERE id = ?',
    ).run(pdfInfo.pdfOriginalName, pdfInfo.pdfStoredName, pdfInfo.pdfUploadedAt, questionId);
    return this.getRecord(questionId);
  }

  async listQuestionStats() {
    await this.ensureLoaded();
    const rows = this.database.prepare('SELECT * FROM question_stats').all();
    return sortRecords(rows.map(toRecord));
  }

  async getFlaggedQuestionIds() {
    await this.ensureLoaded();
    const rows = this.database.prepare('SELECT id FROM question_stats WHERE flagged = 1 ORDER BY id').all();
    return rows.map((row) => row.id);
  }

  async exportCsv() {
    return serializeRecords(await this.listQuestionStats());
  }

  async ensureLoaded() {
    if (this.loaded) {
      return;
    }

    await mkdir(path.dirname(this.filePath), { recursive: true });
    this.database = new DatabaseSync(this.filePath);
    this.database.exec(`
      CREATE TABLE IF NOT EXISTS question_stats (
        id TEXT PRIMARY KEY,
        prompt TEXT NOT NULL,
        difficulty INTEGER NOT NULL,
        category TEXT NOT NULL,
        usedCount INTEGER NOT NULL DEFAULT 0,
        correctCount INTEGER NOT NULL DEFAULT 0,
        incorrectCount INTEGER NOT NULL DEFAULT 0,
        flagged INTEGER NOT NULL DEFAULT 0,
        lastUsedAt TEXT NOT NULL DEFAULT '',
        pdfOriginalName TEXT NOT NULL DEFAULT '',
        pdfStoredName TEXT NOT NULL DEFAULT '',
        pdfUploadedAt TEXT NOT NULL DEFAULT ''
      )
    `);
    this.ensureColumn('pdfOriginalName', "TEXT NOT NULL DEFAULT ''");
    this.ensureColumn('pdfStoredName', "TEXT NOT NULL DEFAULT ''");
    this.ensureColumn('pdfUploadedAt', "TEXT NOT NULL DEFAULT ''");
    this.loaded = true;
  }

  ensureColumn(columnName, definition) {
    const existingColumns = this.database.prepare('PRAGMA table_info(question_stats)').all();

    if (existingColumns.some((column) => column.name === columnName)) {
      return;
    }

    this.database.exec(`ALTER TABLE question_stats ADD COLUMN ${columnName} ${definition}`);
  }

  getRecord(questionId) {
    const row = this.database.prepare('SELECT * FROM question_stats WHERE id = ?').get(questionId);

    if (!row) {
      throw new Error(`Unknown question id: ${questionId}`);
    }

    return toRecord(row);
  }
}