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
import { Search, X, ChevronRight, School, MapPin, BookOpen, Zap, Users, Calculator, Palette, Globe, Wrench, Heart, Building, Car, ShoppingBag, Scissors, Coffee, Factory, Leaf, ChefHat, Home, Stethoscope, GraduationCap } from 'lucide-react-native';
import { SWEDISH_GYMNASIUMS, type Gymnasium, type GymnasiumGrade } from '@/constants/gymnasiums';
import { type GymnasiumProgram } from '@/constants/gymnasium-programs';

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
  const [step, setStep] = useState<'program' | 'gymnasium' | 'grade'>('program');
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

  // Remove unused variable
  // const availablePrograms = useMemo(() => {
  //   if (!tempGymnasium) return [];
  //   return getGymnasiumPrograms(tempGymnasium.id);
  // }, [tempGymnasium]);

  const handleProgramSelect = (program: GymnasiumProgram) => {
    setTempProgram(program);
    setStep('gymnasium');
    setSearchQuery('');
  };

  const handleGymnasiumSelect = (gymnasium: Gymnasium) => {
    setTempGymnasium(gymnasium);
    setStep('grade');
    setSearchQuery('');
  };

  const handleGradeSelect = (grade: GymnasiumGrade) => {
    setTempGrade(grade);
    onSelect(tempGymnasium, tempProgram, grade);
    setModalVisible(false);
    setStep('program');
  };

  const handleBack = () => {
    if (step === 'grade') {
      setStep('gymnasium');
      setTempGrade(null);
    } else if (step === 'gymnasium') {
      setStep('program');
      setTempGymnasium(null);
    } else {
      setModalVisible(false);
    }
  };

  const handleClose = () => {
    setModalVisible(false);
    setStep('program');
    setSearchQuery('');
    setTempGymnasium(selectedGymnasium);
    setTempProgram(selectedProgram);
    setTempGrade(selectedGrade);
  };

  // Program icons mapping
  const getProgramIcon = (programId: string) => {
    const iconMap: Record<string, any> = {
      'na': Calculator,
      'te': Zap,
      'sa': Users,
      'ek': Building,
      'es': Palette,
      'hu': Globe,
      'ib': GraduationCap,
      'ba': Home,
      'bf': Heart,
      'ee': Zap,
      'ft': Car,
      'ha': ShoppingBag,
      'hv': Scissors,
      'ht': Coffee,
      'in': Factory,
      'nb': Leaf,
      'rl': ChefHat,
      'vf': Wrench,
      'vo': Stethoscope,
      'fs': Zap,
      'sx': Zap,
      'mp': Palette,
      'id': Heart,
    };
    return iconMap[programId] || BookOpen;
  };

  // Program colors mapping
  const getProgramColor = (programId: string) => {
    const colorMap: Record<string, string> = {
      'na': '#10B981', // Green for science
      'te': '#F59E0B', // Orange for technology
      'sa': '#3B82F6', // Blue for social sciences
      'ek': '#8B5CF6', // Purple for economics
      'es': '#EC4899', // Pink for aesthetics
      'hu': '#06B6D4', // Cyan for humanities
      'ib': '#6366F1', // Indigo for IB
      'ba': '#F97316', // Orange for construction
      'bf': '#EF4444', // Red for child care
      'ee': '#FBBF24', // Yellow for electrical
      'ft': '#6B7280', // Gray for vehicles
      'ha': '#10B981', // Green for business
      'hv': '#F59E0B', // Orange for crafts
      'ht': '#8B5CF6', // Purple for hospitality
      'in': '#6B7280', // Gray for industrial
      'nb': '#22C55E', // Green for nature
      'rl': '#F97316', // Orange for restaurant
      'vf': '#0EA5E9', // Blue for HVAC
      'vo': '#EF4444', // Red for healthcare
      'fs': '#6366F1', // Indigo for aviation
      'sx': '#0EA5E9', // Blue for maritime
      'mp': '#EC4899', // Pink for music
      'id': '#EF4444', // Red for sports
    };
    return colorMap[programId] || '#6B7280';
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
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <X size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.programGrid}>
          <Text style={styles.sectionTitle}>Högskoleförberedande program</Text>
          <View style={styles.programRow}>
            {[
              { id: 'na', name: 'Naturvetenskap', abbr: 'NA' },
              { id: 'te', name: 'Teknik', abbr: 'TE' },
              { id: 'sa', name: 'Samhällsvetenskap', abbr: 'SA' },
              { id: 'ek', name: 'Ekonomi', abbr: 'EK' },
              { id: 'es', name: 'Estetiska', abbr: 'ES' },
              { id: 'hu', name: 'Humanistiska', abbr: 'HU' },
              { id: 'ib', name: 'International Baccalaureate', abbr: 'IB' },
            ].filter(p => !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()))
            .map(program => {
              const IconComponent = getProgramIcon(program.id);
              const color = getProgramColor(program.id);
              const isSelected = tempProgram?.id === program.id;
              
              return (
                <TouchableOpacity
                  key={program.id}
                  style={[
                    styles.programCard,
                    isSelected && styles.selectedProgramCard,
                    { borderColor: color }
                  ]}
                  onPress={() => handleProgramSelect({ 
                    id: program.id, 
                    name: program.name + 'programmet', 
                    abbreviation: program.abbr, 
                    category: 'högskoleförberedande' 
                  })}
                >
                  <View style={[styles.programIconContainer, { backgroundColor: color + '20' }]}>
                    <IconComponent size={24} color={color} />
                  </View>
                  <Text style={[styles.programCardName, isSelected && { color }]}>
                    {program.name}
                  </Text>
                  <Text style={styles.programCardAbbr}>{program.abbr}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          
          <Text style={[styles.sectionTitle, styles.sectionTitleSpacing]}>Yrkesprogram</Text>
          <View style={styles.programRow}>
            {[
              { id: 'ba', name: 'Bygg & Anläggning', abbr: 'BA' },
              { id: 'bf', name: 'Barn & Fritid', abbr: 'BF' },
              { id: 'ee', name: 'El & Energi', abbr: 'EE' },
              { id: 'ft', name: 'Fordon & Transport', abbr: 'FT' },
              { id: 'ha', name: 'Handel & Administration', abbr: 'HA' },
              { id: 'hv', name: 'Hantverk', abbr: 'HV' },
              { id: 'ht', name: 'Hotell & Turism', abbr: 'HT' },
              { id: 'in', name: 'Industritekniska', abbr: 'IN' },
              { id: 'nb', name: 'Naturbruk', abbr: 'NB' },
              { id: 'rl', name: 'Restaurang & Livsmedel', abbr: 'RL' },
              { id: 'vf', name: 'VVS & Fastighet', abbr: 'VF' },
              { id: 'vo', name: 'Vård & Omsorg', abbr: 'VO' },
            ].filter(p => !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()))
            .map(program => {
              const IconComponent = getProgramIcon(program.id);
              const color = getProgramColor(program.id);
              const isSelected = tempProgram?.id === program.id;
              
              return (
                <TouchableOpacity
                  key={program.id}
                  style={[
                    styles.programCard,
                    isSelected && styles.selectedProgramCard,
                    { borderColor: color }
                  ]}
                  onPress={() => handleProgramSelect({ 
                    id: program.id, 
                    name: program.name + 'programmet', 
                    abbreviation: program.abbr, 
                    category: 'yrkesprogram' 
                  })}
                >
                  <View style={[styles.programIconContainer, { backgroundColor: color + '20' }]}>
                    <IconComponent size={24} color={color} />
                  </View>
                  <Text style={[styles.programCardName, isSelected && { color }]}>
                    {program.name}
                  </Text>
                  <Text style={styles.programCardAbbr}>{program.abbr}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </>
  );

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

  const renderGradeStep = () => (
    <>
      <View style={styles.selectedProgramHeader}>
        <View style={[styles.programIconContainer, { backgroundColor: getProgramColor(tempProgram?.id || '') + '20' }]}>
          {React.createElement(getProgramIcon(tempProgram?.id || ''), { size: 24, color: getProgramColor(tempProgram?.id || '') })}
        </View>
        <View style={styles.selectedProgramInfo}>
          <Text style={styles.selectedProgramName}>{tempProgram?.name}</Text>
          <Text style={styles.selectedProgramAbbr}>{tempProgram?.abbreviation}</Text>
        </View>
      </View>

      <View style={styles.selectedGymnasiumHeader}>
        <School size={24} color="#4F46E5" />
        <View style={styles.selectedGymnasiumInfo}>
          <Text style={styles.selectedGymnasiumName}>{tempGymnasium?.name}</Text>
          <Text style={styles.selectedGymnasiumCity}>{tempGymnasium?.city}</Text>
        </View>
      </View>

      <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Välj årskurs</Text>
        
        <View style={styles.gradeGrid}>
          {(['1', '2', '3'] as GymnasiumGrade[]).map(grade => (
            <TouchableOpacity
              key={grade}
              style={[
                styles.gradeCard,
                tempGrade === grade && styles.selectedGradeCard
              ]}
              onPress={() => handleGradeSelect(grade)}
            >
              <Text style={[
                styles.gradeNumber,
                tempGrade === grade && styles.selectedGradeNumber
              ]}>
                {grade}
              </Text>
              <Text style={[
                styles.gradeLabel,
                tempGrade === grade && styles.selectedGradeLabel
              ]}>
                Årskurs {grade}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
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
              {step === 'program' ? 'Välj program' : 
               step === 'gymnasium' ? 'Välj gymnasium' : 
               'Välj årskurs'}
            </Text>
            <View style={styles.backButton} />
          </View>

          {step === 'program' ? renderProgramStep() : 
           step === 'gymnasium' ? renderGymnasiumStep() : 
           renderGradeStep()}
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
  programGrid: {
    padding: 16,
  },
  programRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  programCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    minWidth: 100,
    flex: 1,
    maxWidth: '48%',
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
  },
  selectedProgramCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
  },
  programIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  programCardName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 4,
  },
  programCardAbbr: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  sectionTitleSpacing: {
    marginTop: 8,
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
  gradeGrid: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  gradeCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    flex: 1,
    maxWidth: 100,
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
  selectedGradeCard: {
    backgroundColor: '#EEF2FF',
    borderColor: '#4F46E5',
  },
  gradeNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6B7280',
    marginBottom: 8,
  },
  selectedGradeNumber: {
    color: '#4F46E5',
  },
  gradeLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  selectedGradeLabel: {
    color: '#4F46E5',
  },
});