import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdir, unlink } from 'node:fs/promises';

import express from 'express';
import multer from 'multer';

import { createQuestionStatsStore } from './storage/createQuestionStatsStore.js';
import { generateQuestionDrafts } from './questionGeneration/generateQuestionDrafts.js';
import { QuestionDraftRepository } from './questionGeneration/QuestionDraftRepository.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const port = Number(process.env.PORT ?? 3001);
const { storeFactory, storeType, storageFile } = createQuestionStatsStore();
const store = storeFactory(storageFile);
const uploadDirectory = path.join(__dirname, 'uploads', 'question-pdfs');
const questionDraftRepository = new QuestionDraftRepository(path.join(__dirname, 'data'));

function sanitizeFileNamePart(value) {
  return value.replace(/[^a-zA-Z0-9_-]/g, '-');
}

const upload = multer({
  storage: multer.diskStorage({
    destination: async (_request, _file, callback) => {
      try {
        await mkdir(uploadDirectory, { recursive: true });
        callback(null, uploadDirectory);
      } catch (error) {
        callback(error, uploadDirectory);
      }
    },
    filename: (request, file, callback) => {
      const questionId = typeof request.body?.questionId === 'string' ? sanitizeFileNamePart(request.body.questionId) : 'question';
      callback(null, `${questionId}-${Date.now()}.pdf`);
    },
  }),
  fileFilter: (_request, file, callback) => {
    const isPdf = file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf');
    callback(isPdf ? null : new Error('Only PDF uploads are allowed.'), isPdf);
  },
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
});

function isQuestionDefinition(value) {
  return Boolean(
    value &&
      typeof value.id === 'string' &&
      typeof value.prompt === 'string' &&
      typeof value.difficulty === 'number' &&
      typeof value.category === 'string',
  );
}

function getRequestedCount(request) {
  const rawCount = request.method === 'GET' ? request.query?.count : request.body?.count;
  const requestedCount = Number(rawCount ?? 8);
  return Number.isFinite(requestedCount) ? Math.max(4, Math.min(16, Math.floor(requestedCount))) : 8;
}

function getDraftIds(request) {
  const draftIds = request.body?.draftIds;

  if (!Array.isArray(draftIds)) {
    return [];
  }

  return draftIds.filter((draftId) => typeof draftId === 'string');
}

function getRequestedDifficultyLevels(request) {
  const rawLevels = request.method === 'GET' ? request.query?.difficultyLevels : request.body?.difficultyLevels;

  if (!Array.isArray(rawLevels)) {
    return [1, 2, 3, 4];
  }

  const levels = [...new Set(rawLevels.map((level) => Number(level)).filter((level) => level >= 1 && level <= 4))];
  return levels.length > 0 ? levels : [1, 2, 3, 4];
}

const app = express();

app.use(express.json({ limit: '1mb' }));
app.use('/review-pdfs', express.static(uploadDirectory));

app.get('/api/health', (_request, response) => {
  response.json({ ok: true, storeType, storageFile: path.relative(__dirname, storageFile) });
});

app.get('/api/question-stats', async (_request, response, next) => {
  try {
    response.json(await store.listQuestionStats());
  } catch (error) {
    next(error);
  }
});

app.get('/api/question-stats/flagged', async (_request, response, next) => {
  try {
    response.json({ flaggedQuestionIds: await store.getFlaggedQuestionIds() });
  } catch (error) {
    next(error);
  }
});

app.get('/api/question-stats/export', async (_request, response, next) => {
  try {
    response.setHeader('Content-Type', 'text/csv; charset=utf-8');
    response.setHeader('Content-Disposition', 'attachment; filename="data-game-question-stats.csv"');
    response.send(await store.exportCsv());
  } catch (error) {
    next(error);
  }
});

app.get('/api/questions/custom', async (_request, response, next) => {
  try {
    response.json(await questionDraftRepository.listApprovedQuestions());
  } catch (error) {
    next(error);
  }
});

app.get('/api/question-drafts', async (_request, response, next) => {
  try {
    response.json({ drafts: await questionDraftRepository.listDrafts() });
  } catch (error) {
    next(error);
  }
});

app.get('/api/question-drafts/export', async (request, response, next) => {
  try {
    const format = request.query?.format === 'csv' ? 'csv' : 'json';

    if (format === 'csv') {
      response.setHeader('Content-Type', 'text/csv; charset=utf-8');
      response.setHeader('Content-Disposition', 'attachment; filename="data-game-generated-drafts.csv"');
      response.send(await questionDraftRepository.exportDraftsCsv());
      return;
    }

    response.setHeader('Content-Type', 'application/json; charset=utf-8');
    response.setHeader('Content-Disposition', 'attachment; filename="data-game-generated-drafts.json"');
    response.send(await questionDraftRepository.exportDraftsJson());
  } catch (error) {
    next(error);
  }
});

app.post('/api/question-stats/sync', async (request, response, next) => {
  try {
    const questions = Array.isArray(request.body?.questions) ? request.body.questions : [];

    if (!questions.every(isQuestionDefinition)) {
      response.status(400).json({ error: 'Invalid question definitions.' });
      return;
    }

    const stats = await store.syncQuestions(questions);
    response.json({ stats, flaggedQuestionIds: stats.filter((record) => record.flagged).map((record) => record.id) });
  } catch (error) {
    next(error);
  }
});

