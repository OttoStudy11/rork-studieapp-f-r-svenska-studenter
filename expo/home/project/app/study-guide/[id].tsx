import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FileText, Clock, BookOpen } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface StudyGuide {
  id: string;
  title: string;
  description: string | null;
  content: string;
  guide_type: string;
  estimated_read_time: number;
  course_id: string;
}

export default function StudyGuideDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [guide, setGuide] = useState<StudyGuide | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadGuideData();
    }
  }, [id]);

  const loadGuideData = async () => {
    try {
      setLoading(true);

      const { data: guideData, error: guideError } = await supabase
        .from('study_guides')
        .select('*')
        .eq('id', id)
        .single();

      if (guideError) throw guideError;
      setGuide(guideData);

    } catch (error) {
      console.error('Error loading study guide:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, index) => {
      if (line.startsWith('# ')) {
        return (
          <Text key={`h1-${index}`} style={styles.contentH1}>
            {line.substring(2)}
          </Text>
        );
      } else if (line.startsWith('## ')) {
        return (
          <Text key={`h2-${index}`} style={styles.contentH2}>
            {line.substring(3)}
          </Text>
        );
      } else if (line.startsWith('### ')) {
        return (
          <Text key={`h3-${index}`} style={styles.contentH3}>
            {line.substring(4)}
          </Text>
        );
      } else if (line.startsWith('- ')) {
        return (
          <Text key={`bullet-${index}`} style={styles.contentBullet}>
            • {line.substring(2)}
          </Text>
        );
      } else if (line.startsWith('**') && line.endsWith('**')) {
        return (
          <Text key={`bold-${index}`} style={styles.contentBold}>
            {line.substring(2, line.length - 2)}
          </Text>
        );
      } else if (line.trim()) {
        return (
          <Text key={`text-${index}`} style={styles.contentText}>
            {line}
          </Text>
        );
      } else {
        return <View key={`space-${index}`} style={styles.contentSpacing} />;
      }
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Laddar studiehjälp...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!guide) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Studiehjälpen kunde inte hittas</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: guide.title,
          headerStyle: { backgroundColor: '#4ECDC4' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' }
        }} 
      />
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Guide Header */}
          <View style={styles.header}>
            <View style={styles.guideIcon}>
              <FileText size={32} color="#fff" />
            </View>
            <View style={styles.guideInfo}>
              <Text style={styles.guideTitle}>{guide.title}</Text>
              {guide.description && (
                <Text style={styles.guideDescription}>{guide.description}</Text>
              )}
              <View style={styles.guideMeta}>
                <Clock size={16} color="rgba(255, 255, 255, 0.8)" />
                <Text style={styles.guideReadTime}>
                  ~{guide.estimated_read_time} min läsning
                </Text>
                <Text style={styles.guideType}>
                  • {guide.guide_type}
                </Text>
              </View>
            </View>
          </View>

          {/* Guide Content */}
          <View style={styles.contentCard}>
            <View style={styles.contentHeader}>
              <BookOpen size={20} color="#4ECDC4" />
              <Text style={styles.contentTitle}>Innehåll</Text>
            </View>
            <View style={styles.content}>
              {renderContent(guide.content)}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
  },
  header: {
    backgroundColor: '#4ECDC4',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  guideIcon: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideInfo: {
    flex: 1,
  },
  guideTitle: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#fff',
    marginBottom: 4,
  },
  guideDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
    lineHeight: 20,
  },
  guideMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  guideReadTime: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  guideType: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textTransform: 'capitalize',
  },
  contentCard: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  contentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  contentTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#2c3e50',
  },
  content: {
    gap: 8,
  },
  contentH1: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: '#2c3e50',
    marginVertical: 12,
  },
  contentH2: {
    fontSize: 24,
    fontWeight: '600' as const,
    color: '#2c3e50',
    marginVertical: 10,
  },
  contentH3: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: '#34495e',
    marginVertical: 8,
  },
  contentText: {
    fontSize: 16,
    color: '#34495e',
    lineHeight: 24,
    marginBottom: 4,
  },
  contentBullet: {
    fontSize: 16,
    color: '#34495e',
    lineHeight: 24,
    marginLeft: 16,
    marginBottom: 4,
  },
  contentBold: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#2c3e50',
    lineHeight: 24,
    marginBottom: 4,
  },
  contentSpacing: {
    height: 12,
  },
});