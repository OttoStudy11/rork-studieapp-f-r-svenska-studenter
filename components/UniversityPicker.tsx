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
import { AnimatedPressable, PressableCard, FadeInView } from '@/components/Animations';
import { LinearGradient } from 'expo-linear-gradient';
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
        <View style={styles.searchBar}>
          <Search size={20} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Sök program..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#94A3B8"
            autoFocus
          />
          {searchQuery.length > 0 && (
            <AnimatedPressable onPress={() => setSearchQuery('')}>
              <X size={20} color="#94A3B8" />
            </AnimatedPressable>
          )}
        </View>
      </View>

      <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
        {Object.keys(groupedPrograms).sort().map(field => (
          <View key={field} style={styles.programSection}>
            <View style={styles.categoryHeaderContainer}>
              <View style={[styles.categoryBadge, { backgroundColor: getProgramColor(groupedPrograms[field][0]?.field || '') + '15' }]}>
                <Text style={[styles.categoryBadgeText, { color: getProgramColor(groupedPrograms[field][0]?.field || '') }]}>
                  {field.toUpperCase()}
                </Text>
              </View>
            </View>
            <View style={styles.programGrid}>
              {groupedPrograms[field].map((program, index) => {
                const IconComponent = getProgramIcon(program.degreeType);
                const color = getProgramColor(program.field);
                const isSelected = tempProgram?.id === program.id;
                
                return (
                  <FadeInView key={program.id} delay={index * 50}>
                    <PressableCard
                      style={[
                        styles.premiumProgramCard,
                        isSelected && [styles.selectedPremiumCard, { borderColor: color }]
                      ]}
                      onPress={() => handleProgramSelect(program)}
                    >
                      <LinearGradient
                        colors={isSelected ? [color + '15', color + '08'] : ['#F8FAFC', '#F1F5F9']}
                        style={styles.cardGradient}
                      >
                        <View style={[styles.premiumIconContainer, { backgroundColor: color + '15' }]}>
                          <IconComponent size={28} color={color} />
                        </View>
                        <Text style={[styles.premiumProgramName, isSelected && { color }]} numberOfLines={3}>
                          {program.name}
                        </Text>
                        {program.abbreviation && (
                          <Text style={styles.premiumProgramAbbr}>{program.abbreviation}</Text>
                        )}
                        <View style={styles.programMetaRow}>
                          <Text style={styles.programCardMeta}>{program.credits} hp</Text>
                          <Text style={styles.programCardMeta}>{program.durationYears} år</Text>
                        </View>
                        {isSelected && (
                          <View style={[styles.selectedBadge, { backgroundColor: color }]}>
                            <Text style={styles.selectedBadgeText}>VALD</Text>
                          </View>
                        )}
                      </LinearGradient>
                    </PressableCard>
                  </FadeInView>
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
      {tempProgram && (
        <View style={styles.selectedProgramBanner}>
          <LinearGradient
            colors={[getProgramColor(tempProgram.field) + '20', getProgramColor(tempProgram.field) + '10']}
            style={styles.bannerGradient}
          >
            <View style={[styles.bannerIcon, { backgroundColor: getProgramColor(tempProgram.field) + '25' }]}>
              {React.createElement(getProgramIcon(tempProgram.degreeType), { 
                size: 24, 
                color: getProgramColor(tempProgram.field) 
              })}
            </View>
            <View style={styles.bannerInfo}>
              <Text style={styles.bannerTitle}>{tempProgram.name}</Text>
              <Text style={styles.bannerSubtitle}>Välj ditt universitet</Text>
            </View>
          </LinearGradient>
        </View>
      )}

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Sök högskola, stad eller typ..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#94A3B8"
            autoFocus
          />
          {searchQuery.length > 0 && (
            <AnimatedPressable onPress={() => setSearchQuery('')}>
              <X size={20} color="#94A3B8" />
            </AnimatedPressable>
          )}
        </View>
      </View>

      <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
        {Object.keys(groupedUniversities).sort().map(category => (
          <View key={category} style={styles.cityGroup}>
            <View style={styles.cityHeaderPremium}>
              <GraduationCap size={16} color="#4F46E5" />
              <Text style={styles.cityTitlePremium}>{category}</Text>
              <View style={styles.cityLine} />
            </View>
            
            <View style={styles.universitiesList}>
              {groupedUniversities[category].map(university => {
                const isSelected = tempUniversity?.id === university.id;
                return (
                  <AnimatedPressable
                    key={university.id}
                    style={[
                      styles.universityCardPremium,
                      isSelected && styles.selectedUniversityCard
                    ]}
                    onPress={() => handleUniversitySelect(university)}
                  >
                    <View style={styles.universityCardContent}>
                      <View style={[styles.universityIconContainer, isSelected && { backgroundColor: '#4F46E915' }]}>
                        <GraduationCap size={24} color={isSelected ? '#4F46E5' : '#64748B'} />
                      </View>
                      <View style={styles.universityCardInfo}>
                        <Text style={[
                          styles.universityNamePremium,
                          isSelected && styles.selectedUniversityName
                        ]}>
                          {university.name}
                        </Text>
                        <View style={styles.universityMetaRow}>
                          <MapPin size={12} color="#94A3B8" />
                          <Text style={styles.universityCityPremium}>{university.city}</Text>
                        </View>
                      </View>
                    </View>
                    <ChevronRight size={22} color={isSelected ? '#4F46E5' : '#CBD5E1'} />
                  </AnimatedPressable>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>
    </>
  );

  const renderYearStep = () => (
    <>
      {tempProgram && (
        <View style={styles.selectedProgramBanner}>
          <LinearGradient
            colors={[getProgramColor(tempProgram.field) + '20', getProgramColor(tempProgram.field) + '10']}
            style={styles.bannerGradient}
          >
            <View style={[styles.bannerIcon, { backgroundColor: getProgramColor(tempProgram.field) + '25' }]}>
              {React.createElement(getProgramIcon(tempProgram.degreeType), { 
                size: 24, 
                color: getProgramColor(tempProgram.field) 
              })}
            </View>
            <View style={styles.bannerInfo}>
              <Text style={styles.bannerTitle}>{tempProgram.name}</Text>
              <Text style={styles.bannerSubtitle}>{tempProgram.abbreviation || tempProgram.degreeType}</Text>
            </View>
          </LinearGradient>
        </View>
      )}

      {tempUniversity && (
        <View style={styles.selectedUniversityBanner}>
          <View style={styles.universityBannerContent}>
            <View style={styles.universityBannerIcon}>
              <GraduationCap size={20} color="#4F46E5" />
            </View>
            <View style={styles.universityBannerInfo}>
              <Text style={styles.universityBannerName}>{tempUniversity.name}</Text>
              <Text style={styles.universityBannerCity}>{tempUniversity.city}</Text>
            </View>
          </View>
        </View>
      )}

      <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
        <View style={styles.yearSection}>
          <Text style={styles.yearSectionTitle}>Välj termin</Text>
          <Text style={styles.yearSectionSubtitle}>
            Vilken termin läser du?
          </Text>
          
          <View style={styles.yearGridPremium}>
            {Array.from({ length: tempProgram?.durationYears || 5 }, (_, i) => (i + 1) as UniversityProgramYear).map((year, index) => {
              const isSelected = tempYear === year;
              const color = getProgramColor(tempProgram?.field || '');
              
              return (
                <FadeInView key={year} delay={index * 100}>
                  <PressableCard
                    style={[
                      styles.yearCardPremium,
                      isSelected && [styles.selectedYearCardPremium, { borderColor: color }]
                    ]}
                    onPress={() => handleYearSelect(year)}
                  >
                    <LinearGradient
                      colors={isSelected ? [color + '20', color + '10'] : ['#FFFFFF', '#F8FAFC']}
                      style={styles.yearCardGradient}
                    >
                      <View style={[styles.yearNumberCircle, isSelected && { backgroundColor: color }]}>
                        <Text style={[
                          styles.yearNumberPremium,
                          isSelected && styles.selectedYearNumberPremium
                        ]}>
                          {year}
                        </Text>
                      </View>
                      <Text style={[
                        styles.yearLabelPremium,
                        isSelected && { color, fontWeight: '700' as const }
                      ]}>
                        Termin {year}
                      </Text>
                    </LinearGradient>
                  </PressableCard>
                </FadeInView>
              );
            })}
          </View>
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
            <>
              <Text style={styles.selectedValue}>{selectedUniversity.name}</Text>
              <Text style={styles.selectedSubValue}>
                Termin {selectedYear} • {selectedProgram.name}
              </Text>
            </>
          ) : (
            <Text style={styles.placeholder}>{placeholder}</Text>
          )}
        </View>
        <ChevronRight size={20} color="#94A3B8" />
      </AnimatedPressable>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={handleClose}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <AnimatedPressable onPress={handleBack} style={styles.backButtonContainer}>
              <X size={24} color="#1E293B" />
            </AnimatedPressable>
            <View style={styles.modalTitleContainer}>
              <Text style={styles.modalTitle}>
                {step === 'program' ? 'Välj program' : 
                 step === 'university' ? 'Välj högskola' : 
                 'Välj termin'}
              </Text>
              <View style={styles.stepIndicator}>
                <View style={[styles.stepDot, step === 'program' && styles.activeStepDot]} />
                <View style={[styles.stepDot, step === 'university' && styles.activeStepDot]} />
                <View style={[styles.stepDot, step === 'year' && styles.activeStepDot]} />
              </View>
            </View>
            <View style={styles.backButtonContainer} />
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
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  selectorContent: {
    flex: 1,
  },
  selectedValue: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  selectedSubValue: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  placeholder: {
    fontSize: 16,
    color: '#94A3B8',
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  backButtonContainer: {
    padding: 4,
    width: 40,
  },
  modalTitleContainer: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  stepIndicator: {
    flexDirection: 'row',
    gap: 6,
  },
  stepDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
  },
  activeStepDot: {
    backgroundColor: '#4F46E5',
    width: 20,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '500',
  },
  contentScroll: {
    flex: 1,
  },
  programSection: {
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  categoryHeaderContainer: {
    marginBottom: 16,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  programGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  premiumProgramCard: {
    width: '48.5%',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  selectedPremiumCard: {
    borderWidth: 2.5,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
  },
  cardGradient: {
    padding: 18,
    minHeight: 160,
    justifyContent: 'space-between',
  },
  premiumIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  premiumProgramName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
    letterSpacing: -0.3,
    lineHeight: 20,
  },
  premiumProgramAbbr: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '700',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  programMetaRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  programCardMeta: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '500',
  },
  selectedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  selectedBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: 'white',
    letterSpacing: 0.8,
  },
  selectedProgramBanner: {
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  bannerGradient: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  bannerIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerInfo: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 3,
    letterSpacing: -0.3,
  },
  bannerSubtitle: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  cityGroup: {
    marginBottom: 28,
  },
  cityHeaderPremium: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 8,
  },
  cityTitlePremium: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  cityLine: {
    flex: 1,
    height: 1.5,
    backgroundColor: '#E2E8F0',
    marginLeft: 12,
  },
  universitiesList: {
    gap: 10,
    paddingHorizontal: 20,
  },
  universityCardPremium: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  selectedUniversityCard: {
    borderColor: '#4F46E5',
    backgroundColor: '#EEF2FF',
    borderWidth: 2,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  universityCardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  universityIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  universityCardInfo: {
    flex: 1,
  },
  universityNamePremium: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  selectedUniversityName: {
    color: '#4F46E5',
  },
  universityMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  universityCityPremium: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  selectedUniversityBanner: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  universityBannerContent: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  universityBannerIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#4F46E915',
    alignItems: 'center',
    justifyContent: 'center',
  },
  universityBannerInfo: {
    flex: 1,
  },
  universityBannerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 3,
    letterSpacing: -0.3,
  },
  universityBannerCity: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  yearSection: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  yearSectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  yearSectionSubtitle: {
    fontSize: 15,
    color: '#64748B',
    marginBottom: 32,
    textAlign: 'center',
    fontWeight: '500',
  },
  yearGridPremium: {
    gap: 16,
  },
  yearCardPremium: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  selectedYearCardPremium: {
    borderWidth: 2.5,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
  },
  yearCardGradient: {
    padding: 24,
    alignItems: 'center',
  },
  yearNumberCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  yearNumberPremium: {
    fontSize: 36,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -1,
  },
  selectedYearNumberPremium: {
    color: 'white',
  },
  yearLabelPremium: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
});