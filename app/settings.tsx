import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  StatusBar
} from 'react-native';
import { useTheme, ThemeMode } from '@/contexts/ThemeContext';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from '@/contexts/AuthContext';
import { usePremium } from '@/contexts/PremiumContext';
import { Moon, Sun, Smartphone, Palette, Bell, Shield, HelpCircle, LogOut, User, Crown, Star, ChevronRight } from 'lucide-react-native';
import { router, Stack } from 'expo-router';
import { AnimatedPressable, FadeInView } from '@/components/Animations';

interface SettingItem {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onPress: () => void;
  isThemeSelector?: boolean;
  hasSwitch?: boolean;
  switchValue?: boolean;
}

export default function SettingsScreen() {
  const { theme, themeMode, setThemeMode, isDark } = useTheme();
  const { showSuccess, showInfo } = useToast();
  const { user, signOut } = useAuth();
  const { isPremium } = usePremium();

  const themeOptions: { mode: ThemeMode; label: string; icon: React.ReactNode }[] = [
    { mode: 'light', label: 'Ljust', icon: <Sun size={20} color={theme.colors.textSecondary} /> },
    { mode: 'dark', label: 'Mörkt', icon: <Moon size={20} color={theme.colors.textSecondary} /> },
    { mode: 'system', label: 'Systemets', icon: <Smartphone size={20} color={theme.colors.textSecondary} /> },
  ];

  const handleThemeChange = (mode: ThemeMode) => {
    setThemeMode(mode);
    showSuccess('Tema uppdaterat', `Bytte till ${mode === 'light' ? 'ljust' : mode === 'dark' ? 'mörkt' : 'systemets'} tema`);
  };

  const handleSignOut = () => {
    Alert.alert(
      'Logga ut',
      'Är du säker på att du vill logga ut?',
      [
        {
          text: 'Avbryt',
          style: 'cancel',
        },
        {
          text: 'Logga ut',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              showSuccess('Utloggad', 'Du har loggats ut');
            } catch (error) {
              console.error('Sign out error:', error);
              showInfo('Fel', 'Kunde inte logga ut');
            }
          },
        },
      ]
    );
  };

  const settingsSections: { title: string; items: SettingItem[] }[] = [
    {
      title: 'Premium',
      items: [
        {
          icon: isPremium ? <Crown size={20} color={theme.colors.warning} /> : <Star size={20} color={theme.colors.primary} />,
          title: isPremium ? 'Premium aktiv' : 'Uppgradera till Premium',
          subtitle: isPremium ? 'Du har tillgång till alla funktioner' : 'Lås upp obegränsade funktioner',
          onPress: () => router.push('/premium'),
        },
      ],
    },
    {
      title: 'Utseende',
      items: [
        {
          icon: <Palette size={20} color={theme.colors.textSecondary} />,
          title: 'Tema',
          subtitle: `Nuvarande: ${themeMode === 'light' ? 'Ljust' : themeMode === 'dark' ? 'Mörkt' : 'Systemets'}`,
          onPress: () => {},
          isThemeSelector: true,
        },
      ],
    },
    {
      title: 'Notifikationer',
      items: [
        {
          icon: <Bell size={20} color={theme.colors.textSecondary} />,
          title: 'Push-notifikationer',
          subtitle: 'Få påminnelser om studiesessioner',
          onPress: () => showInfo('Kommer snart', 'Notifikationer kommer i nästa uppdatering'),
          hasSwitch: true,
          switchValue: false,
        },
      ],
    },
    {
      title: 'Säkerhet & Integritet',
      items: [
        {
          icon: <Shield size={20} color={theme.colors.textSecondary} />,
          title: 'Integritetspolicy',
          subtitle: 'Läs om hur vi hanterar din data',
          onPress: () => showInfo('Integritetspolicy', 'Din data är säker hos oss och delas aldrig med tredje part.'),
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          icon: <HelpCircle size={20} color={theme.colors.textSecondary} />,
          title: 'Hjälp & Support',
          subtitle: 'Få hjälp med appen',
          onPress: () => showInfo('Support', 'Kontakta oss på support@studiestugan.se för hjälp'),
        },
      ],
    },
    {
      title: 'Kontoinställningar',
      items: [
        {
          icon: <LogOut size={20} color={theme.colors.error || '#EF4444'} />,
          title: 'Logga ut',
          subtitle: 'Logga ut från ditt konto',
          onPress: handleSignOut,
        },
      ],
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen 
        options={{ 
          headerShown: true,
          headerTitle: 'Inställningar',
          headerTitleStyle: {
            color: theme.colors.text,
            fontSize: 18,
            fontWeight: '600' as const,
          },
          headerStyle: {
            backgroundColor: theme.colors.background,
          },
          headerTintColor: theme.colors.primary,
          headerShadowVisible: false,
        }} 
      />
      <StatusBar 
        barStyle={isDark ? 'light-content' : 'dark-content'} 
        backgroundColor={theme.colors.background}
      />
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <FadeInView>
          <View style={styles.userSection}>
            <View style={[styles.userCard, { backgroundColor: theme.colors.card }]}>
              <View style={[styles.avatarContainer, { backgroundColor: theme.colors.primary + '15' }]}>
                <User size={32} color={theme.colors.primary} />
              </View>
              <View style={styles.userInfo}>
                <Text style={[styles.userName, { color: theme.colors.text }]}>{user?.email?.split('@')[0] || 'Användare'}</Text>
                <Text style={[styles.userEmail, { color: theme.colors.textSecondary }]}>{user?.email || 'Okänd användare'}</Text>
              </View>
              {isPremium && (
                <View style={[styles.premiumBadgeSmall, { backgroundColor: theme.colors.warning + '20' }]}>
                  <Crown size={14} color={theme.colors.warning} />
                  <Text style={[styles.premiumBadgeText, { color: theme.colors.warning }]}>Pro</Text>
                </View>
              )}
            </View>
          </View>
        </FadeInView>

        {settingsSections.map((section, sectionIndex) => (
          <FadeInView key={`section-${sectionIndex}-${section.title}`} delay={sectionIndex * 100}>
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
                {section.title}
              </Text>
              
              <View style={[styles.sectionCard, { backgroundColor: theme.colors.card }]}>
                {section.items.map((item, itemIndex) => (
                  <View key={`item-${sectionIndex}-${itemIndex}-${item.title}`}>
                    {item.isThemeSelector ? (
                      <View>
                        <View style={styles.settingItem}>
                          <View style={[styles.settingIconCircle, { backgroundColor: theme.colors.primaryLight }]}>
                            {item.icon}
                          </View>
                          <View style={styles.settingContent}>
                            <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
                              {item.title}
                            </Text>
                            <Text style={[styles.settingSubtitle, { color: theme.colors.textSecondary }]}>
                              {item.subtitle}
                            </Text>
                          </View>
                        </View>
                        
                        <View style={styles.themeOptions}>
                          {themeOptions.map((option, optionIndex) => (
                            <AnimatedPressable
                              key={`theme-${optionIndex}-${option.mode}`}
                              style={[
                                styles.themeOption,
                                {
                                  backgroundColor: themeMode === option.mode 
                                    ? theme.colors.primaryLight 
                                    : theme.colors.background,
                                  borderColor: themeMode === option.mode 
                                    ? theme.colors.primary 
                                    : theme.colors.border,
                                },
                              ]}
                              onPress={() => handleThemeChange(option.mode)}
                            >
                              {option.icon}
                              <Text style={[
                                styles.themeOptionText,
                                {
                                  color: themeMode === option.mode 
                                    ? theme.colors.primary 
                                    : theme.colors.textSecondary,
                                  fontWeight: themeMode === option.mode ? '600' : '400',
                                },
                              ]}>
                                {option.label}
                              </Text>
                            </AnimatedPressable>
                          ))}
                        </View>
                      </View>
                    ) : (
                      <AnimatedPressable
                        style={styles.settingItem}
                        onPress={item.onPress}
                      >
                        <View style={[styles.settingIconCircle, { backgroundColor: theme.colors.primaryLight }]}>
                          {item.icon}
                        </View>
                        <View style={styles.settingContent}>
                          <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
                            {item.title}
                          </Text>
                          <Text style={[styles.settingSubtitle, { color: theme.colors.textSecondary }]}>
                            {item.subtitle}
                          </Text>
                        </View>
                        {item.hasSwitch ? (
                          <Switch
                            value={item.switchValue}
                            onValueChange={() => item.onPress()}
                            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                            thumbColor={item.switchValue ? theme.colors.surface : theme.colors.textMuted}
                          />
                        ) : (
                          <ChevronRight size={20} color={theme.colors.textMuted} />
                        )}
                      </AnimatedPressable>
                    )}
                    
                    {itemIndex < section.items.length - 1 && (
                      <View style={[styles.separator, { backgroundColor: theme.colors.borderLight }]} />
                    )}
                  </View>
                ))}
              </View>
            </View>
          </FadeInView>
        ))}

        <FadeInView delay={700}>
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.colors.textMuted }]}>
              Studiestugan v1.0.0
            </Text>
            <Text style={[styles.footerText, { color: theme.colors.textMuted }]}>
              Gjord med ❤️ för svenska studenter
            </Text>
          </View>
        </FadeInView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 40,
  },
  userSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
    textTransform: 'capitalize' as const,
  },
  userEmail: {
    fontSize: 14,
  },
  premiumBadgeSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  premiumBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  sectionCard: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    minHeight: 72,
  },
  settingIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    lineHeight: 18,
  },
  separator: {
    height: 1,
    marginLeft: 72,
  },
  themeOptions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  themeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    gap: 8,
  },
  themeOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    padding: 24,
    gap: 4,
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
  },
});