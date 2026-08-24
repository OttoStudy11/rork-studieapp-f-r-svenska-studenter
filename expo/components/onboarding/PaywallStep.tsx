import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Check, Shield, RefreshCw, Sparkles } from 'lucide-react-native';
import type { PurchasesPackage } from 'react-native-purchases';
import { onboardingStyles as styles } from './styles';
import { StepProps, TEXT3 } from './shared';

/**
 * Derives a Swedish free-trial label (e.g. "3 dagar gratis") from the
 * product's real introductory offer via RevenueCat / App Store.
 * Returns null when no free trial is configured, so the UI never
 * displays a trial that doesn't actually exist.
 */
function getFreeTrialText(pkg?: PurchasesPackage): string | null {
  const intro = pkg?.product?.introPrice;
  if (!intro || intro.price !== 0 || !intro.periodNumberOfUnits) return null;
  const units = intro.periodNumberOfUnits;
  switch ((intro.periodUnit ?? '').toUpperCase()) {
    case 'DAY':
      return units === 1 ? '1 dag gratis' : `${units} dagar gratis`;
    case 'WEEK':
      return units === 1 ? '1 vecka gratis' : `${units} veckor gratis`;
    case 'MONTH':
      return units === 1 ? '1 månad gratis' : `${units} månader gratis`;
    case 'YEAR':
      return units === 1 ? '1 år gratis' : `${units} år gratis`;
    default:
      return null;
  }
}

