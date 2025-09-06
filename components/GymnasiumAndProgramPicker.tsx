import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  SafeAreaView,
} from 'react-native';
import { Search, X, ChevronRight, School, MapPin } from 'lucide-react-native';
import { SWEDISH_GYMNASIUMS, type Gymnasium, type GymnasiumGrade } from '@/constants/gymnasiums';
import { getGymnasiumPrograms, type GymnasiumProgram } from '@/constants/gymnasium-programs';

interface GymnasiumAndProgramPickerProps {
  selectedGymnasium: Gymnasium | null;
  selectedProgram: GymnasiumProgram | null;
  selectedGrade: GymnasiumGrade | null;
  onSelect: (gymnasium: Gymnasium | null, program: GymnasiumProgram | null, grade: GymnasiumGrade | null) => void;
  placeholder?: string;
}

export default function GymnasiumAndProgramPicker({
  selectedGymnasium,
  selectedProgram,
  selectedGrade,
  onSelect,
  placeholder = 'Välj gymnasium och linje'
}: GymnasiumAndProgramPickerProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [step, setStep] = useState<'gymnasium' | 'program'>('gymnasium');
  const [tempGymnasium, setTempGymnasium] = useState<Gymnasium | null>(selectedGymnasium);
  const [tempProgram, setTempProgram] = useState<GymnasiumProgram | null>(selectedProgram);
  const [tempGrade, setTempGrade] = useState<GymnasiumGrade | null>(selectedGrade);

  const filteredGymnasiums = useMemo(() => {
    if (!searchQuery) return SWEDISH_GYMNASIUMS;
    
    const query = searchQuery.toLowerCase();
    return SWEDISH_GYMNASIUMS.filter(gym =>
      gym.name.toLowerCase().includes(query) ||
      gym.city.toLowerCase().includes(query) ||
      gym.municipality.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const groupedGymnasiums = useMemo(() => {
    const grouped: Record<string, Gymnasium[]> = {};
    filteredGymnasiums.forEach(gym => {
      if (!grouped[gym.city]) {
        grouped[gym.city] = [];
      }
      grouped[gym.city].push(gym);
    });
    return grouped;
  }, [filteredGymnasiums]);

  const availablePrograms = useMemo(() => {
    if (!tempGymnasium) return [];
    return getGymnasiumPrograms(tempGymnasium.id);
  }, [tempGymnasium]);

  const handleGymnasiumSelect = (gymnasium: Gymnasium) => {
    setTempGymnasium(gymnasium);
    setTempProgram(null); // Reset program when changing gymnasium
    setStep('program');
    setSearchQuery('');
  };

  const handleProgramSelect = (program: GymnasiumProgram, grade: GymnasiumGrade) => {
    setTempProgram(program);
    setTempGrade(grade);
    onSelect(tempGymnasium, program, grade);
    setModalVisible(false);
    setStep('gymnasium');
  };

  const handleBack = () => {
    if (step === 'program') {
      setStep('gymnasium');
      setTempProgram(null);
      setTempGrade(null);
    } else {
      setModalVisible(false);
    }
  };

  const handleClose = () => {
    setModalVisible(false);
    setStep('gymnasium');
    setSearchQuery('');
    setTempGymnasium(selectedGymnasium);
    setTempProgram(selectedProgram);
    setTempGrade(selectedGrade);
  };

  const renderGymnasiumStep = () => (
    <>
      <View style={styles.searchContainer}>
        <Search size={20} color="#9CA3AF" />
        <TextInput
          style={styles.searchInput}
          placeholder="Sök gymnasium, stad eller kommun..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9CA3AF"
          autoFocus
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <X size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
        {Object.keys(groupedGymnasiums).sort().map(city => (
          <View key={city} style={styles.citySection}>
            <View style={styles.cityHeader}>
              <MapPin size={16} color="#6B7280" />
              <Text style={styles.cityTitle}>{city}</Text>
            </View>
            {groupedGymnasiums[city].map(gymnasium => (
              <TouchableOpacity
                key={gymnasium.id}
                style={[
                  styles.gymnasiumItem,
                  tempGymnasium?.id === gymnasium.id && styles.selectedItem
                ]}
                onPress={() => handleGymnasiumSelect(gymnasium)}
              >
                <View style={styles.gymnasiumInfo}>
                  <Text style={[
                    styles.gymnasiumName,
                    tempGymnasium?.id === gymnasium.id && styles.selectedText
                  ]}>
                    {gymnasium.name}
                  </Text>
                  <Text style={styles.gymnasiumType}>
                    {gymnasium.type === 'kommunal' ? 'Kommunal' : 
                     gymnasium.type === 'friskola' ? 'Friskola' : 'Privat'}
                  </Text>
                </View>
                <ChevronRight size={20} color="#9CA3AF" />
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>
    </>
  );

  const renderProgramStep = () => (
    <>
      <View style={styles.selectedGymnasiumHeader}>
        <School size={24} color="#4F46E5" />
        <View style={styles.selectedGymnasiumInfo}>
          <Text style={styles.selectedGymnasiumName}>{tempGymnasium?.name}</Text>
          <Text style={styles.selectedGymnasiumCity}>{tempGymnasium?.city}</Text>
        </View>
      </View>

      <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Välj årskurs och program</Text>
        
        {(['1', '2', '3'] as GymnasiumGrade[]).map(grade => (
          <View key={grade} style={styles.gradeSection}>
            <Text style={styles.gradeTitle}>Årskurs {grade}</Text>
            
            <View style={styles.programCategories}>
              <Text style={styles.categoryTitle}>Högskoleförberedande program</Text>
              {availablePrograms
                .filter(p => p.category === 'högskoleförberedande')
                .map(program => (
                  <TouchableOpacity
                    key={`${grade}-${program.id}`}
                    style={[
                      styles.programItem,
                      tempProgram?.id === program.id && tempGrade === grade && styles.selectedItem
                    ]}
                    onPress={() => handleProgramSelect(program, grade)}
                  >
                    <View style={styles.programInfo}>
                      <Text style={[
                        styles.programName,
                        tempProgram?.id === program.id && tempGrade === grade && styles.selectedText
                      ]}>
                        {program.name}
                      </Text>
                      <Text style={styles.programAbbr}>{program.abbreviation}</Text>
                    </View>
                    <ChevronRight size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                ))}
              
              {availablePrograms.some(p => p.category === 'yrkesprogram') && (
                <>
                  <Text style={[styles.categoryTitle, styles.categoryTitleSpacing]}>Yrkesprogram</Text>
                  {availablePrograms
                    .filter(p => p.category === 'yrkesprogram')
                    .map(program => (
                      <TouchableOpacity
                        key={`${grade}-${program.id}`}
                        style={[
                          styles.programItem,
                          tempProgram?.id === program.id && tempGrade === grade && styles.selectedItem
                        ]}
                        onPress={() => handleProgramSelect(program, grade)}
                      >
                        <View style={styles.programInfo}>
                          <Text style={[
                            styles.programName,
                            tempProgram?.id === program.id && tempGrade === grade && styles.selectedText
                          ]}>
                            {program.name}
                          </Text>
                          <Text style={styles.programAbbr}>{program.abbreviation}</Text>
                        </View>
                        <ChevronRight size={20} color="#9CA3AF" />
                      </TouchableOpacity>
                    ))}
                </>
              )}
            </View>
          </View>
        ))}
      </ScrollView>
    </>
  );

  return (
    <>
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setModalVisible(true)}
      >
        <View style={styles.selectorContent}>
          {selectedGymnasium && selectedProgram && selectedGrade ? (
            <View>
              <Text style={styles.selectedValue}>{selectedGymnasium.name}</Text>
              <Text style={styles.selectedSubValue}>
                Årskurs {selectedGrade} - {selectedProgram.name}
              </Text>
            </View>
          ) : (
            <Text style={styles.placeholder}>{placeholder}</Text>
          )}
        </View>
        <ChevronRight size={20} color="#9CA3AF" />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={handleClose}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <X size={24} color="#374151" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {step === 'gymnasium' ? 'Välj gymnasium' : 'Välj program och årskurs'}
            </Text>
            <View style={styles.backButton} />
          </View>

          {step === 'gymnasium' ? renderGymnasiumStep() : renderProgramStep()}
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  selector: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectorContent: {
    flex: 1,
  },
  selectedValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  selectedSubValue: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  placeholder: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 4,
    width: 32,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#111827',
  },
  listContainer: {
    flex: 1,
  },
  citySection: {
    marginBottom: 24,
  },
  cityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
  },
  cityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginLeft: 8,
  },
  gymnasiumItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  selectedItem: {
    backgroundColor: '#EEF2FF',
  },
  gymnasiumInfo: {
    flex: 1,
  },
  gymnasiumName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  gymnasiumType: {
    fontSize: 14,
    color: '#6B7280',
  },
  selectedText: {
    color: '#4F46E5',
  },
  selectedGymnasiumHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedGymnasiumInfo: {
    marginLeft: 12,
  },
  selectedGymnasiumName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  selectedGymnasiumCity: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  gradeSection: {
    marginBottom: 24,
  },
  gradeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
  },
  programCategories: {
    backgroundColor: 'white',
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#F9FAFB',
  },
  categoryTitleSpacing: {
    marginTop: 16,
  },
  programItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  programInfo: {
    flex: 1,
  },
  programName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  programAbbr: {
    fontSize: 14,
    color: '#6B7280',
  },
});