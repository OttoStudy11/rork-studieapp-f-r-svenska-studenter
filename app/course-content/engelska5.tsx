import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Modal, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { ArrowLeft, BookOpen, CheckCircle, Circle, Edit3, X as CloseIcon, Award, TrendingUp, Sparkles, Lightbulb, Target } from 'lucide-react-native';
import { FadeInView, SlideInView } from '@/components/Animations';
import { useAuth } from '@/contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Module {
  id: number;
  title: string;
  description: string;
  emoji: string;
  completed?: boolean;
  sections: {
    title: string;
    content: string;
    keyPoints: string[];
  }[];
  examples: string[];
  reflectionQuestions: string[];
}

interface CourseProgress {
  progress: number;
  targetGrade: string;
  completedModules: number[];
}

const modulesData: Module[] = [
  {
    id: 1,
    title: 'Communication and Interaction',
    description: 'Develop your speaking and listening skills in English',
    emoji: '💬',
    sections: [
      {
        title: 'Everyday Conversations',
        content: 'Effective communication in English starts with mastering everyday conversations. Learn to express yourself clearly in various social situations.',
        keyPoints: [
          'Greetings and introductions',
          'Small talk and social interactions',
          'Asking for and giving directions',
          'Making plans and arrangements',
          'Expressing opinions and preferences',
          'Active listening and turn-taking'
        ]
      },
      {
        title: 'Formal Communication',
        content: 'Professional and formal contexts require different communication strategies. Learn to adapt your language to different situations.',
        keyPoints: [
          'Email writing and professional correspondence',
          'Telephone conversations and video calls',
          'Presentations and public speaking',
          'Job interviews and applications',
          'Formal requests and complaints',
          'Politeness strategies and register'
        ]
      },
      {
        title: 'Listening Comprehension',
        content: 'Understanding spoken English in various accents and contexts is crucial for effective communication.',
        keyPoints: [
          'Understanding different English accents',
          'Listening for main ideas and details',
          'Inferring meaning from context',
          'Note-taking while listening',
          'Understanding idioms and colloquialisms',
          'Dealing with unclear or fast speech'
        ]
      }
    ],
    examples: [
      'Role-play common situations like ordering food or shopping',
      'Watch English movies and TV series with subtitles',
      'Practice conversations with language partners',
      'Listen to English podcasts and audiobooks'
    ],
    reflectionQuestions: [
      'How do communication styles differ between your native language and English?',
      'What strategies help you when you don\'t understand something?',
      'How can you improve your pronunciation and fluency?',
      'Why is cultural awareness important in communication?'
    ]
  },
  {
    id: 2,
    title: 'Reading and Text Analysis',
    description: 'Improve your reading comprehension and analytical skills',
    emoji: '📖',
    sections: [
      {
        title: 'Reading Strategies',
        content: 'Effective reading involves more than just understanding words. Learn strategies to comprehend and analyze texts efficiently.',
        keyPoints: [
          'Skimming and scanning techniques',
          'Identifying main ideas and supporting details',
          'Understanding text structure and organization',
          'Building vocabulary in context',
          'Making predictions and inferences',
          'Critical reading and questioning'
        ]
      },
      {
        title: 'Text Types and Genres',
        content: 'Different types of texts have different purposes and characteristics. Recognize and understand various genres.',
        keyPoints: [
          'Fiction: novels, short stories, poetry',
          'Non-fiction: articles, essays, biographies',
          'Digital texts: blogs, social media, websites',
          'Academic texts: research papers, reports',
          'Media texts: news articles, advertisements',
          'Genre conventions and features'
        ]
      },
      {
        title: 'Literary Analysis',
        content: 'Analyzing literature helps you understand deeper meanings and appreciate the author\'s craft.',
        keyPoints: [
          'Plot, setting, and character analysis',
          'Themes and symbolism',
          'Point of view and narrative techniques',
          'Literary devices: metaphor, imagery, irony',
          'Historical and cultural context',
          'Author\'s purpose and message'
        ]
      }
    ],
    examples: [
      'Read English newspapers and magazines daily',
      'Analyze song lyrics for meaning and literary devices',
      'Compare different versions of the same news story',
      'Read graded readers suited to your level'
    ],
    reflectionQuestions: [
      'What reading strategies work best for you?',
      'How do you deal with unknown words while reading?',
      'What makes a text engaging or difficult?',
      'How can reading improve other English skills?'
    ]
  },
  {
    id: 3,
    title: 'Writing Skills',
    description: 'Master different types of writing in English',
    emoji: '✍️',
    sections: [
      {
        title: 'Writing Process',
        content: 'Good writing follows a process from planning to final editing. Learn to structure your writing effectively.',
        keyPoints: [
          'Brainstorming and planning ideas',
          'Organizing content with outlines',
          'Writing clear topic sentences',
          'Developing paragraphs with examples',
          'Drafting and revising',
          'Editing for grammar and style'
        ]
      },
      {
        title: 'Text Types',
        content: 'Different purposes require different types of writing. Master various writing formats.',
        keyPoints: [
          'Narrative writing: personal stories',
          'Descriptive writing: people, places, events',
          'Expository writing: explaining and informing',
          'Argumentative writing: persuading readers',
          'Creative writing: imagination and style',
          'Academic writing: essays and reports'
        ]
      },
      {
        title: 'Language and Style',
        content: 'Effective writing uses appropriate language and engages the reader.',
        keyPoints: [
          'Vocabulary choice and variety',
          'Sentence structure and complexity',
          'Cohesion and linking words',
          'Formal vs. informal language',
          'Tone and voice',
          'Avoiding common errors'
        ]
      }
    ],
    examples: [
      'Write journal entries about daily experiences',
      'Compose emails to pen pals or language partners',
      'Create blog posts on topics you\'re interested in',
      'Practice writing different types of texts'
    ],
    reflectionQuestions: [
      'What types of writing do you find most challenging?',
      'How can you make your writing more engaging?',
      'What\'s the difference between speaking and writing?',
      'How does feedback improve your writing?'
    ]
  },
  {
    id: 4,
    title: 'Grammar and Language Structure',
    description: 'Understand and apply English grammar rules',
    emoji: '📝',
    sections: [
      {
        title: 'Verb Tenses',
        content: 'English verb tenses express time and aspect. Master their forms and uses.',
        keyPoints: [
          'Present simple, continuous, and perfect',
          'Past simple, continuous, and perfect',
          'Future forms: will, going to, present continuous',
          'Time expressions and adverbs',
          'Tense consistency in narratives',
          'Common tense mistakes to avoid'
        ]
      },
      {
        title: 'Sentence Structure',
        content: 'Understanding sentence patterns helps you construct clear and correct sentences.',
        keyPoints: [
          'Subject-verb-object word order',
          'Questions and negatives',
          'Complex sentences with clauses',
          'Relative clauses: who, which, that',
          'Conditionals: if-clauses',
          'Passive voice construction'
        ]
      },
      {
        title: 'Common Grammar Points',
        content: 'Certain grammar areas are particularly important for clear communication.',
        keyPoints: [
          'Articles: a, an, the',
          'Prepositions of time and place',
          'Modal verbs: can, must, should',
          'Reported speech',
          'Adjectives and adverbs',
          'Pronouns and possessives'
        ]
      }
    ],
    examples: [
      'Do grammar exercises and quizzes online',
      'Keep a grammar notebook with examples',
      'Practice using new structures in sentences',
      'Correct your own texts and learn from mistakes'
    ],
    reflectionQuestions: [
      'Which grammar areas do you find most difficult?',
      'How important is perfect grammar in communication?',
      'What strategies help you remember grammar rules?',
      'How can you practice grammar in real contexts?'
    ]
  },
  {
    id: 5,
    title: 'Culture and Society',
    description: 'Explore English-speaking cultures and societies',
    emoji: '🌍',
    sections: [
      {
        title: 'Cultural Awareness',
        content: 'Understanding culture is essential for effective communication and language learning.',
        keyPoints: [
          'British and American culture differences',
          'Social norms and etiquette',
          'Holidays and traditions',
          'Pop culture: music, film, literature',
          'Cultural values and beliefs',
          'Avoiding stereotypes and misconceptions'
        ]
      },
      {
        title: 'Contemporary Issues',
        content: 'Discussing current topics helps you understand English-speaking societies.',
        keyPoints: [
          'Education systems in English-speaking countries',
          'Work culture and employment',
          'Social media and technology',
          'Environmental issues',
          'Diversity and multiculturalism',
          'Global English and World Englishes'
        ]
      },
      {
        title: 'Cross-cultural Communication',
        content: 'Navigating cultural differences is key to successful international communication.',
        keyPoints: [
          'Direct vs. indirect communication styles',
          'Non-verbal communication and body language',
          'Humor and sarcasm across cultures',
          'Taboo topics and sensitive issues',
          'Cultural misunderstandings and how to avoid them',
          'Intercultural competence development'
        ]
      }
    ],
    examples: [
      'Watch documentaries about English-speaking countries',
      'Follow English news sources and current events',
      'Compare cultural practices with your own country',
      'Connect with people from different English-speaking cultures'
    ],
    reflectionQuestions: [
      'How does culture influence language use?',
      'What surprises you about English-speaking cultures?',
      'How can cultural knowledge improve your English?',
      'What role does English play as a global language?'
    ]
  }
];

