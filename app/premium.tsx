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
import { 
  Crown, 
  Check, 
  BarChart3, 
  ArrowLeft,
  Shield,
  Clock
} from 'lucide-react-native';

export default function PremiumScreen() {
  const { isPremium, upgradeToPremium } = usePremium();

  const features = [
    {
      icon: BarChart3,
      title: 'Statistik',
      description: 'Analysera din produktivitet med detaljerade grafer',
      gradient: ['#4F46E5', '#7C3AED'] as const
    },
    {
      icon: Shield,
      title: 'App Blockering',
      description: 'Blockera appar under fokussessioner',
      gradient: ['#10B981', '#059669'] as const
    },
    {
      icon: Clock,
      title: 'Avancerade Timers',
      description: 'Få tillgång till pomodoro & stopwatch timers',
      gradient: ['#F59E0B', '#D97706'] as const
    }
  ];

  const handleUpgrade = async () => {
    await upgradeToPremium();
  };

  if (isPremium) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <ArrowLeft size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Crown size={60} color="#FFD700" />
            <Text style={styles.premiumTitle}>Du är Premium!</Text>
            <Text style={styles.premiumSubtitle}>
              Tack för att du stödjer Studiestugan
            </Text>
          </View>

          <ScrollView style={styles.scrollContent}>
            <View style={styles.benefitsSection}>
              <Text style={styles.sectionTitle}>Dina Premium-fördelar</Text>
              {features.map((feature, index) => (
                <View key={index} style={styles.benefitItem}>
                  <LinearGradient
                    colors={feature.gradient}
                    style={styles.iconContainer}
                  >
                    <feature.icon size={24} color="#FFFFFF" />
                  </LinearGradient>
                  <View style={styles.benefitContent}>
                    <Text style={styles.benefitTitle}>{feature.title}</Text>
                    <Text style={styles.benefitDescription}>
                      {feature.description}
                    </Text>
                  </View>
                  <Check size={20} color="#10B981" />
                </View>
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <ArrowLeft size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.title}>Studiestugan Pro</Text>
          </View>

          {/* Pricing Cards */}
          <View style={styles.pricingContainer}>
            {/* Monthly Plan */}
            <View style={styles.pricingCard}>
              <View style={styles.pricingContent}>
                <Text style={styles.price}>39,00 kr</Text>
                <Text style={styles.pricePeriod}>/month</Text>
              </View>
              <Text style={styles.trialText}>3-day Free trial</Text>
            </View>

            {/* Yearly Plan - Featured */}
            <View style={[styles.pricingCard, styles.featuredCard]}>
              <View style={styles.dealBadge}>
                <Text style={styles.dealText}>LIMITED DEAL - 50% OFF</Text>
              </View>
              <View style={styles.pricingContent}>
                <View style={styles.yearlyPriceContainer}>
                  <Text style={styles.yearlyPrice}>129,00 kr</Text>
                </View>
                <Text style={styles.pricePeriod}>/year</Text>
              </View>
              <Text style={styles.trialText}>7-day Free trial</Text>
            </View>
          </View>

          {/* Features */}
          <View style={styles.featuresContainer}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <LinearGradient
                  colors={feature.gradient}
                  style={styles.featureIcon}
                >
                  <feature.icon size={32} color="#FFFFFF" />
                </LinearGradient>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* No Payment Due */}
          <View style={styles.noPaymentContainer}>
            <Check size={20} color="#10B981" />
            <Text style={styles.noPaymentText}>NO PAYMENT DUE NOW</Text>
          </View>

          {/* CTA Button */}
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={handleUpgrade}
          >
            <Text style={styles.ctaButtonText}>TRY FOR FREE</Text>
          </TouchableOpacity>

          {/* Footer Links */}
          <View style={styles.footerLinks}>
            <Text style={styles.footerLink}>Privacy</Text>
            <Text style={styles.footerLink}>Terms</Text>
            <Text style={styles.footerLink}>Restore Purchases</Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1B23',
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    alignItems: 'center',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 20,
  },
  pricingContainer: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  pricingCard: {
    backgroundColor: '#2A2B35',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#3A3B47',
  },
  featuredCard: {
    borderColor: '#10B981',
    borderWidth: 2,
    position: 'relative',
  },
  dealBadge: {
    position: 'absolute',
    top: -1,
    left: -1,
    right: -1,
    backgroundColor: '#10B981',
    paddingVertical: 8,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    alignItems: 'center',
  },
  dealText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  pricingContent: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 8,
    marginTop: 20,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  yearlyPriceContainer: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  yearlyPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  pricePeriod: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  trialText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'right',
  },
  featuresContainer: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  featureIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 16,
    color: '#9CA3AF',
    lineHeight: 22,
  },
  noPaymentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 8,
  },
  noPaymentText: {
    fontSize: 16,
    color: '#10B981',
    fontWeight: '600',
  },
  ctaButton: {
    backgroundColor: '#10B981',
    marginHorizontal: 20,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 32,
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    paddingHorizontal: 20,
  },
  footerLink: {
    fontSize: 14,
    color: '#9CA3AF',
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
  benefitsSection: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2B35',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  benefitContent: {
    flex: 1,
    marginLeft: 12,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
});