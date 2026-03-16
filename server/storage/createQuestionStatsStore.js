import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { CsvQuestionStatsStore } from './CsvQuestionStatsStore.js';
import { SqliteQuestionStatsStore } from './SqliteQuestionStatsStore.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDirectory = path.join(__dirname, '..', 'data');

export function createQuestionStatsStore() {
  const storeType = (process.env.DATA_GAME_STATS_STORE ?? 'csv').toLowerCase();

  if (storeType === 'sqlite') {
    return {
      storeType,
      storageFile: process.env.DATA_GAME_STATS_SQLITE_PATH ?? path.join(dataDirectory, 'question-stats.sqlite'),
      storeFactory: (storageFile) => new SqliteQuestionStatsStore(storageFile),
    };
  }

  return {
    storeType: 'csv',
    storageFile: process.env.DATA_GAME_STATS_CSV_PATH ?? path.join(dataDirectory, 'question-stats.csv'),
    storeFactory: (storageFile) => new CsvQuestionStatsStore(storageFile),
  };
}