export default function PaywallStep({
  offerings,
  selectedPkg,
  setSelectedPkg,
  isPurchasing,
  isRestoringPurchase,
  onPurchase,
  onRestore,
  onSkip,
}: StepProps): React.ReactElement {
  const insets = useSafeAreaInsets();
  const annualPkg = offerings.find(
    (p) =>
      p.packageType === 'ANNUAL' ||
      p.identifier.includes('annual') ||
      p.identifier.includes('year')
  );
  const monthlyPkg = offerings.find(
    (p) =>
      p.packageType === 'MONTHLY' ||
      p.identifier.includes('monthly') ||
      p.identifier.includes('month')
  );

  const annualPrice = annualPkg?.product?.priceString ?? '299 kr/år';
  const monthlyPrice = monthlyPkg?.product?.priceString ?? '49 kr/mån';
  const annualMonthly = annualPkg
    ? `Endast ${((annualPkg.product?.price ?? 299) / 12).toFixed(0)} kr/månad`
    : 'Endast ~25 kr/månad';

  // Real introductory offer from RevenueCat — null when no free trial is configured
  const trialText = getFreeTrialText(annualPkg);
  const hasTrial = trialText !== null;

  const FEATURES = [
    'Personlig AI-studieplan',
    'Obegränsade AI-flashcards',
    'Högskoleprovet-träning',
    'Svenska kurser & lektioner',
    'Plugga med vänner – Battle',
    'Obegränsade quiz & tester',
    'Avancerad statistik & insikter',
    'Ingen reklam',
  ];

  return (
    <ScrollView
      contentContainerStyle={[styles.paywallPage, { paddingBottom: insets.bottom + 24 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.paywallHeader}>
        <Image
          source={{
            uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/pbslhfzzhi6qdkgkh0jhm',
          }}
          style={styles.paywallLogo}
          contentFit="contain"
        />
        <TouchableOpacity
          onPress={onSkip}
          style={styles.closeBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.paywallTitle}>
        {'Få full tillgång till\nStudieStugan Premium.'}
      </Text>
      <Text style={styles.paywallSub}>Avsluta när du vill.</Text>

      {hasTrial && (
        <View style={styles.trialBanner}>
          <Sparkles size={15} color="#059669" />
          <Text style={styles.trialBannerText}>
            Starta {trialText} · Avsluta när du vill
          </Text>
        </View>
      )}

      <Text style={[styles.bigBody, { textAlign: 'left', marginTop: 12, marginBottom: 20 }]}>
        Vi vill att du ska använda StudieStugan om det{' '}
        <Text style={styles.bold}>verkligen förändrar dina studieresultat</Text>. Välj en plan och kom igång direkt.
      </Text>

      <Text style={styles.featuresSectionTitle}>Allt ingår i Premium:</Text>
      {FEATURES.map((f, i) => (
        <View key={i} style={styles.paywallFeatureRow}>
          <View style={styles.paywallCheck}>
            <Check size={13} color="#fff" />
          </View>
          <Text style={styles.paywallFeatureText}>{f}</Text>
        </View>
      ))}

      <View style={{ gap: 12, marginTop: 28 }}>
        <TouchableOpacity
          style={[styles.pkgCard, selectedPkg === 'annual' && styles.pkgCardSel]}
          onPress={() => setSelectedPkg('annual')}
          activeOpacity={0.85}
        >
          <View style={styles.pkgPopular}>
            <Text style={styles.pkgPopularText}>MEST POPULÄR</Text>
          </View>
          <View style={styles.pkgRow}>
            <View>
              <Text style={styles.pkgTitle}>📦 Årsplan</Text>
              <Text style={styles.pkgSub}>{annualMonthly}</Text>
              {hasTrial && (
                <Text style={styles.pkgTrialText}>Inklusive {trialText}</Text>
              )}
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.pkgPrice}>{annualPrice}</Text>
              <View
                style={[
                  styles.pkgRadio,
                  selectedPkg === 'annual' && styles.pkgRadioSel,
                ]}
              >
                {selectedPkg === 'annual' && <View style={styles.pkgRadioInner} />}
              </View>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.pkgCard, selectedPkg === 'monthly' && styles.pkgCardSel]}
          onPress={() => setSelectedPkg('monthly')}
          activeOpacity={0.85}
        >
          <View style={styles.pkgRow}>
            <View>
              <Text style={styles.pkgTitle}>📦 Månadsplan</Text>
              <Text style={styles.pkgSub}>Förnyas månadsvis</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.pkgPrice}>{monthlyPrice}</Text>
              <View
                style={[
                  styles.pkgRadio,
                  selectedPkg === 'monthly' && styles.pkgRadioSel,
                ]}
              >
                {selectedPkg === 'monthly' && <View style={styles.pkgRadioInner} />}
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.cta, { marginTop: 24 }]}
        onPress={onPurchase}
        disabled={isPurchasing}
        activeOpacity={0.88}
      >
        {isPurchasing ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.ctaText}>
            {selectedPkg === 'annual' && hasTrial
              ? `Starta ${trialText}`
              : 'Kom igång med Premium'}
          </Text>
        )}
      </TouchableOpacity>

      {selectedPkg === 'annual' && hasTrial ? (
        <Text style={styles.ctaTerms}>
          Efter provperioden {annualPrice}. Förnyas automatiskt – avsluta när du vill.
        </Text>
      ) : (
        <Text style={styles.ctaTerms}>Förnyas automatiskt – avsluta när du vill.</Text>
      )}

      <TouchableOpacity
        style={styles.skipPaywallBtn}
        onPress={onSkip}
        activeOpacity={0.7}
      >
        <Text style={styles.skipPaywallText}>Fortsätt utan premium</Text>
      </TouchableOpacity>

      <View style={styles.trustBadges}>
        <View style={styles.trustBadge}>
          <Shield size={14} color={TEXT3} />
          <Text style={styles.trustBadgeText}>Säkra betalningar</Text>
        </View>
        <View style={styles.trustBadge}>
          <RefreshCw size={14} color={TEXT3} />
          <Text style={styles.trustBadgeText}>Avsluta när du vill</Text>
        </View>
      </View>

      <View style={styles.legalLinks}>
        <TouchableOpacity onPress={isRestoringPurchase ? undefined : onRestore}>
          <Text style={styles.legalLink}>
            {isRestoringPurchase ? 'Återställer...' : 'Återställ köp'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.legalSep}>·</Text>
        <TouchableOpacity onPress={() => router.push('/terms' as any)}>
          <Text style={styles.legalLink}>Villkor</Text>
        </TouchableOpacity>
        <Text style={styles.legalSep}>·</Text>
        <TouchableOpacity onPress={() => router.push('/privacy-policy' as any)}>
          <Text style={styles.legalLink}>Integritetspolicy</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