app.post('/api/question-stats/used', async (request, response, next) => {
  try {
    const question = request.body?.question;

    if (!isQuestionDefinition(question)) {
      response.status(400).json({ error: 'Invalid question payload.' });
      return;
    }

    response.json({ record: await store.recordQuestionUsed(question) });
  } catch (error) {
    next(error);
  }
});

app.post('/api/question-stats/answer', async (request, response, next) => {
  try {
    const questionId = request.body?.questionId;
    const isCorrect = request.body?.isCorrect;

    if (typeof questionId !== 'string' || typeof isCorrect !== 'boolean') {
      response.status(400).json({ error: 'Invalid answer payload.' });
      return;
    }

    response.json({ record: await store.recordQuestionAnswered(questionId, isCorrect) });
  } catch (error) {
    next(error);
  }
});

app.post('/api/question-stats/flag', async (request, response, next) => {
  try {
    const questionId = request.body?.questionId;

    if (typeof questionId !== 'string') {
      response.status(400).json({ error: 'Invalid flag payload.' });
      return;
    }

    await store.flagQuestion(questionId);
    response.json({ flaggedQuestionIds: await store.getFlaggedQuestionIds() });
  } catch (error) {
    next(error);
  }
});

app.post('/api/question-stats/unflag', async (request, response, next) => {
  try {
    const questionId = request.body?.questionId;

    if (typeof questionId !== 'string') {
      response.status(400).json({ error: 'Invalid unflag payload.' });
      return;
    }

    await store.setQuestionFlag(questionId, false);
    response.json({ flaggedQuestionIds: await store.getFlaggedQuestionIds() });
  } catch (error) {
    next(error);
  }
});

app.post('/api/question-stats/reset-question', async (request, response, next) => {
  try {
    const questionId = request.body?.questionId;

    if (typeof questionId !== 'string') {
      response.status(400).json({ error: 'Invalid reset payload.' });
      return;
    }

    response.json({ record: await store.resetQuestionStats(questionId) });
  } catch (error) {
    next(error);
  }
});

app.post('/api/question-stats/reset-all', async (_request, response, next) => {
  try {
    response.json({ stats: await store.resetAllQuestionStats() });
  } catch (error) {
    next(error);
  }
});

app.post('/api/question-stats/upload-pdf', upload.single('pdf'), async (request, response, next) => {
  try {
    const questionId = request.body?.questionId;

    if (typeof questionId !== 'string') {
      response.status(400).json({ error: 'Invalid upload payload.' });
      return;
    }

    if (!request.file) {
      response.status(400).json({ error: 'A PDF file is required.' });
      return;
    }

    const existingRecord = (await store.listQuestionStats()).find((record) => record.id === questionId);

    if (existingRecord?.pdfStoredName) {
      try {
        await unlink(path.join(uploadDirectory, existingRecord.pdfStoredName));
      } catch {
      }
    }

    const uploadedAt = new Date().toISOString();
    const record = await store.setQuestionPdf(questionId, {
      pdfOriginalName: request.file.originalname,
      pdfStoredName: request.file.filename,
      pdfUploadedAt: uploadedAt,
    });

    response.json({
      record,
      pdfUrl: `/review-pdfs/${request.file.filename}`,
    });
  } catch (error) {
    if (request.file?.path) {
      try {
        await unlink(request.file.path);
      } catch {
      }
    }
    next(error);
  }
});

async function handleGenerateDrafts(request, response, next) {
  try {
    const count = getRequestedCount(request);
    const difficultyLevels = getRequestedDifficultyLevels(request);
    const drafts = await questionDraftRepository.appendDrafts(generateQuestionDrafts(count, { difficultyLevels }));

    response.json({ drafts });
  } catch (error) {
    next(error);
  }
}

async function handleApproveDrafts(request, response, next) {
  try {
    const { approvedQuestions, remainingDrafts } = await questionDraftRepository.approveDrafts(getDraftIds(request));
    await store.syncQuestions(approvedQuestions);
    response.json({ approvedQuestions, drafts: remainingDrafts });
  } catch (error) {
    next(error);
  }
}

async function handleRejectDrafts(request, response, next) {
  try {
    const drafts = await questionDraftRepository.rejectDrafts(getDraftIds(request));
    response.json({ drafts });
  } catch (error) {
    next(error);
  }
}

app.post('/api/question-drafts/generate', handleGenerateDrafts);
app.post('/api/question-drafts/approve', handleApproveDrafts);
app.post('/api/question-drafts/reject', handleRejectDrafts);
app.get('/api/question-stats/generate-drafts', handleGenerateDrafts);
app.post('/api/question-stats/generate-drafts', handleGenerateDrafts);

app.use((error, _request, response, _next) => {
  const message = error instanceof Error ? error.message : 'Unexpected server error.';
  response.status(500).json({ error: message });
});

app.listen(port, () => {
  console.log(`Question stats server listening on http://localhost:${port} using ${storeType} storage at ${storageFile}`);
});