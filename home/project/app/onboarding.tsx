import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useCourses } from '@/contexts/CourseContext';
import { ChevronRight, School, BookOpen, User } from 'lucide-react-native';
import { gymnasiums } from '@/constants/gymnasiums';
import { gymnasiumPrograms } from '@/constants/gymnasium-programs';

export default function Onboarding() {
  const router = useRouter();
  const { updateUserProfile } = useCourses();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [gymnasium, setGymnasium] = useState('');
  const [program, setProgram] = useState('');
  const [year, setYear] = useState<1 | 2 | 3>(1);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredGymnasiums = gymnasiums.filter(g => 
    g.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const availablePrograms = gymnasium ? 
    gymnasiumPrograms[gymnasium] || gymnasiumPrograms['default'] : 
    [];

  const handleComplete = async () => {
    await updateUserProfile({
      id: `user-${Date.now()}`,
      name,
      gymnasium,
      program,
      year,
    });
    router.replace('/(tabs)/home');
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <View style={styles.stepContainer}>
            <User size={48} color="#4ECDC4" style={styles.icon} />
            <Text style={styles.title}>Välkommen till StudieStugan!</Text>
            <Text style={styles.subtitle}>Vad heter du?</Text>
            <TextInput
              style={styles.input}
              placeholder="Ditt namn"
              value={name}
              onChangeText={setName}
              autoFocus
            />
            <TouchableOpacity
              style={[styles.button, !name && styles.buttonDisabled]}
              onPress={() => name && setStep(2)}
              disabled={!name}
            >
              <Text style={styles.buttonText}>Fortsätt</Text>
              <ChevronRight size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContainer}>
            <School size={48} color="#4ECDC4" style={styles.icon} />
            <Text style={styles.title}>Välj ditt gymnasium</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Sök gymnasium..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
              {filteredGymnasiums.map((gym) => (
                <TouchableOpacity
                  key={gym}
                  style={[styles.listItem, gymnasium === gym && styles.listItemSelected]}
                  onPress={() => {
                    setGymnasium(gym);
                    setStep(3);
                  }}
                >
                  <Text style={[styles.listItemText, gymnasium === gym && styles.listItemTextSelected]}>
                    {gym}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContainer}>
            <BookOpen size={48} color="#4ECDC4" style={styles.icon} />
            <Text style={styles.title}>Välj program och årskurs</Text>
            <Text style={styles.subtitle}>Program</Text>
            <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
              {availablePrograms.map((prog) => (
                <TouchableOpacity
                  key={prog}
                  style={[styles.listItem, program === prog && styles.listItemSelected]}
                  onPress={() => setProgram(prog)}
                >
                  <Text style={[styles.listItemText, program === prog && styles.listItemTextSelected]}>
                    {prog}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            {program && (
              <>
                <Text style={[styles.subtitle, { marginTop: 20 }]}>Årskurs</Text>
                <View style={styles.yearContainer}>
                  {[1, 2, 3].map((y) => (
                    <TouchableOpacity
                      key={y}
                      style={[styles.yearButton, year === y && styles.yearButtonSelected]}
                      onPress={() => setYear(y as 1 | 2 | 3)}
                    >
                      <Text style={[styles.yearButtonText, year === y && styles.yearButtonTextSelected]}>
                        År {y}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
            
            <TouchableOpacity
              style={[styles.button, (!program || !year) && styles.buttonDisabled]}
              onPress={handleComplete}
              disabled={!program || !year}
            >
              <Text style={styles.buttonText}>Kom igång!</Text>
              <ChevronRight size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.progressContainer}>
        {[1, 2, 3].map((s) => (
          <View
            key={s}
            style={[styles.progressDot, s <= step && styles.progressDotActive]}
          />
        ))}
      </View>
      {renderStep()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 10,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ddd',
  },
  progressDotActive: {
    backgroundColor: '#4ECDC4',
    width: 30,
  },
  stepContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  icon: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  list: {
    flex: 1,
    marginBottom: 20,
  },
  listItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  listItemSelected: {
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
  },
  listItemText: {
    fontSize: 16,
    color: '#333',
  },
  listItemTextSelected: {
    color: '#fff',
    fontWeight: '600' as const,
  },
  yearContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 30,
  },
  yearButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  yearButtonSelected: {
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
  },
  yearButtonText: {
    fontSize: 16,
    color: '#333',
  },
  yearButtonTextSelected: {
    color: '#fff',
    fontWeight: '600' as const,
  },
  button: {
    backgroundColor: '#4ECDC4',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600' as const,
    marginRight: 5,
  },
});