import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  SafeAreaView
} from 'react-native';
import { Search, MapPin, X, Check } from 'lucide-react-native';
import { SWEDISH_GYMNASIUMS, searchGymnasiums, getCities, type Gymnasium, type GymnasiumGrade, type GymnasiumSelection } from '@/constants/gymnasiums';

interface GymnasiumPickerProps {
  selectedSelection: GymnasiumSelection | null;
  onSelect: (selection: GymnasiumSelection) => void;
  placeholder?: string;
}

export default function GymnasiumPicker({ selectedSelection, onSelect, placeholder = "Välj gymnasium" }: GymnasiumPickerProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedGymnasium, setSelectedGymnasium] = useState<Gymnasium | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<GymnasiumGrade | null>(null);
  const [showGradeSelection, setShowGradeSelection] = useState(false);

  const cities = useMemo(() => getCities(), []);

  const filteredGymnasiums = useMemo(() => {
    let results = SWEDISH_GYMNASIUMS;

    if (searchQuery.trim()) {
      results = searchGymnasiums(searchQuery);
    }

    if (selectedCity) {
      results = results.filter(gym => gym.city === selectedCity);
    }

    return results.sort((a, b) => a.name.localeCompare(b.name));
  }, [searchQuery, selectedCity]);

  const handleGymnasiumSelect = (gymnasium: Gymnasium) => {
    setSelectedGymnasium(gymnasium);
    setShowGradeSelection(true);
  };

  const handleGradeSelect = (grade: GymnasiumGrade) => {
    if (selectedGymnasium) {
      onSelect({ gymnasium: selectedGymnasium, grade });
      setIsModalVisible(false);
      setSearchQuery('');
      setSelectedCity('');
      setSelectedGymnasium(null);
      setSelectedGrade(null);
      setShowGradeSelection(false);
    }
  };

  const handleBackToGymnasiums = () => {
    setShowGradeSelection(false);
    setSelectedGymnasium(null);
    setSelectedGrade(null);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCity('');
  };

  const grades: { value: GymnasiumGrade; label: string }[] = [
    { value: '1', label: 'Årskurs 1' },
    { value: '2', label: 'Årskurs 2' },
    { value: '3', label: 'Årskurs 3' },
  ];

  return (
    <>
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setIsModalVisible(true)}
        testID="gymnasium-selector"
      >
        <View style={styles.selectorContent}>
          <MapPin size={20} color="#666" />
          <View style={styles.selectorTextContainer}>
            <Text style={[
              styles.selectorText,
              !selectedSelection && styles.placeholderText
            ]}>
              {selectedSelection ? selectedSelection.gymnasium.name : placeholder}
            </Text>
            {selectedSelection && (
              <View style={styles.selectionDetails}>
                <Text style={styles.cityText}>
                  {selectedSelection.gymnasium.city}
                </Text>
                <View style={styles.gradeBadge}>
                  <Text style={styles.gradeText}>
                    Årskurs {selectedSelection.grade}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            {showGradeSelection && (
              <TouchableOpacity
                onPress={handleBackToGymnasiums}
                style={styles.backButton}
              >
                <X size={24} color="#666" style={{ transform: [{ rotate: '180deg' }] }} />
              </TouchableOpacity>
            )}
            <Text style={styles.modalTitle}>
              {showGradeSelection ? 'Välj årskurs' : 'Välj gymnasium'}
            </Text>
            <TouchableOpacity
              onPress={() => setIsModalVisible(false)}
              style={styles.closeButton}
            >
              <X size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {!showGradeSelection && (
            <View style={styles.searchContainer}>
              <View style={styles.searchInputContainer}>
                <Search size={20} color="#666" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Sök gymnasium eller stad..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {(searchQuery || selectedCity) && (
                  <TouchableOpacity onPress={clearFilters}>
                    <X size={20} color="#666" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {!showGradeSelection && (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.cityFilterContainer}
              contentContainerStyle={styles.cityFilterContent}
            >
              <TouchableOpacity
                style={[
                  styles.cityFilter,
                  !selectedCity && styles.cityFilterActive
                ]}
                onPress={() => setSelectedCity('')}
              >
                <Text style={[
                  styles.cityFilterText,
                  !selectedCity && styles.cityFilterActiveText
                ]}>
                  Alla städer
                </Text>
              </TouchableOpacity>
              {cities.map((city) => (
                <TouchableOpacity
                  key={city}
                  style={[
                    styles.cityFilter,
                    selectedCity === city && styles.cityFilterActive
                  ]}
                  onPress={() => setSelectedCity(city)}
                >
                  <Text style={[
                    styles.cityFilterText,
                    selectedCity === city && styles.cityFilterActiveText
                  ]}>
                    {city}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          <ScrollView style={styles.gymnasiumList}>
            {showGradeSelection ? (
              <View>
                {selectedGymnasium && (
                  <View style={styles.selectedGymnasiumHeader}>
                    <Text style={styles.selectedGymnasiumName}>
                      {selectedGymnasium.name}
                    </Text>
                    <Text style={styles.selectedGymnasiumCity}>
                      {selectedGymnasium.city}
                    </Text>
                  </View>
                )}
                <Text style={styles.gradeSelectionTitle}>
                  Välj vilken årskurs du går i:
                </Text>
                {grades.map((grade) => (
                  <TouchableOpacity
                    key={grade.value}
                    style={[
                      styles.gradeItem,
                      selectedGrade === grade.value && styles.selectedGradeItem
                    ]}
                    onPress={() => handleGradeSelect(grade.value)}
                  >
                    <Text style={[
                      styles.gradeItemText,
                      selectedGrade === grade.value && styles.selectedGradeItemText
                    ]}>
                      {grade.label}
                    </Text>
                    <Check size={20} color="#4F46E5" />
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <>
                {filteredGymnasiums.length === 0 ? (
                  <View style={styles.noResultsContainer}>
                    <Text style={styles.noResultsText}>
                      Inga gymnasium hittades
                    </Text>
                    <Text style={styles.noResultsSubtext}>
                      Prova att ändra din sökning eller filter
                    </Text>
                  </View>
                ) : (
                  filteredGymnasiums.map((gymnasium) => (
                    <TouchableOpacity
                      key={gymnasium.id}
                      style={[
                        styles.gymnasiumItem,
                        selectedSelection?.gymnasium.id === gymnasium.id && styles.selectedGymnasiumItem
                      ]}
                      onPress={() => handleGymnasiumSelect(gymnasium)}
                    >
                      <View style={styles.gymnasiumInfo}>
                        <Text style={styles.gymnasiumName}>
                          {gymnasium.name}
                        </Text>
                        <View style={styles.gymnasiumDetails}>
                          <Text style={styles.gymnasiumCity}>
                            {gymnasium.city}
                          </Text>
                          <View style={styles.gymnasiumTypeBadge}>
                            <Text style={styles.gymnasiumTypeText}>
                              {gymnasium.type === 'kommunal' ? 'Kommunal' : 
                               gymnasium.type === 'friskola' ? 'Friskola' : 'Privat'}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </>
            )}
          </ScrollView>
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
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minHeight: 56,
  },
  selectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  selectorTextContainer: {
    flex: 1,
  },
  selectorText: {
    fontSize: 16,
    color: '#111827',
    flex: 1,
  },
  placeholderText: {
    color: '#9CA3AF',
  },
  selectionDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  cityText: {
    fontSize: 14,
    color: '#6B7280',
  },
  gradeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    backgroundColor: '#4F46E5',
  },
  gradeText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  backButton: {
    padding: 4,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: 'white',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  cityFilterContainer: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  cityFilterContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  cityFilter: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  cityFilterActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  cityFilterText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  cityFilterActiveText: {
    color: 'white',
  },
  gymnasiumList: {
    flex: 1,
    padding: 16,
  },
  noResultsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  gymnasiumItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedGymnasiumItem: {
    borderColor: '#4F46E5',
    backgroundColor: '#F0F9FF',
  },
  gymnasiumInfo: {
    flex: 1,
  },
  gymnasiumName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  gymnasiumDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  gymnasiumCity: {
    fontSize: 14,
    color: '#6B7280',
  },
  gymnasiumTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  gymnasiumTypeText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  selectedGymnasiumHeader: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#4F46E5',
  },
  selectedGymnasiumName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  selectedGymnasiumCity: {
    fontSize: 14,
    color: '#6B7280',
  },
  gradeSelectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  gradeItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedGradeItem: {
    borderColor: '#4F46E5',
    backgroundColor: '#F0F9FF',
  },
  gradeItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  selectedGradeItemText: {
    color: '#4F46E5',
  },
});