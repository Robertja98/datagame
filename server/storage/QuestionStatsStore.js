export class QuestionStatsStore {
  async syncQuestions(_questions) {
    throw new Error('syncQuestions must be implemented by a concrete store.');
  }

  async recordQuestionUsed(_question) {
    throw new Error('recordQuestionUsed must be implemented by a concrete store.');
  }

  async recordQuestionAnswered(_questionId, _isCorrect) {
    throw new Error('recordQuestionAnswered must be implemented by a concrete store.');
  }

  async flagQuestion(_questionId) {
    throw new Error('flagQuestion must be implemented by a concrete store.');
  }

  async setQuestionFlag(_questionId, _flagged) {
    throw new Error('setQuestionFlag must be implemented by a concrete store.');
  }

  async resetQuestionStats(_questionId) {
    throw new Error('resetQuestionStats must be implemented by a concrete store.');
  }

  async resetAllQuestionStats() {
    throw new Error('resetAllQuestionStats must be implemented by a concrete store.');
  }

  async setQuestionPdf(_questionId, _pdfInfo) {
    throw new Error('setQuestionPdf must be implemented by a concrete store.');
  }

  async listQuestionStats() {
    throw new Error('listQuestionStats must be implemented by a concrete store.');
  }

  async getFlaggedQuestionIds() {
    throw new Error('getFlaggedQuestionIds must be implemented by a concrete store.');
  }

  async exportCsv() {
    throw new Error('exportCsv must be implemented by a concrete store.');
  }
}