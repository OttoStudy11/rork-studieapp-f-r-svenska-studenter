import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Modal,
  SafeAreaView,
} from 'react-native';
import { Search, X, ChevronRight, GraduationCap, MapPin, Building, Briefcase } from 'lucide-react-native';
import { AnimatedPressable, PressableCard } from '@/components/Animations';
import { SWEDISH_UNIVERSITIES, UNIVERSITY_PROGRAMS, type University, type UniversityProgram, type UniversityProgramYear } from '@/constants/universities';

interface UniversityPickerProps {
  selectedUniversity: University | null;
  selectedProgram: UniversityProgram | null;
  selectedYear: UniversityProgramYear | null;
  onSelect: (university: University | null, program: UniversityProgram | null, year: UniversityProgramYear | null) => void;
  placeholder?: string;
}

export default function UniversityPicker({
  selectedUniversity,
  selectedProgram,
  selectedYear,
  onSelect,
  placeholder = 'Välj högskola och program'
}: UniversityPickerProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [step, setStep] = useState<'program' | 'university' | 'year'>('program');
  const [tempUniversity, setTempUniversity] = useState<University | null>(selectedUniversity);
  const [tempProgram, setTempProgram] = useState<UniversityProgram | null>(selectedProgram);
  const [tempYear, setTempYear] = useState<UniversityProgramYear | null>(selectedYear);

  const filteredUniversities = useMemo(() => {
    if (!searchQuery) return SWEDISH_UNIVERSITIES;
    
    const query = searchQuery.toLowerCase();
    return SWEDISH_UNIVERSITIES.filter(uni =>
      uni.name.toLowerCase().includes(query) ||
      uni.city.toLowerCase().includes(query) ||
      uni.category.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const groupedUniversities = useMemo(() => {
    const grouped: Record<string, University[]> = {};
    filteredUniversities.forEach(uni => {
      if (!grouped[uni.category]) {
        grouped[uni.category] = [];
      }
      grouped[uni.category].push(uni);
    });
    return grouped;
  }, [filteredUniversities]);

  const filteredPrograms = useMemo(() => {
    if (!searchQuery) return UNIVERSITY_PROGRAMS;
    
    const query = searchQuery.toLowerCase();
    return UNIVERSITY_PROGRAMS.filter(prog =>
      prog.name.toLowerCase().includes(query) ||
      prog.field.toLowerCase().includes(query) ||
      prog.degreeType.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const groupedPrograms = useMemo(() => {
    const grouped: Record<string, UniversityProgram[]> = {};
    filteredPrograms.forEach(prog => {
      if (!grouped[prog.field]) {
        grouped[prog.field] = [];
      }
      grouped[prog.field].push(prog);
    });
    return grouped;
  }, [filteredPrograms]);

  const handleProgramSelect = (program: UniversityProgram) => {
    setTempProgram(program);
    setStep('university');
    setSearchQuery('');
  };

  const handleUniversitySelect = (university: University) => {
    setTempUniversity(university);
    setStep('year');
    setSearchQuery('');
  };

  const handleYearSelect = (year: UniversityProgramYear) => {
    setTempYear(year);
    onSelect(tempUniversity, tempProgram, year);
    setModalVisible(false);
    setStep('program');
  };

  const handleBack = () => {
    if (step === 'year') {
      setStep('university');
      setTempYear(null);
    } else if (step === 'university') {
      setStep('program');
      setTempUniversity(null);
    } else {
      setModalVisible(false);
    }
  };

  const handleClose = () => {
    setModalVisible(false);
    setStep('program');
    setSearchQuery('');
    setTempUniversity(selectedUniversity);
    setTempProgram(selectedProgram);
    setTempYear(selectedYear);
  };

  const getProgramIcon = (degreeType: string) => {
    const iconMap: Record<string, any> = {
      'civilingenjör': Building,
      'högskoleingenjör': Building,
      'professionsprogram': Briefcase,
      'kandidat': GraduationCap,
      'magister': GraduationCap,
      'master': GraduationCap,
      'yrkeshögskola': Briefcase,
    };
    return iconMap[degreeType] || GraduationCap;
  };

  const getProgramColor = (field: string) => {
    const colorMap: Record<string, string> = {
      'Teknik': '#F59E0B',
      'Teknik/Ekonomi': '#8B5CF6',
      'Medicin': '#EF4444',
      'Vårdvetenskap': '#EC4899',
      'Psykologi': '#06B6D4',
      'Naturvetenskap': '#10B981',
      'Juridik': '#6366F1',
      'Ekonomi': '#8B5CF6',
      'Socialt arbete': '#3B82F6',
      'Statsvetenskap': '#3B82F6',
      'Samhällsvetenskap': '#3B82F6',
      'Humaniora': '#EC4899',
      'Utbildningsvetenskap': '#22C55E',
      'Media': '#F59E0B',
      'IT': '#0EA5E9',
      'Veterinärmedicin': '#22C55E',
      'Lantbruk': '#22C55E',
      'Skogshushållning': '#22C55E',
    };
    return colorMap[field] || '#6B7280';
  };

  const renderProgramStep = () => (
    <>
      <View style={styles.searchContainer}>
        <Search size={20} color="#9CA3AF" />
        <TextInput
          style={styles.searchInput}
          placeholder="Sök program..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9CA3AF"
          autoFocus
        />
        {searchQuery.length > 0 && (
          <AnimatedPressable onPress={() => setSearchQuery('')}>
            <X size={20} color="#9CA3AF" />
          </AnimatedPressable>
        )}
      </View>

      <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
        {Object.keys(groupedPrograms).sort().map(field => (
          <View key={field}>
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryTitle}>{field}</Text>
            </View>
            <View style={styles.programGrid}>
              {groupedPrograms[field].map(program => {
                const IconComponent = getProgramIcon(program.degreeType);
                const color = getProgramColor(program.field);
                const isSelected = tempProgram?.id === program.id;
                
                return (
                  <PressableCard
                    key={program.id}
                    style={[
                      styles.programCard,
                      isSelected && styles.selectedProgramCard,
                      { borderColor: color }
                    ]}
                    onPress={() => handleProgramSelect(program)}
                  >
                    <View style={[styles.programIconContainer, { backgroundColor: color + '20' }]}>
                      <IconComponent size={18} color={color} />
                    </View>
                    <Text style={[styles.programCardName, isSelected && { color }]} numberOfLines={3}>
                      {program.name}
                    </Text>
                    {program.abbreviation && (
                      <Text style={styles.programCardAbbr}>{program.abbreviation}</Text>
                    )}
                    <View style={styles.programMetaRow}>
                      <Text style={styles.programCardMeta}>{program.credits} hp</Text>
                      <Text style={styles.programCardMeta}>{program.durationYears} år</Text>
                    </View>
                  </PressableCard>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>
    </>
  );

  const renderUniversityStep = () => (
    <>
      <View style={styles.searchContainer}>
        <Search size={20} color="#9CA3AF" />
        <TextInput
          style={styles.searchInput}
          placeholder="Sök högskola, stad eller typ..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9CA3AF"
          autoFocus
        />
        {searchQuery.length > 0 && (
          <AnimatedPressable onPress={() => setSearchQuery('')}>
            <X size={20} color="#9CA3AF" />
          </AnimatedPressable>
        )}
      </View>

      <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
        {Object.keys(groupedUniversities).sort().map(category => (
          <View key={category} style={styles.citySection}>
            <View style={styles.cityHeader}>
              <GraduationCap size={16} color="#6B7280" />
              <Text style={styles.cityTitle}>{category}</Text>
            </View>
            {groupedUniversities[category].map(university => (
              <AnimatedPressable
                key={university.id}
                style={[
                  styles.universityItem,
                  tempUniversity?.id === university.id && styles.selectedItem
                ]}
                onPress={() => handleUniversitySelect(university)}
              >
                <View style={styles.universityInfo}>
                  <Text style={[
                    styles.universityName,
                    tempUniversity?.id === university.id && styles.selectedText
                  ]}>
                    {university.name}
                  </Text>
                  <View style={styles.universityMetaRow}>
                    <MapPin size={12} color="#9CA3AF" />
                    <Text style={styles.universityCity}>{university.city}</Text>
                  </View>
                </View>
                <ChevronRight size={20} color="#9CA3AF" />
              </AnimatedPressable>
            ))}
          </View>
        ))}
      </ScrollView>
    </>
  );

  const renderYearStep = () => (
    <>
      <View style={styles.selectedProgramHeader}>
        <View style={[styles.programIconContainer, { backgroundColor: getProgramColor(tempProgram?.field || '') + '20' }]}>
          {React.createElement(getProgramIcon(tempProgram?.degreeType || ''), { size: 24, color: getProgramColor(tempProgram?.field || '') })}
        </View>
        <View style={styles.selectedProgramInfo}>
          <Text style={styles.selectedProgramName}>{tempProgram?.name}</Text>
          <Text style={styles.selectedProgramAbbr}>
            {tempProgram?.abbreviation || tempProgram?.degreeType}
          </Text>
        </View>
      </View>

      <View style={styles.selectedUniversityHeader}>
        <GraduationCap size={24} color="#4F46E5" />
        <View style={styles.selectedUniversityInfo}>
          <Text style={styles.selectedUniversityName}>{tempUniversity?.name}</Text>
          <Text style={styles.selectedUniversityCity}>{tempUniversity?.city}</Text>
        </View>
      </View>

      <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Välj termin</Text>
        
        <View style={styles.yearGrid}>
          {Array.from({ length: tempProgram?.durationYears || 5 }, (_, i) => (i + 1) as UniversityProgramYear).map(year => (
            <PressableCard
              key={year}
              style={[
                styles.yearCard,
                tempYear === year && styles.selectedYearCard
              ]}
              onPress={() => handleYearSelect(year)}
            >
              <Text style={[
                styles.yearNumber,
                tempYear === year && styles.selectedYearNumber
              ]}>
                {year}
              </Text>
              <Text style={[
                styles.yearLabel,
                tempYear === year && styles.selectedYearLabel
              ]}>
                Termin {year}
              </Text>
            </PressableCard>
          ))}
        </View>
      </ScrollView>
    </>
  );

  return (
    <>
      <AnimatedPressable
        style={styles.selector}
        onPress={() => setModalVisible(true)}
      >
        <View style={styles.selectorContent}>
          {selectedUniversity && selectedProgram && selectedYear ? (
            <View>
              <Text style={styles.selectedValue}>{selectedUniversity.name}</Text>
              <Text style={styles.selectedSubValue}>
                Termin {selectedYear} - {selectedProgram.name}
              </Text>
            </View>
          ) : (
            <Text style={styles.placeholder}>{placeholder}</Text>
          )}
        </View>
        <ChevronRight size={20} color="#9CA3AF" />
      </AnimatedPressable>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={handleClose}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <AnimatedPressable onPress={handleBack} style={styles.backButton}>
              <X size={24} color="#374151" />
            </AnimatedPressable>
            <Text style={styles.modalTitle}>
              {step === 'program' ? 'Välj program' : 
               step === 'university' ? 'Välj högskola' : 
               'Välj termin'}
            </Text>
            <View style={styles.backButton} />
          </View>

          {step === 'program' ? renderProgramStep() : 
           step === 'university' ? renderUniversityStep() : 
           renderYearStep()}
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
  universityItem: {
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
  universityInfo: {
    flex: 1,
  },
  universityName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  universityMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  universityCity: {
    fontSize: 13,
    color: '#6B7280',
  },
  selectedText: {
    color: '#4F46E5',
  },
  selectedUniversityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedUniversityInfo: {
    marginLeft: 12,
  },
  selectedUniversityName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  selectedUniversityCity: {
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
  categoryHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F3F4F6',
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  programGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  programCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    width: '48%',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    minHeight: 140,
  },
  selectedProgramCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
  },
  programIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  programCardName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
    lineHeight: 16,
    minHeight: 48,
  },
  programCardAbbr: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '600',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  programMetaRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  programCardMeta: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '500',
  },
  selectedProgramHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedProgramInfo: {
    marginLeft: 12,
    flex: 1,
  },
  selectedProgramName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  selectedProgramAbbr: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  yearGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 16,
  },
  yearCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    width: '30%',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedYearCard: {
    backgroundColor: '#EEF2FF',
    borderColor: '#4F46E5',
  },
  yearNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6B7280',
    marginBottom: 6,
  },
  selectedYearNumber: {
    color: '#4F46E5',
  },
  yearLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  selectedYearLabel: {
    color: '#4F46E5',
  },
});