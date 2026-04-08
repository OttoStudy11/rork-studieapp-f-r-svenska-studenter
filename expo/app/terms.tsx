import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { ArrowLeft } from 'lucide-react-native';
import { Stack, useRouter } from 'expo-router';
import { FadeInView } from '@/components/Animations';

export default function TermsScreen() {
  const router = useRouter();
  const { theme, isDark } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Användarvillkor',
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
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ padding: 8, marginLeft: -8 }}
              activeOpacity={0.7}
            >
              <ArrowLeft size={24} color={theme.colors.text} />
            </TouchableOpacity>
          ),
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
          <View style={[styles.header, { backgroundColor: theme.colors.primary + '12' }]}>
            <Text style={styles.headerEmoji}>📋</Text>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
              Användarvillkor
            </Text>
            <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
              StudieStugan UF
            </Text>
            <Text style={[styles.headerDate, { color: theme.colors.textMuted }]}>
              Senast uppdaterad: 8 april 2026
            </Text>
          </View>
        </FadeInView>

        <View style={styles.content}>
          <FadeInView delay={100}>
            <Section title="1. Allmänt" theme={theme}>
              <Text style={[styles.bodyText, { color: theme.colors.text }]}>
                Dessa användarvillkor ('Villkoren') gäller för din användning av appen StudieStugan ('Tjänsten'). Genom att använda Tjänsten accepterar du dessa Villkor i sin helhet.
              </Text>
              <Text style={[styles.bodyText, { color: theme.colors.text }]}>
                StudieStugan UF är ett ungdomsföretag som utvecklar studieverktyg för svenska studenter.
              </Text>
              <InfoRow label="Företag" value="StudieStugan UF" theme={theme} />
              <InfoRow label="E-post" value="studiestuganuf@hotmail.com" theme={theme} />
            </Section>
          </FadeInView>

          <FadeInView delay={150}>
            <Section title="2. Användarkonto" theme={theme}>
              <BulletPoint text="Du måste vara minst 13 år för att använda Tjänsten" theme={theme} />
              <BulletPoint text="Du ansvarar för att hålla ditt konto säkert" theme={theme} />
              <BulletPoint text="Du får inte dela dina inloggningsuppgifter med andra" theme={theme} />
              <BulletPoint text="Du ansvarar för all aktivitet som sker på ditt konto" theme={theme} />
              <BulletPoint text="Vi förbehåller oss rätten att stänga av konton som bryter mot dessa Villkor" theme={theme} />
            </Section>
          </FadeInView>

          <FadeInView delay={200}>
            <Section title="3. Tjänstens innehåll" theme={theme}>
              <Text style={[styles.bodyText, { color: theme.colors.text }]}>
                StudieStugan erbjuder följande funktioner:
              </Text>
              <BulletPoint text="Fokustimer med Pomodoro-teknik för studiesessioner" theme={theme} />
              <BulletPoint text="AI-driven hjälp med matte och allmänna studiefrågor" theme={theme} />
              <BulletPoint text="Kursplanering och studieinsikter" theme={theme} />
              <BulletPoint text="Högskoleprovsövningar" theme={theme} />
              <BulletPoint text="Flashcards och studieverktyg" theme={theme} />
              <BulletPoint text="Gemenskap och utmaningar med andra studenter" theme={theme} />
            </Section>
          </FadeInView>

          <FadeInView delay={250}>
            <Section title="4. Premium-prenumeration" theme={theme}>
              <BulletPoint text="Vissa funktioner kräver en aktiv Premium-prenumeration" theme={theme} />
              <BulletPoint text="Prenumerationen förnyas automatiskt om den inte avslutas" theme={theme} />
              <BulletPoint text="Du kan avsluta din prenumeration när som helst via App Store eller Google Play" theme={theme} />
              <BulletPoint text="Vi erbjuder ingen återbetalning för redan förbrukade perioder" theme={theme} />
              <BulletPoint text="Priser och funktioner kan komma att ändras med förvarning" theme={theme} />
            </Section>
          </FadeInView>

          <FadeInView delay={300}>
            <Section title="5. AI-funktioner" theme={theme}>
              <Text style={[styles.bodyText, { color: theme.colors.text }]}>
                Appen innehåller AI-drivna funktioner som assisterar med studier. Det är viktigt att förstå:
              </Text>
              <BulletPoint text="AI-svaren är förslag och kan innehålla felaktigheter" theme={theme} />
              <BulletPoint text="AI är inte en ersättning för din lärare eller lärobok" theme={theme} />
              <BulletPoint text="Du ansvarar själv för att kontrollera informationens korrekthet" theme={theme} />
              <BulletPoint text="Fäll inte AI-svaren ordagrant i skolarbeten — det är plagiat" theme={theme} />
              <BulletPoint text="Använd AI som ett hjälpmedel för att förstå, inte som genväg" theme={theme} />
            </Section>
          </FadeInView>

          <FadeInView delay={350}>
            <Section title="6. Användarbeteende" theme={theme}>
              <Text style={[styles.bodyText, { color: theme.colors.text }]}>
                Du förbinder dig att inte:
              </Text>
              <BulletPoint text="Använda Tjänsten för olagliga ändamål" theme={theme} />
              <BulletPoint text="Försöka hacka, manipulera eller störa Tjänstens funktion" theme={theme} />
              <BulletPoint text="Dela olämpligt, stötande eller kränkande innehåll i gemenskapsfunktionen" theme={theme} />
              <BulletPoint text="Använda Tjänsten för att fuska på prov eller examinationer" theme={theme} />
              <BulletPoint text="Skapa falska konton eller missbruka Tjänsten på annat sätt" theme={theme} />
            </Section>
          </FadeInView>

          <FadeInView delay={400}>
            <Section title="7. Immateriella rättigheter" theme={theme}>
              <Text style={[styles.bodyText, { color: theme.colors.text }]}>
                StudieStugan och dess innehåll (inklusive design, grafik, text och kod) ägs av StudieStugan UF. Du får inte kopiera, modifiera, distribuera eller sälja någon del av Tjänsten utan skriftligt godkännande.
              </Text>
            </Section>
          </FadeInView>

          <FadeInView delay={450}>
            <Section title="8. Ansvarsbegränsning" theme={theme}>
              <Text style={[styles.bodyText, { color: theme.colors.text }]}>
                StudieStugan UF tillhandahåller Tjänsten 'i befintligt skick'. Vi garanterar inte att Tjänsten alltid är tillgänglig, felfri eller lämplig för ett specifikt syfte.
              </Text>
              <Text style={[styles.bodyText, { color: theme.colors.text }]}>
                Vi ansvarar inte för direkta eller indirekta skador som uppstår genom användning av Tjänsten, inklusive men inte begränsat till förlorade studieresultat, felaktig information från AI, eller avbrott i tjänsten.
              </Text>
            </Section>
          </FadeInView>

          <FadeInView delay={500}>
            <Section title="9. Ändringar av Villkoren" theme={theme}>
              <Text style={[styles.bodyText, { color: theme.colors.text }]}>
                Vi förbehåller oss rätten att ändra dessa Villkor. Vid väsentliga ändringar meddelar vi dig via appen eller e-post. Fortsatt användning av Tjänsten efter sådant meddelande innebär att du accepterar de nya Villkoren.
              </Text>
            </Section>
          </FadeInView>

          <FadeInView delay={550}>
            <Section title="10. Uppsägning och radering" theme={theme}>
              <BulletPoint text="Du kan när som helst radera ditt konto via Inställningar i appen" theme={theme} />
              <BulletPoint text="Vid radering tas all din data bort permanent" theme={theme} />
              <BulletPoint text="Vi kan stänga av konton som bryter mot dessa Villkor utan förvarning" theme={theme} />
            </Section>
          </FadeInView>

          <FadeInView delay={600}>
            <Section title="11. Tillämplig lag" theme={theme}>
              <Text style={[styles.bodyText, { color: theme.colors.text }]}>
                Dessa Villkor regleras av svensk lag. Tvister ska i första hand lösas genom dialog med oss. Om det inte går kan tvisten prövas av allmän domstol i Sverige med svensk lag som tillämplig lag.
              </Text>
            </Section>
          </FadeInView>

          <FadeInView delay={650}>
            <Section title="12. Kontakt" theme={theme}>
              <Text style={[styles.bodyText, { color: theme.colors.text }]}>
                Frågor om dessa Villkor? Kontakta oss:
              </Text>
              <InfoRow label="E-post" value="studiestuganuf@hotmail.com" theme={theme} />
            </Section>
          </FadeInView>

          <View style={styles.spacer} />

          <FadeInView delay={700}>
            <View style={[styles.footerBox, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
              <Text style={[styles.footerText, { color: theme.colors.textMuted }]}>
                StudieStugan UF
              </Text>
              <Text style={[styles.footerText, { color: theme.colors.textMuted }]}>
                studiestuganuf@hotmail.com
              </Text>
            </View>
          </FadeInView>

          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>
    </View>
  );
}