export default function Engelska5() {
  const { theme, isDark } = useTheme();
  const { user } = useAuth();
  const [expandedModule, setExpandedModule] = React.useState<number | null>(null);
  const [courseProgress, setCourseProgress] = useState<CourseProgress>({
    progress: 0,
    targetGrade: '',
    completedModules: [],
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editProgress, setEditProgress] = useState<string>('0');
  const [editTargetGrade, setEditTargetGrade] = useState<string>('');
  const [modules, setModules] = useState<Module[]>(modulesData);

  const storageKey = `@engelska5_progress_${user?.id}`;

  useEffect(() => {
    loadProgress();
  }, [user?.id]);

  const loadProgress = async () => {
    if (!user?.id) return;
    
    try {
      const stored = await AsyncStorage.getItem(storageKey);
      if (stored) {
        const progress = JSON.parse(stored);
        setCourseProgress(progress);
        setEditProgress(progress.progress.toString());
        setEditTargetGrade(progress.targetGrade);
        
        const updatedModules = modulesData.map(module => ({
          ...module,
          completed: progress.completedModules.includes(module.id),
        }));
        setModules(updatedModules);
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  const saveProgress = async (progress: CourseProgress) => {
    if (!user?.id) return;
    
    try {
      await AsyncStorage.setItem(storageKey, JSON.stringify(progress));
      setCourseProgress(progress);
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const toggleModuleCompletion = (moduleId: number) => {
    const updatedModules = modules.map(m => 
      m.id === moduleId ? { ...m, completed: !m.completed } : m
    );
    setModules(updatedModules);

    const completedIds = updatedModules.filter(m => m.completed).map(m => m.id);
    const autoProgress = Math.round((completedIds.length / modulesData.length) * 100);
    
    const newProgress = {
      ...courseProgress,
      completedModules: completedIds,
      progress: autoProgress,
    };
    
    saveProgress(newProgress);
    setEditProgress(autoProgress.toString());
  };

  const handleSaveManualProgress = async () => {
    try {
      const progressValue = parseInt(editProgress, 10);
      if (isNaN(progressValue) || progressValue < 0 || progressValue > 100) {
        Alert.alert('Fel', 'Progress måste vara ett tal mellan 0 och 100');
        return;
      }

      const newProgress = {
        ...courseProgress,
        progress: progressValue,
        targetGrade: editTargetGrade,
      };
      
      await saveProgress(newProgress);
      Alert.alert('Framgång! ✅', 'Kursinformation har uppdaterats');
      setShowEditModal(false);
    } catch (error) {
      console.error('Error saving progress:', error);
      Alert.alert('Fel', 'Ett oväntat fel inträffade');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />
      
      <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
        <TouchableOpacity style={[styles.backButton, { backgroundColor: theme.colors.card }]} onPress={() => router.back()}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <SlideInView direction="up" delay={100}>
          <View>
            <LinearGradient colors={['#10B981', '#059669']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroCard}>
              <View style={styles.heroContent}>
                <Text style={styles.heroIcon}>🇬🇧</Text>
                <Text style={styles.heroTitle}>Engelska 5</Text>
                <Text style={styles.heroDescription}>Kommunikation, läsförståelse och kultur</Text>
              </View>

              <View style={styles.progressSection}>
                <View style={styles.progressInfo}>
                  <Text style={styles.progressLabel}>Kursframsteg</Text>
                  <Text style={styles.progressPercent}>{courseProgress.progress}%</Text>
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${courseProgress.progress}%` }]} />
                </View>
                <Text style={styles.progressText}>{courseProgress.completedModules.length} av {modulesData.length} moduler slutförda</Text>
              </View>

              <View style={styles.quickStats}>
                <View style={styles.quickStatItem}>
                  <TrendingUp size={16} color="rgba(255, 255, 255, 0.9)" />
                  <Text style={styles.quickStatText}>{courseProgress.progress}% klar</Text>
                </View>
                {courseProgress.completedModules.length > 0 && (
                  <View style={styles.quickStatItem}>
                    <CheckCircle size={16} color="#FCD34D" />
                    <Text style={styles.quickStatText}>{courseProgress.completedModules.length} slutförda</Text>
                  </View>
                )}
                {courseProgress.targetGrade && (
                  <View style={styles.quickStatItem}>
                    <Award size={16} color="#FCD34D" />
                    <Text style={styles.quickStatText}>Mål: {courseProgress.targetGrade}</Text>
                  </View>
                )}
              </View>
            </LinearGradient>
            
            <TouchableOpacity style={[styles.editButton, { backgroundColor: 'rgba(255, 255, 255, 0.9)' }]} onPress={() => setShowEditModal(true)}>
              <Edit3 size={20} color="#10B981" />
            </TouchableOpacity>
          </View>
        </SlideInView>

        <FadeInView delay={150}>
          <TouchableOpacity style={[styles.flashcardsButton, { backgroundColor: theme.colors.card }]} onPress={() => router.push('/flashcards/ENGENG05')} activeOpacity={0.7}>
            <Sparkles size={24} color="#10B981" />
            <Text style={[styles.flashcardsButtonText, { color: theme.colors.text }]}>Öva med Flashcards</Text>
          </TouchableOpacity>
        </FadeInView>

        <FadeInView delay={200}>
          <View style={[styles.introSection, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.introTitle, { color: theme.colors.text }]}>Om kursen</Text>
            <Text style={[styles.introText, { color: theme.colors.textSecondary }]}>
              Engelska 5 ger dig grundläggande färdigheter i att kommunicera på engelska, både muntligt och skriftligt. 
              Kursen fokuserar på att utveckla din läsförståelse, skrivande och förståelse för engelskspråkig kultur.
            </Text>
          </View>
        </FadeInView>

        <View style={styles.modulesSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Kursinnehåll</Text>
          
          {modules.map((module, index) => (
            <FadeInView key={module.id} delay={300 + index * 100}>
              <TouchableOpacity
                style={[
                  styles.moduleCard,
                  { backgroundColor: theme.colors.card },
                  module.completed && styles.moduleCardCompleted
                ]}
                onPress={() => setExpandedModule(expandedModule === module.id ? null : module.id)}
                activeOpacity={0.7}
              >
                <View style={styles.moduleHeader}>
                  <TouchableOpacity
                    style={styles.checkboxContainer}
                    onPress={(e) => {
                      e.stopPropagation();
                      toggleModuleCompletion(module.id);
                    }}
                  >
                    {module.completed ? (
                      <CheckCircle size={24} color="#10B981" />
                    ) : (
                      <Circle size={24} color={theme.colors.textMuted} />
                    )}
                  </TouchableOpacity>
                  <Text style={styles.moduleEmoji}>{module.emoji}</Text>
                  <View style={styles.moduleTitleContainer}>
                    <Text style={[
                      styles.moduleTitle,
                      { color: theme.colors.text },
                      module.completed && { color: '#10B981' }
                    ]}>
                      Module {module.id}: {module.title}
                    </Text>
                    <Text style={[styles.moduleDescription, { color: theme.colors.textSecondary }]}>
                      {module.description}
                    </Text>
                  </View>
                </View>

                {expandedModule === module.id && (
                  <View style={styles.moduleContent}>
                    {module.sections.map((section, sectionIndex) => (
                      <View key={sectionIndex} style={styles.sectionCard}>
                        <View style={styles.sectionHeader}>
                          <BookOpen size={20} color="#10B981" />
                          <Text style={[styles.sectionTitle2, { color: theme.colors.text }]}>
                            {section.title}
                          </Text>
                        </View>
                        <Text style={[styles.sectionContent, { color: theme.colors.textSecondary }]}>
                          {section.content}
                        </Text>
                        
                        <View style={styles.keyPointsContainer}>
                          <Text style={[styles.keyPointsTitle, { color: theme.colors.text }]}>
                            Key Points:
                          </Text>
                          {section.keyPoints.map((point, pointIndex) => (
                            <View key={pointIndex} style={styles.keyPointItem}>
                              <View style={[styles.bullet, { backgroundColor: '#10B981' }]} />
                              <Text style={[styles.keyPointText, { color: theme.colors.textSecondary }]}>
                                {point}
                              </Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    ))}

                    <View style={[styles.examplesSection, { backgroundColor: theme.colors.surface }]}>
                      <View style={styles.examplesHeader}>
                        <Target size={20} color="#22C55E" />
                        <Text style={[styles.examplesTitle, { color: theme.colors.text }]}>
                          Practice Activities
                        </Text>
                      </View>
                      {module.examples.map((example, exampleIndex) => (
                        <View key={exampleIndex} style={styles.exampleItem}>
                          <CheckCircle size={16} color="#22C55E" />
                          <Text style={[styles.exampleText, { color: theme.colors.textSecondary }]}>
                            {example}
                          </Text>
                        </View>
                      ))}
                    </View>

                    <View style={[styles.reflectionSection, { backgroundColor: theme.colors.surface }]}>
                      <View style={styles.reflectionHeader}>
                        <Lightbulb size={20} color="#F59E0B" />
                        <Text style={[styles.reflectionTitle, { color: theme.colors.text }]}>
                          Reflection Questions
                        </Text>
                      </View>
                      {module.reflectionQuestions.map((question, questionIndex) => (
                        <View key={questionIndex} style={styles.questionItem}>
                          <Text style={[styles.questionNumber, { color: '#F59E0B' }]}>
                            {questionIndex + 1}.
                          </Text>
                          <Text style={[styles.questionText, { color: theme.colors.textSecondary }]}>
                            {question}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            </FadeInView>
          ))}
        </View>
      </ScrollView>

      <Modal visible={showEditModal} animationType="slide" transparent={true} onRequestClose={() => setShowEditModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Redigera kursinformation</Text>
                <TouchableOpacity style={[styles.modalCloseButton, { backgroundColor: theme.colors.borderLight }]} onPress={() => setShowEditModal(false)}>
                  <CloseIcon size={20} color={theme.colors.textMuted} />
                </TouchableOpacity>
              </View>

              <View style={styles.modalBody}>
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Framsteg (%)</Text>
                  <TextInput style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.text, borderColor: theme.colors.border }]} value={editProgress} onChangeText={setEditProgress} keyboardType="numeric" placeholder="0-100" placeholderTextColor={theme.colors.textMuted} />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Målbetyg</Text>
                  <View style={styles.gradeButtons}>
                    {['A', 'B', 'C', 'D', 'E', 'F'].map((grade) => (
                      <TouchableOpacity key={grade} style={[styles.gradeButton, { borderColor: theme.colors.border }, editTargetGrade === grade && { backgroundColor: '#10B981', borderColor: '#10B981' }]} onPress={() => setEditTargetGrade(grade === editTargetGrade ? '' : grade)}>
                        <Text style={[styles.gradeButtonText, { color: theme.colors.text }, editTargetGrade === grade && { color: 'white' }]}>{grade}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              <View style={styles.modalFooter}>
                <TouchableOpacity style={[styles.modalButton, styles.modalCancelButton, { borderColor: theme.colors.border }]} onPress={() => setShowEditModal(false)}>
                  <Text style={[styles.modalButtonText, { color: theme.colors.text }]}>Avbryt</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalButton, styles.modalSaveButton, { backgroundColor: '#10B981' }]} onPress={handleSaveManualProgress}>
                  <Text style={[styles.modalButtonText, { color: 'white' }]}>Spara</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 16 },
  backButton: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  scrollContent: { paddingBottom: 100 },
  heroCard: { marginHorizontal: 24, borderRadius: 24, padding: 32, marginBottom: 24 },
  heroContent: { alignItems: 'center' },
  heroIcon: { fontSize: 64, marginBottom: 16 },
  heroTitle: { fontSize: 28, fontWeight: '700' as const, color: 'white', textAlign: 'center', marginBottom: 8 },
  heroDescription: { fontSize: 16, color: 'rgba(255, 255, 255, 0.9)', textAlign: 'center', lineHeight: 24 },
  introSection: { marginHorizontal: 24, marginBottom: 24, borderRadius: 20, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  introTitle: { fontSize: 20, fontWeight: '700' as const, marginBottom: 12 },
  introText: { fontSize: 16, lineHeight: 24 },
  modulesSection: { paddingHorizontal: 24, marginBottom: 24 },
  sectionTitle: { fontSize: 22, fontWeight: '700' as const, marginBottom: 16 },
  progressSection: { backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 12, padding: 16, marginTop: 16 },
  progressInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  progressLabel: { fontSize: 14, color: 'rgba(255, 255, 255, 0.8)', fontWeight: '500' as const },
  progressPercent: { fontSize: 18, color: 'white', fontWeight: 'bold' as const },
  progressBar: { height: 8, backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 4, marginBottom: 8 },
  progressFill: { height: '100%', backgroundColor: 'white', borderRadius: 4 },
  progressText: { fontSize: 12, color: 'rgba(255, 255, 255, 0.8)' },
  quickStats: { flexDirection: 'row', gap: 16, marginTop: 12 },
  quickStatItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  quickStatText: { fontSize: 13, color: 'rgba(255, 255, 255, 0.9)', fontWeight: '600' as const },
  editButton: { position: 'absolute', top: 20, right: 44, width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { width: '90%', maxWidth: 400 },
  modalContent: { borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 10 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(0, 0, 0, 0.1)' },
  modalTitle: { fontSize: 20, fontWeight: 'bold' as const, flex: 1 },
  modalCloseButton: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  modalBody: { padding: 20 },
  inputGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 16, fontWeight: '600' as const, marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16 },
  gradeButtons: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  gradeButton: { flex: 1, minWidth: 50, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  gradeButtonText: { fontSize: 16, fontWeight: 'bold' as const },
  modalFooter: { flexDirection: 'row', gap: 12, padding: 20, borderTopWidth: 1, borderTopColor: 'rgba(0, 0, 0, 0.1)' },
  modalButton: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  modalCancelButton: { borderWidth: 2 },
  modalSaveButton: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  modalButtonText: { fontSize: 16, fontWeight: '600' as const },
  flashcardsButton: { marginHorizontal: 24, marginBottom: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 24, paddingVertical: 16, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  flashcardsButtonText: { fontSize: 16, fontWeight: '700' as const },
  emptyState: { alignItems: 'center', padding: 40, borderRadius: 20 },
  emptyTitle: { fontSize: 18, fontWeight: '700' as const, marginTop: 16, marginBottom: 8 },
  emptyText: { fontSize: 14, textAlign: 'center' },
  moduleCard: { borderRadius: 20, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  moduleHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  checkboxContainer: { padding: 4 },
  moduleCardCompleted: { borderColor: '#10B981', borderWidth: 2, borderLeftWidth: 4 },
  moduleEmoji: { fontSize: 40 },
  moduleTitleContainer: { flex: 1 },
  moduleTitle: { fontSize: 18, fontWeight: '700' as const, marginBottom: 4 },
  moduleDescription: { fontSize: 14, lineHeight: 20 },
  moduleContent: { marginTop: 20, gap: 16 },
  sectionCard: { paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(16, 185, 129, 0.1)' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  sectionTitle2: { fontSize: 16, fontWeight: '600' as const },
  sectionContent: { fontSize: 15, lineHeight: 22, marginBottom: 16 },
  keyPointsContainer: { marginTop: 8 },
  keyPointsTitle: { fontSize: 15, fontWeight: '600' as const, marginBottom: 8 },
  keyPointItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  bullet: { width: 6, height: 6, borderRadius: 3, marginTop: 8 },
  keyPointText: { fontSize: 14, lineHeight: 20, flex: 1 },
  examplesSection: { borderRadius: 12, padding: 16, marginTop: 8 },
  examplesHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  examplesTitle: { fontSize: 16, fontWeight: '600' as const },
  exampleItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  exampleText: { fontSize: 14, lineHeight: 20, flex: 1 },
  reflectionSection: { borderRadius: 12, padding: 16, marginTop: 8 },
  reflectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  reflectionTitle: { fontSize: 16, fontWeight: '600' as const },
  questionItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 12 },
  questionNumber: { fontSize: 15, fontWeight: '700' as const, minWidth: 20 },
  questionText: { fontSize: 14, lineHeight: 20, flex: 1 },
});
