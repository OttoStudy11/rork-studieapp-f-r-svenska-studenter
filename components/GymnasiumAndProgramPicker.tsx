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
import { Search, X, ChevronRight, School, MapPin, Calculator, Zap, Users, Building, Palette, Globe, Heart, Home, Scissors, Coffee, Factory, Leaf, ChefHat, Wrench, Stethoscope, GraduationCap, BookOpen } from 'lucide-react-native';
import { AnimatedPressable, PressableCard, FadeInView } from '@/components/Animations';
import { SWEDISH_GYMNASIUMS, type Gymnasium, type GymnasiumGrade } from '@/constants/gymnasiums';
import { type GymnasiumProgram } from '@/constants/gymnasium-programs';
import { LinearGradient } from 'expo-linear-gradient';

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
      'ft': BookOpen,
      'ha': Building,
      'hv': Scissors,
      'ht': Coffee,
      'in': Factory,
      'nb': Leaf,
      'rl': ChefHat,
      'vf': Wrench,
      'vo': Stethoscope,
    };
    return iconMap[programId] || BookOpen;
  };

  const getProgramColor = (programId: string) => {
    const colorMap: Record<string, string> = {
      'na': '#10B981',
      'te': '#F59E0B',
      'sa': '#3B82F6',
      'ek': '#8B5CF6',
      'es': '#EC4899',
      'hu': '#06B6D4',
      'ib': '#6366F1',
      'ba': '#F97316',
      'bf': '#EF4444',
      'ee': '#FBBF24',
      'ft': '#6B7280',
      'ha': '#10B981',
      'hv': '#F59E0B',
      'ht': '#8B5CF6',
      'in': '#6B7280',
      'nb': '#22C55E',
      'rl': '#F97316',
      'vf': '#0EA5E9',
      'vo': '#EF4444',
    };
    return colorMap[programId] || '#6B7280';
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
        <View style={styles.programSection}>
          <View style={styles.categoryHeaderContainer}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>HÖGSKOLEFÖRBEREDANDE</Text>
            </View>
          </View>
          
          <View style={styles.programGrid}>
            {[
              { id: 'na', name: 'Naturvetenskap', abbr: 'NA', description: 'Fysik, Kemi, Biologi' },
              { id: 'te', name: 'Teknik', abbr: 'TE', description: 'Teknik & Innovation' },
              { id: 'sa', name: 'Samhällsvetenskap', abbr: 'SA', description: 'Samhälle & Kultur' },
              { id: 'ek', name: 'Ekonomi', abbr: 'EK', description: 'Ekonomi & Företag' },
              { id: 'es', name: 'Estetiska', abbr: 'ES', description: 'Konst & Design' },
              { id: 'hu', name: 'Humanistiska', abbr: 'HU', description: 'Språk & Kultur' },
            ].filter(p => !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((program, index) => {
              const IconComponent = getProgramIcon(program.id);
              const color = getProgramColor(program.id);
              const isSelected = tempProgram?.id === program.id;
              
              return (
                <FadeInView key={program.id} delay={index * 50}>
                  <PressableCard
                    testID={`program-card-${program.id}`}
                    style={[
                      styles.premiumProgramCard,
                      isSelected && [styles.selectedPremiumCard, { borderColor: color }]
                    ]}
                    onPress={() => handleProgramSelect({ 
                      id: program.id, 
                      name: program.name + 'programmet', 
                      abbreviation: program.abbr, 
                      category: 'högskoleförberedande' 
                    })}
                  >
                    <LinearGradient
                      colors={isSelected ? [color + '15', color + '08'] : ['#F8FAFC', '#F1F5F9']}
                      style={styles.cardGradient}
                    >
                      <View style={[styles.premiumIconContainer, { backgroundColor: color + '15' }]}>
                        <IconComponent size={28} color={color} />
                      </View>
                      <Text style={[styles.premiumProgramName, isSelected && { color }]}>
                        {program.name}
                      </Text>
                      <Text style={styles.premiumProgramAbbr}>{program.abbr}</Text>
                      <Text style={styles.premiumProgramDesc} numberOfLines={1}>
                        {program.description}
                      </Text>
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
          
          <View style={[styles.categoryHeaderContainer, styles.categorySpacing]}>
            <View style={[styles.categoryBadge, { backgroundColor: '#F59E0B15' }]}>
              <Text style={[styles.categoryBadgeText, { color: '#F59E0B' }]}>YRKESPROGRAM</Text>
            </View>
          </View>
          
          <View style={styles.programGrid}>
            {[
              { id: 'ba', name: 'Bygg & Anläggning', abbr: 'BA', description: 'Byggnad & Konstruktion' },
              { id: 'bf', name: 'Barn & Fritid', abbr: 'BF', description: 'Pedagogik & Omsorg' },
              { id: 'ee', name: 'El & Energi', abbr: 'EE', description: 'Elektricitet & System' },
              { id: 'ha', name: 'Handel & Administration', abbr: 'HA', description: 'Företag & Service' },
              { id: 'hv', name: 'Hantverk', abbr: 'HV', description: 'Tradition & Design' },
              { id: 'ht', name: 'Hotell & Turism', abbr: 'HT', description: 'Service & Gästfrihet' },
              { id: 'vo', name: 'Vård & Omsorg', abbr: 'VO', description: 'Hälsa & Social vård' },
              { id: 'rl', name: 'Restaurang & Livsmedel', abbr: 'RL', description: 'Mat & Dryck' },
            ].filter(p => !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((program, index) => {
              const IconComponent = getProgramIcon(program.id);
              const color = getProgramColor(program.id);
              const isSelected = tempProgram?.id === program.id;
              
              return (
                <FadeInView key={program.id} delay={index * 50}>
                  <PressableCard
                    testID={`program-card-${program.id}`}
                    style={[
                      styles.premiumProgramCard,
                      isSelected && [styles.selectedPremiumCard, { borderColor: color }]
                    ]}
                    onPress={() => handleProgramSelect({ 
                      id: program.id, 
                      name: program.name + 'programmet', 
                      abbreviation: program.abbr, 
                      category: 'yrkesprogram' 
                    })}
                  >
                    <LinearGradient
                      colors={isSelected ? [color + '15', color + '08'] : ['#F8FAFC', '#F1F5F9']}
                      style={styles.cardGradient}
                    >
                      <View style={[styles.premiumIconContainer, { backgroundColor: color + '15' }]}>
                        <IconComponent size={28} color={color} />
                      </View>
                      <Text style={[styles.premiumProgramName, isSelected && { color }]}>
                        {program.name}
                      </Text>
                      <Text style={styles.premiumProgramAbbr}>{program.abbr}</Text>
                      <Text style={styles.premiumProgramDesc} numberOfLines={1}>
                        {program.description}
                      </Text>
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
      </ScrollView>
    </>
  );

  const renderGymnasiumStep = () => (
    <>
      {tempProgram && (
        <View style={styles.selectedProgramBanner}>
          <LinearGradient
            colors={[getProgramColor(tempProgram.id) + '20', getProgramColor(tempProgram.id) + '10']}
            style={styles.bannerGradient}
          >
            <View style={[styles.bannerIcon, { backgroundColor: getProgramColor(tempProgram.id) + '25' }]}>
              {React.createElement(getProgramIcon(tempProgram.id), { 
                size: 24, 
                color: getProgramColor(tempProgram.id) 
              })}
            </View>
            <View style={styles.bannerInfo}>
              <Text style={styles.bannerTitle}>{tempProgram.name}</Text>
              <Text style={styles.bannerSubtitle}>Välj ditt gymnasium</Text>
            </View>
          </LinearGradient>
        </View>
      )}

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Sök gymnasium, stad eller kommun..."
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
        {Object.keys(groupedGymnasiums).sort().map(city => (
          <View key={city} style={styles.cityGroup}>
            <View style={styles.cityHeaderPremium}>
              <MapPin size={16} color="#0EA5E9" />
              <Text style={styles.cityTitlePremium}>{city}</Text>
              <View style={styles.cityLine} />
            </View>
            
            <View style={styles.gymnasiumsList}>
              {groupedGymnasiums[city].map(gymnasium => {
                const isSelected = tempGymnasium?.id === gymnasium.id;
                return (
                  <AnimatedPressable
                    key={gymnasium.id}
                    style={[
                      styles.gymnasiumCardPremium,
                      isSelected && styles.selectedGymnasiumCard
                    ]}
                    onPress={() => handleGymnasiumSelect(gymnasium)}
                  >
                    <View style={styles.gymnasiumCardContent}>
                      <View style={[styles.schoolIconContainer, isSelected && { backgroundColor: '#0EA5E915' }]}>
                        <School size={24} color={isSelected ? '#0EA5E9' : '#64748B'} />
                      </View>
                      <View style={styles.gymnasiumCardInfo}>
                        <Text style={[
                          styles.gymnasiumNamePremium,
                          isSelected && styles.selectedGymnasiumName
                        ]}>
                          {gymnasium.name}
                        </Text>
                        <Text style={styles.gymnasiumTypePremium}>
                          {gymnasium.type === 'kommunal' ? '🏛️ Kommunal' : 
                           gymnasium.type === 'friskola' ? '🏫 Friskola' : '🎓 Privat'}
                        </Text>
                      </View>
                    </View>
                    <ChevronRight size={22} color={isSelected ? '#0EA5E9' : '#CBD5E1'} />
                  </AnimatedPressable>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>
    </>
  );

  const renderGradeStep = () => (
    <>
      {tempProgram && (
        <View style={styles.selectedProgramBanner}>
          <LinearGradient
            colors={[getProgramColor(tempProgram.id) + '20', getProgramColor(tempProgram.id) + '10']}
            style={styles.bannerGradient}
          >
            <View style={[styles.bannerIcon, { backgroundColor: getProgramColor(tempProgram.id) + '25' }]}>
              {React.createElement(getProgramIcon(tempProgram.id), { 
                size: 24, 
                color: getProgramColor(tempProgram.id) 
              })}
            </View>
            <View style={styles.bannerInfo}>
              <Text style={styles.bannerTitle}>{tempProgram.name}</Text>
              <Text style={styles.bannerSubtitle}>{tempProgram.abbreviation}</Text>
            </View>
          </LinearGradient>
        </View>
      )}

      {tempGymnasium && (
        <View style={styles.selectedGymnasiumBanner}>
          <View style={styles.gymnasiumBannerContent}>
            <View style={styles.gymnasiumBannerIcon}>
              <School size={20} color="#0EA5E9" />
            </View>
            <View style={styles.gymnasiumBannerInfo}>
              <Text style={styles.gymnasiumBannerName}>{tempGymnasium.name}</Text>
              <Text style={styles.gymnasiumBannerCity}>{tempGymnasium.city}</Text>
            </View>
          </View>
        </View>
      )}

      <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
        <View style={styles.gradeSection}>
          <Text style={styles.gradeSectionTitle}>Välj årskurs</Text>
          <Text style={styles.gradeSectionSubtitle}>
            Vilken årskurs går du i?
          </Text>
          
          <View style={styles.gradeGridPremium}>
            {(['1', '2', '3'] as GymnasiumGrade[]).map((grade, index) => {
              const isSelected = tempGrade === grade;
              const color = getProgramColor(tempProgram?.id || '');
              
              return (
                <FadeInView key={grade} delay={index * 100}>
                  <PressableCard
                    style={[
                      styles.gradeCardPremium,
                      isSelected && [styles.selectedGradeCardPremium, { borderColor: color }]
                    ]}
                    onPress={() => handleGradeSelect(grade)}
                  >
                    <LinearGradient
                      colors={isSelected ? [color + '20', color + '10'] : ['#FFFFFF', '#F8FAFC']}
                      style={styles.gradeCardGradient}
                    >
                      <View style={[styles.gradeNumberCircle, isSelected && { backgroundColor: color }]}>
                        <Text style={[
                          styles.gradeNumberPremium,
                          isSelected && styles.selectedGradeNumberPremium
                        ]}>
                          {grade}
                        </Text>
                      </View>
                      <Text style={[
                        styles.gradeLabelPremium,
                        isSelected && { color, fontWeight: '700' as const }
                      ]}>
                        Årskurs {grade}
                      </Text>
                      <Text style={styles.gradeDescriptionPremium}>
                        {grade === '1' ? 'Grundläggande kurser' : 
                         grade === '2' ? 'Fördjupade studier' : 
                         'Avslutande år'}
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
          {selectedGymnasium && selectedProgram && selectedGrade ? (
            <>
              <Text style={styles.selectedValue}>{selectedGymnasium.name}</Text>
              <Text style={styles.selectedSubValue}>
                Årskurs {selectedGrade} • {selectedProgram.abbreviation}
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
                 step === 'gymnasium' ? 'Välj gymnasium' : 
                 'Välj årskurs'}
              </Text>
              <View style={styles.stepIndicator}>
                <View style={[styles.stepDot, step === 'program' && styles.activeStepDot]} />
                <View style={[styles.stepDot, step === 'gymnasium' && styles.activeStepDot]} />
                <View style={[styles.stepDot, step === 'grade' && styles.activeStepDot]} />
              </View>
            </View>
            <View style={styles.backButtonContainer} />
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
    backgroundColor: '#0EA5E9',
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
    paddingBottom: 24,
  },
  categoryHeaderContainer: {
    marginBottom: 16,
  },
  categorySpacing: {
    marginTop: 32,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#0EA5E915',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0EA5E9',
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
  premiumProgramDesc: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
    lineHeight: 16,
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
  gymnasiumsList: {
    gap: 10,
    paddingHorizontal: 20,
  },
  gymnasiumCardPremium: {
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
  selectedGymnasiumCard: {
    borderColor: '#0EA5E9',
    backgroundColor: '#F0F9FF',
    borderWidth: 2,
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  gymnasiumCardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  schoolIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gymnasiumCardInfo: {
    flex: 1,
  },
  gymnasiumNamePremium: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  selectedGymnasiumName: {
    color: '#0EA5E9',
  },
  gymnasiumTypePremium: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  selectedGymnasiumBanner: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  gymnasiumBannerContent: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  gymnasiumBannerIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#0EA5E915',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gymnasiumBannerInfo: {
    flex: 1,
  },
  gymnasiumBannerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 3,
    letterSpacing: -0.3,
  },
  gymnasiumBannerCity: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  gradeSection: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  gradeSectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  gradeSectionSubtitle: {
    fontSize: 15,
    color: '#64748B',
    marginBottom: 32,
    textAlign: 'center',
    fontWeight: '500',
  },
  gradeGridPremium: {
    gap: 16,
  },
  gradeCardPremium: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  selectedGradeCardPremium: {
    borderWidth: 2.5,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
  },
  gradeCardGradient: {
    padding: 24,
    alignItems: 'center',
  },
  gradeNumberCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  gradeNumberPremium: {
    fontSize: 36,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -1,
  },
  selectedGradeNumberPremium: {
    color: 'white',
  },
  gradeLabelPremium: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  gradeDescriptionPremium: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
    textAlign: 'center',
  },
});
