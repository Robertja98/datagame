export const CSV_HEADERS = ['id', 'prompt', 'difficulty', 'category', 'usedCount', 'correctCount', 'incorrectCount', 'flagged', 'lastUsedAt', 'pdfOriginalName', 'pdfStoredName', 'pdfUploadedAt'];

export function escapeCsv(value) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

export function sortRecords(records) {
  return [...records].sort((left, right) => left.id.localeCompare(right.id, undefined, { numeric: true }));
}

export function serializeRecords(records) {
  const rows = [CSV_HEADERS.map(escapeCsv).join(',')];

  for (const record of sortRecords(records)) {
    rows.push(
      [
        record.id,
        record.prompt,
        record.difficulty,
        record.category,
        record.usedCount,
        record.correctCount,
        record.incorrectCount,
        record.flagged,
        record.lastUsedAt,
        record.pdfOriginalName,
        record.pdfStoredName,
        record.pdfUploadedAt,
      ].map(escapeCsv).join(','),
    );
  }

  return rows.join('\n');
}

export function normalizeQuestionRecord(question) {
  return {
    id: question.id,
    prompt: question.prompt,
    difficulty: question.difficulty,
    category: question.category,
    usedCount: 0,
    correctCount: 0,
    incorrectCount: 0,
    flagged: false,
    lastUsedAt: '',
    pdfOriginalName: '',
    pdfStoredName: '',
    pdfUploadedAt: '',
  };
}