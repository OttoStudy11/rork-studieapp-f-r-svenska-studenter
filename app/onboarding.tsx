import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useStudy } from '@/contexts/StudyContext';
import { useToast } from '@/contexts/ToastContext';
import { GraduationCap, Target, Users, BookOpen } from 'lucide-react-native';

interface OnboardingData {
  name: string;
  studyLevel: 'gymnasie' | 'högskola' | '';
  program: string;
  goals: string[];
  purpose: string[];
}

const goalOptions = [
  'Bättre planering',
  'Högre betyg',
  'Minska stress',
  'Balans fritid/studier',
  'Bättre fokus',
  'Motivation'
];

const purposeOptions = [
  'Fokus & koncentration',
  'Motivation & disciplin',
  'Studera med vänner',
  'Studietips & tekniker',
  'Spåra framsteg',
  'Organisera material'
];

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    name: '',
    studyLevel: '',
    program: '',
    goals: [],
    purpose: []
  });
  const { user } = useAuth();
  const { completeOnboarding } = useStudy();
  const { showError, showSuccess } = useToast();

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    if (data.studyLevel && data.name && data.program) {
      try {
        console.log('Completing onboarding with data:', data);
        await completeOnboarding({
          name: data.name,
          email: user?.email || 'unknown@example.com',
          studyLevel: data.studyLevel as 'gymnasie' | 'högskola',
          program: data.program,
          purpose: [...data.goals, ...data.purpose].join(', '),
          subscriptionType: 'free'
        });
        showSuccess('Välkommen till StudyFlow!');
        console.log('Onboarding completed, redirecting to home');
        router.replace('/(tabs)');
      } catch (error) {
        console.error('Onboarding error:', error);
        showError('Något gick fel. Försök igen.');
      }
    }
  };

  const toggleSelection = (array: string[], item: string, key: 'goals' | 'purpose') => {
    const newArray = array.includes(item)
      ? array.filter(i => i !== item)
      : [...array, item];
    setData({ ...data, [key]: newArray });
  };

  const canProceed = () => {
    switch (step) {
      case 0: return data.name.length > 0;
      case 1: return data.studyLevel !== '';
      case 2: return data.program.length > 0;
      case 3: return data.goals.length > 0;
      case 4: return data.purpose.length > 0;
      default: return false;
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <View style={styles.stepContainer}>
            <GraduationCap size={80} color="#4F46E5" style={styles.icon} />
            <Text style={styles.title}>Välkommen till StudyFlow!</Text>
            <Text style={styles.subtitle}>Vad heter du?</Text>
            <TextInput
              style={styles.input}
              placeholder="Ditt namn"
              value={data.name}
              onChangeText={(text) => setData({ ...data, name: text })}
              autoFocus
            />
          </View>
        );

      case 1:
        return (
          <View style={styles.stepContainer}>
            <BookOpen size={80} color="#4F46E5" style={styles.icon} />
            <Text style={styles.title}>Vad studerar du?</Text>
            <View style={styles.optionsContainer}>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  data.studyLevel === 'gymnasie' && styles.selectedOption
                ]}
                onPress={() => setData({ ...data, studyLevel: 'gymnasie' })}
              >
                <Text style={[
                  styles.optionText,
                  data.studyLevel === 'gymnasie' && styles.selectedOptionText
                ]}>
                  Gymnasie
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  data.studyLevel === 'högskola' && styles.selectedOption
                ]}
                onPress={() => setData({ ...data, studyLevel: 'högskola' })}
              >
                <Text style={[
                  styles.optionText,
                  data.studyLevel === 'högskola' && styles.selectedOptionText
                ]}>
                  Högskola/Universitet
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>
              {data.studyLevel === 'gymnasie' ? 'Vilket program?' : 'Vilket program/inriktning?'}
            </Text>
            <TextInput
              style={styles.input}
              placeholder={
                data.studyLevel === 'gymnasie' 
                  ? 'T.ex. Naturvetenskapsprogrammet' 
                  : 'T.ex. Civilingenjör Datateknik'
              }
              value={data.program}
              onChangeText={(text) => setData({ ...data, program: text })}
              autoFocus
            />
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContainer}>
            <Target size={80} color="#4F46E5" style={styles.icon} />
            <Text style={styles.title}>Vilka är dina mål?</Text>
            <Text style={styles.subtitle}>Välj alla som passar dig</Text>
            <View style={styles.multiSelectContainer}>
              {goalOptions.map((goal) => (
                <TouchableOpacity
                  key={goal}
                  style={[
                    styles.multiSelectOption,
                    data.goals.includes(goal) && styles.selectedMultiOption
                  ]}
                  onPress={() => toggleSelection(data.goals, goal, 'goals')}
                >
                  <Text style={[
                    styles.multiSelectText,
                    data.goals.includes(goal) && styles.selectedMultiText
                  ]}>
                    {goal}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContainer}>
            <Users size={80} color="#4F46E5" style={styles.icon} />
            <Text style={styles.title}>Vad vill du fokusera på?</Text>
            <Text style={styles.subtitle}>Välj dina huvudintressen</Text>
            <View style={styles.multiSelectContainer}>
              {purposeOptions.map((purpose) => (
                <TouchableOpacity
                  key={purpose}
                  style={[
                    styles.multiSelectOption,
                    data.purpose.includes(purpose) && styles.selectedMultiOption
                  ]}
                  onPress={() => toggleSelection(data.purpose, purpose, 'purpose')}
                >
                  <Text style={[
                    styles.multiSelectText,
                    data.purpose.includes(purpose) && styles.selectedMultiText
                  ]}>
                    {purpose}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${((step + 1) / 5) * 100}%` }]} />
            </View>
            <Text style={styles.progressText}>{step + 1} av 5</Text>
          </View>

          {renderStep()}

          <View style={styles.buttonContainer}>
            {step > 0 && (
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setStep(step - 1)}
              >
                <Text style={styles.backButtonText}>Tillbaka</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={[
                styles.nextButton,
                !canProceed() && styles.disabledButton
              ]}
              onPress={handleNext}
              disabled={!canProceed()}
            >
              <Text style={styles.nextButtonText}>
                {step === 4 ? 'Kom igång!' : 'Nästa'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  progressContainer: {
    marginTop: 20,
    marginBottom: 40,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 2,
  },
  progressText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.8,
  },
  stepContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  icon: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 20,
  },
  optionsContainer: {
    width: '100%',
    gap: 12,
  },
  optionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOption: {
    backgroundColor: 'white',
    borderColor: '#4F46E5',
  },
  optionText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
  },
  selectedOptionText: {
    color: '#4F46E5',
  },
  multiSelectContainer: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  multiSelectOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  selectedMultiOption: {
    backgroundColor: 'white',
    borderColor: 'white',
  },
  multiSelectText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedMultiText: {
    color: '#4F46E5',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 40,
    gap: 16,
  },
  backButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 16,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  nextButton: {
    flex: 2,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
  },
  disabledButton: {
    opacity: 0.5,
  },
  nextButtonText: {
    color: '#4F46E5',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});