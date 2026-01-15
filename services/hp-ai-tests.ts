import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  generateHPQuestionsWithAI, 
  generateFullHPTestWithAI,
  GeneratedHPQuestion,
  convertMultipleToHPQuestions,
} from '@/lib/hp-ai-generator';
import { HPQuestion, HP_SECTIONS } from '@/constants/hogskoleprovet';

const STORAGE_KEY = 'hp_ai_generated_tests';
const MAX_STORED_TESTS = 10;

export interface StoredAITest {
  id: string;
  name: string;
  createdAt: string;
  sections: {
    sectionCode: string;
    sectionName: string;
    questionCount: number;
  }[];
  totalQuestions: number;
  difficulty?: 'all' | 'easy' | 'medium' | 'hard';
  questions: GeneratedHPQuestion[];
  timesCompleted: number;
  bestScore?: number;
  lastAttemptAt?: string;
}

export interface AITestAttempt {
  testId: string;
  startedAt: string;
  completedAt?: string;
  answers: Record<string, string>;
  score?: number;
  correctAnswers?: number;
}

class HPAITestService {
  private cachedTests: StoredAITest[] | null = null;

  async getStoredTests(): Promise<StoredAITest[]> {
    if (this.cachedTests) {
      return this.cachedTests;
    }

    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        this.cachedTests = JSON.parse(data);
        return this.cachedTests || [];
      }
    } catch (error) {
      console.error('[HP AI Tests] Error loading stored tests:', error);
    }
    return [];
  }

  async saveTest(test: StoredAITest): Promise<void> {
    try {
      const tests = await this.getStoredTests();
      
      const existingIndex = tests.findIndex(t => t.id === test.id);
      if (existingIndex >= 0) {
        tests[existingIndex] = test;
      } else {
        tests.unshift(test);
        if (tests.length > MAX_STORED_TESTS) {
          tests.pop();
        }
      }

      this.cachedTests = tests;
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tests));
      console.log('[HP AI Tests] Test saved:', test.id);
    } catch (error) {
      console.error('[HP AI Tests] Error saving test:', error);
      throw error;
    }
  }

  async deleteTest(testId: string): Promise<void> {
    try {
      const tests = await this.getStoredTests();
      const filtered = tests.filter(t => t.id !== testId);
      this.cachedTests = filtered;
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      console.log('[HP AI Tests] Test deleted:', testId);
    } catch (error) {
      console.error('[HP AI Tests] Error deleting test:', error);
      throw error;
    }
  }

  async getTestById(testId: string): Promise<StoredAITest | null> {
    const tests = await this.getStoredTests();
    return tests.find(t => t.id === testId) || null;
  }

  async generateSectionTest(
    sectionCode: string,
    questionCount: number = 10,
    difficulty?: 'all' | 'easy' | 'medium' | 'hard'
  ): Promise<{ success: boolean; test?: StoredAITest; error?: string }> {
    console.log('[HP AI Tests] Generating section test:', { sectionCode, questionCount, difficulty });

    const result = await generateHPQuestionsWithAI({
      sectionCode,
      targetCount: questionCount,
      difficulty,
    });

    if (!result.success || result.questions.length === 0) {
      return {
        success: false,
        error: result.error || 'Kunde inte generera frågor',
      };
    }

    const section = HP_SECTIONS.find(s => s.code === sectionCode);
    const testId = `ai-section-${sectionCode}-${Date.now()}`;
    
    const test: StoredAITest = {
      id: testId,
      name: `${section?.fullName || sectionCode} - AI-genererat`,
      createdAt: new Date().toISOString(),
      sections: [{
        sectionCode,
        sectionName: section?.fullName || sectionCode,
        questionCount: result.questions.length,
      }],
      totalQuestions: result.questions.length,
      difficulty,
      questions: result.questions,
      timesCompleted: 0,
    };

    await this.saveTest(test);

    return {
      success: true,
      test,
    };
  }

  async generateFullTest(
    testName?: string,
    difficulty?: 'all' | 'easy' | 'medium' | 'hard',
    customSections?: string[]
  ): Promise<{ success: boolean; test?: StoredAITest; error?: string }> {
    console.log('[HP AI Tests] Generating full test:', { testName, difficulty, customSections });

    const result = await generateFullHPTestWithAI({
      testName,
      difficulty,
      customSections,
    });

    if (!result.success || result.totalQuestions === 0) {
      return {
        success: false,
        error: result.error || 'Kunde inte generera provet',
      };
    }

    const allQuestions: GeneratedHPQuestion[] = [];
    const sections: StoredAITest['sections'] = [];

    result.sections.forEach(section => {
      allQuestions.push(...section.questions);
      sections.push({
        sectionCode: section.sectionCode,
        sectionName: section.sectionName,
        questionCount: section.questions.length,
      });
    });

    const test: StoredAITest = {
      id: result.testId,
      name: result.testName,
      createdAt: new Date().toISOString(),
      sections,
      totalQuestions: allQuestions.length,
      difficulty,
      questions: allQuestions,
      timesCompleted: 0,
    };

    await this.saveTest(test);

    return {
      success: true,
      test,
    };
  }

  async updateTestStats(
    testId: string,
    score: number,
    correctAnswers: number
  ): Promise<void> {
    const test = await this.getTestById(testId);
    if (!test) return;

    test.timesCompleted++;
    test.lastAttemptAt = new Date().toISOString();
    
    if (!test.bestScore || score > test.bestScore) {
      test.bestScore = score;
    }

    await this.saveTest(test);
  }

  getQuestionsAsHPFormat(test: StoredAITest): HPQuestion[] {
    return convertMultipleToHPQuestions(test.questions);
  }

  async clearAllTests(): Promise<void> {
    this.cachedTests = [];
    await AsyncStorage.removeItem(STORAGE_KEY);
    console.log('[HP AI Tests] All tests cleared');
  }
}

export const hpAITestService = new HPAITestService();