function Section({ title, theme, children }: { title: string; theme: any; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{title}</Text>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );
}

function BulletPoint({ text, theme }: { text: string; theme: any }) {
  return (
    <View style={styles.bulletRow}>
      <Text style={[styles.bullet, { color: theme.colors.primary }]}>•</Text>
      <Text style={[styles.bulletText, { color: theme.colors.text }]}>{text}</Text>
    </View>
  );
}

function InfoRow({ label, value, theme }: { label: string; value: string; theme: any }) {
  return (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>{label}: </Text>
      <Text style={[styles.infoValue, { color: theme.colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
  },
  header: {
    marginHorizontal: 20,
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  headerEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 15,
    marginBottom: 4,
    textAlign: 'center',
  },
  headerDate: {
    fontSize: 12,
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 10,
  },
  sectionContent: {
    backgroundColor: 'transparent',
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 4,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  bullet: {
    fontSize: 14,
    fontWeight: '700',
    marginRight: 8,
    marginTop: 3,
  },
  bulletText: {
    fontSize: 14,
    lineHeight: 22,
    flex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    flexWrap: 'wrap',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 14,
  },
  spacer: {
    height: 16,
  },
  footerBox: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  footerText: {
    fontSize: 13,
    textAlign: 'center',
  },
  bottomSpacer: {
    height: 40,
  },
});
