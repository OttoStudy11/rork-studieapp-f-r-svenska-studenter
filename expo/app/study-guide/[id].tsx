import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { 
  BookOpen, 
  Clock, 
  FileText,
  List,
  Calculator,
  Calendar,
  Hash
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { Database } from '@/lib/database.types';

type StudyGuide = Database['public']['Tables']['study_guides']['Row'];

export default function StudyGuideScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [guide, setGuide] = useState<StudyGuide | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id && user?.id) {
      loadGuideData();
    }
  }, [id, user?.id]);

  const loadGuideData = async () => {
    try {
      setIsLoading(true);
      console.log('Loading study guide data for ID:', id);

      const { data: guideData, error: guideError } = await supabase
        .from('study_guides')
        .select('*')
        .eq('id', id)
        .single();

      if (guideError) {
        console.error('Error loading study guide:', guideError);
        Alert.alert('Fel', 'Kunde inte ladda studiehjälpmedlet');
        return;
      }

      setGuide(guideData);

    } catch (error) {
      console.error('Error in loadGuideData:', error);
      Alert.alert('Fel', 'Ett oväntat fel inträffade');
    } finally {
      setIsLoading(false);
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'easy': return '#10B981';
      case 'medium': return '#F59E0B';
      case 'hard': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getGuideTypeIcon = (type: string) => {
    switch (type) {
      case 'summary': return BookOpen;
      case 'cheat_sheet': return FileText;
      case 'formula_sheet': return Calculator;
      case 'vocabulary': return List;
      case 'timeline': return Calendar;
      default: return Hash;
    }
  };

  const getGuideTypeName = (type: string) => {
    switch (type) {
      case 'summary': return 'Sammanfattning';
      case 'cheat_sheet': return 'Fusklapp';
      case 'formula_sheet': return 'Formelblad';
      case 'vocabulary': return 'Ordlista';
      case 'timeline': return 'Tidslinje';
      default: return 'Guide';
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'Laddar...', headerShown: true }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Laddar studiehjälpmedel...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!guide) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'Guide ej hittad', headerShown: true }} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Studiehjälpmedlet kunde inte hittas</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Gå tillbaka</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const GuideIcon = getGuideTypeIcon(guide.guide_type);

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: guide.title,
          headerShown: true,
          headerStyle: { backgroundColor: '#4F46E5' },
          headerTintColor: 'white'
        }} 
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Guide Header */}
        <LinearGradient
          colors={['#4F46E5', '#7C3AED']}
          style={styles.guideHeader}
        >
          <View style={styles.guideTypeContainer}>
            <GuideIcon size={24} color="white" />
            <Text style={styles.guideType}>
              {getGuideTypeName(guide.guide_type)}
            </Text>
          </View>
          
          <Text style={styles.guideTitle}>{guide.title}</Text>
          {guide.description && (
            <Text style={styles.guideDescription}>{guide.description}</Text>
          )}
          
          <View style={styles.guideMetadata}>
            <View style={styles.metadataItem}>
              <Clock size={16} color="rgba(255, 255, 255, 0.8)" />
              <Text style={styles.metadataText}>{guide.estimated_read_time} min läsning</Text>
            </View>
            <View style={[
              styles.difficultyBadge,
              { backgroundColor: getDifficultyColor(guide.difficulty_level) }
            ]}>
              <Text style={styles.difficultyText}>
                {guide.difficulty_level === 'easy' ? 'Lätt' : 
                 guide.difficulty_level === 'medium' ? 'Medel' : 'Svår'}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Guide Content */}
        <View style={styles.section}>
          <View style={styles.contentContainer}>
            <Text style={styles.contentText}>{guide.content}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#EF4444',
    marginBottom: 20,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  guideHeader: {
    padding: 24,
    marginBottom: 20,
  },
  guideTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  guideType: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 8,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  guideTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  guideDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 24,
    marginBottom: 16,
  },
  guideMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metadataText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  difficultyText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  contentContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  contentText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
});