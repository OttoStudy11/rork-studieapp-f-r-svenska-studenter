import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { usePremium } from '@/contexts/PremiumContext';
import { useToast } from '@/contexts/ToastContext';
import { 
  Crown, 
  Check, 
  X, 
  BookOpen, 
  FileText, 
  Users, 
  Timer, 
  BarChart3, 
  Download,
  Palette,
  Moon,
  ArrowLeft
} from 'lucide-react-native';

export default function PremiumScreen() {
  const { isPremium, subscriptionType, upgradeToPremium } = usePremium();
  const { showSuccess } = useToast();

  const features = [
    {
      icon: BookOpen,
      title: 'Obegränsat antal kurser',
      free: '3 kurser',
      premium: 'Obegränsat',
      color: '#4F46E5'
    },
    {
      icon: FileText,
      title: 'Obegränsat antal anteckningar',
      free: '10 anteckningar',
      premium: 'Obegränsat',
      color: '#10B981'
    },
    {
      icon: Users,
      title: 'Obegränsat antal vänner',
      free: '3 vänner',
      premium: 'Obegränsat',
      color: '#F59E0B'
    },
    {
      icon: Timer,
      title: 'Anpassningsbar Pomodoro-timer',
      free: 'Standard inställningar',
      premium: 'Anpassningsbara tider',
      color: '#EF4444'
    },
    {
      icon: BarChart3,
      title: 'Avancerad statistik',
      free: 'Grundläggande stats',
      premium: 'Detaljerad analys',
      color: '#8B5CF6'
    },
    {
      icon: Download,
      title: 'Exportera data',
      free: false,
      premium: 'PDF & CSV export',
      color: '#06B6D4'
    },
    {
      icon: Palette,
      title: 'Anpassade färgteman',
      free: false,
      premium: 'Flera teman',
      color: '#EC4899'
    },
    {
      icon: Moon,
      title: 'Mörkt läge',
      free: false,
      premium: 'Mörkt & ljust läge',
      color: '#6B7280'
    }
  ];

  const handleUpgrade = async () => {
    await upgradeToPremium();
  };

  if (isPremium) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.header}
        >
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          <Crown size={60} color="#FFD700" />
          <Text style={styles.premiumTitle}>Du är Premium!</Text>
          <Text style={styles.premiumSubtitle}>
            Tack för att du stödjer StudyFlow
          </Text>
        </LinearGradient>

        <ScrollView style={styles.content}>
          <View style={styles.benefitsSection}>
            <Text style={styles.sectionTitle}>Dina Premium-fördelar</Text>
            {features.map((feature, index) => (
              <View key={index} style={styles.benefitItem}>
                <View style={[styles.iconContainer, { backgroundColor: `${feature.color}20` }]}>
                  <feature.icon size={24} color={feature.color} />
                </View>
                <View style={styles.benefitContent}>
                  <Text style={styles.benefitTitle}>{feature.title}</Text>
                  <Text style={styles.benefitDescription}>
                    {typeof feature.premium === 'string' ? feature.premium : 'Aktiverad'}
                  </Text>
                </View>
                <Check size={20} color="#10B981" />
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.header}
        >
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          <Crown size={60} color="#FFD700" />
          <Text style={styles.title}>Uppgradera till Premium</Text>
          <Text style={styles.subtitle}>
            Lås upp alla funktioner och få den bästa studieupplevelsen
          </Text>
        </LinearGradient>

        {/* Features Comparison */}
        <View style={styles.content}>
          <View style={styles.comparisonHeader}>
            <View style={styles.comparisonColumn}>
              <Text style={styles.comparisonTitle}>Funktion</Text>
            </View>
            <View style={styles.comparisonColumn}>
              <Text style={styles.comparisonTitle}>Gratis</Text>
            </View>
            <View style={styles.comparisonColumn}>
              <Text style={[styles.comparisonTitle, styles.premiumText]}>Premium</Text>
            </View>
          </View>

          {features.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <View style={styles.featureInfo}>
                <View style={[styles.iconContainer, { backgroundColor: `${feature.color}20` }]}>
                  <feature.icon size={20} color={feature.color} />
                </View>
                <Text style={styles.featureTitle}>{feature.title}</Text>
              </View>
              
              <View style={styles.comparisonColumn}>
                {feature.free ? (
                  <Text style={styles.freeText}>{feature.free}</Text>
                ) : (
                  <X size={16} color="#EF4444" />
                )}
              </View>
              
              <View style={styles.comparisonColumn}>
                <View style={styles.premiumFeature}>
                  <Check size={16} color="#10B981" />
                  <Text style={styles.premiumFeatureText}>
                    {typeof feature.premium === 'string' ? feature.premium : '✓'}
                  </Text>
                </View>
              </View>
            </View>
          ))}

          {/* Pricing */}
          <View style={styles.pricingSection}>
            <Text style={styles.sectionTitle}>Välj din plan</Text>
            
            <View style={styles.pricingCard}>
              <View style={styles.pricingHeader}>
                <Crown size={24} color="#FFD700" />
                <Text style={styles.pricingTitle}>StudyFlow Premium</Text>
              </View>
              
              <View style={styles.pricingContent}>
                <Text style={styles.price}>99 kr</Text>
                <Text style={styles.pricePeriod}>per månad</Text>
              </View>
              
              <View style={styles.pricingFeatures}>
                <Text style={styles.pricingFeature}>✓ Alla Premium-funktioner</Text>
                <Text style={styles.pricingFeature}>✓ Obegränsat antal kurser & anteckningar</Text>
                <Text style={styles.pricingFeature}>✓ Avancerad statistik & export</Text>
                <Text style={styles.pricingFeature}>✓ Prioriterad support</Text>
              </View>
              
              <TouchableOpacity
                style={styles.upgradeButton}
                onPress={handleUpgrade}
              >
                <Text style={styles.upgradeButtonText}>Uppgradera nu</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* FAQ */}
          <View style={styles.faqSection}>
            <Text style={styles.sectionTitle}>Vanliga frågor</Text>
            
            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>Kan jag avbryta när som helst?</Text>
              <Text style={styles.faqAnswer}>
                Ja, du kan avbryta din prenumeration när som helst. Du behåller Premium-funktionerna till slutet av din betalperiod.
              </Text>
            </View>
            
            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>Vad händer med min data om jag avbryter?</Text>
              <Text style={styles.faqAnswer}>
                All din data sparas säkert. Du kan fortfarande komma åt dina kurser och anteckningar, men med begränsningar enligt gratisplanen.
              </Text>
            </View>
            
            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>Finns det en gratis provperiod?</Text>
              <Text style={styles.faqAnswer}>
                Ja! Du får 7 dagar gratis när du uppgraderar till Premium första gången.
              </Text>
            </View>
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
  header: {
    padding: 32,
    paddingTop: 60,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 22,
  },
  premiumTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 16,
    marginBottom: 8,
  },
  premiumSubtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  comparisonHeader: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  comparisonColumn: {
    flex: 1,
    alignItems: 'center',
  },
  comparisonTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  premiumText: {
    color: '#4F46E5',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  featureInfo: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    flex: 1,
  },
  freeText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  premiumFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  premiumFeatureText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
  pricingSection: {
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  pricingCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#4F46E5',
  },
  pricingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 8,
  },
  pricingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  pricingContent: {
    alignItems: 'center',
    marginBottom: 24,
  },
  price: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  pricePeriod: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: -8,
  },
  pricingFeatures: {
    marginBottom: 24,
  },
  pricingFeature: {
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 8,
    lineHeight: 24,
  },
  upgradeButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  benefitsSection: {
    marginTop: 20,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  benefitContent: {
    flex: 1,
    marginLeft: 12,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  faqSection: {
    marginTop: 32,
    marginBottom: 32,
  },
  faqItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
});