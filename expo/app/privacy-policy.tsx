import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { ArrowLeft } from 'lucide-react-native';
import { Stack, useRouter } from 'expo-router';
import { FadeInView } from '@/components/Animations';

export default function PrivacyPolicyScreen() {
  const router = useRouter();
  const { theme, isDark } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Integritetspolicy',
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
            <Text style={[styles.headerEmoji]}>🔒</Text>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
              Integritetspolicy
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
            <Section
              title="1. Ansvarigt företag"
              theme={theme}
            >
              <Text style={[styles.bodyText, { color: theme.colors.text }]}>
                StudieStugan UF ('vi', 'oss', 'vår') är ansvarig för denna app och dina personuppgifter.
              </Text>
              <InfoRow label="Företag" value="StudieStugan UF" theme={theme} />
              <InfoRow label="E-post" value="studiestuganuf@hotmail.com" theme={theme} />
            </Section>
          </FadeInView>

          <FadeInView delay={150}>
            <Section title="2. Vilka uppgifter samlar vi in?" theme={theme}>
              <Text style={[styles.bodyText, { color: theme.colors.text }]}>
                Vi samlar in följande uppgifter när du använder appen:
              </Text>
              <BulletPoint text="E-postadress — för konto och inloggning" theme={theme} />
              <BulletPoint text="Studiedata — sessioner, kurser, fokustider och poäng" theme={theme} />
              <BulletPoint text="Användningsdata — hur du använder appen för att förbättra den" theme={theme} />
              <BulletPoint text="Enhetsinformation — enhetstyp och operativsystem för teknikstöd" theme={theme} />
              <Text style={[styles.bodyText, { color: theme.colors.text, marginTop: 8 }]}>
                Vi samlar aldrig in känslig personuppgifter såsom hälsodata, politisk åskådning eller liknande.
              </Text>
            </Section>
          </FadeInView>

          <FadeInView delay={200}>
            <Section title="3. Hur vi använder dina uppgifter" theme={theme}>
              <BulletPoint text="Tillhandahålla StudieStugans funktioner (timer, AI-chatt, kursplanering)" theme={theme} />
              <BulletPoint text="Förbättra och utveckla appen" theme={theme} />
              <BulletPoint text="Hantera ditt konto och prenumeration" theme={theme} />
              <BulletPoint text="Skicka relevant information om appen (t.ex. uppdateringar)" theme={theme} />
              <BulletPoint text="Förhindra missbruk och upprätthålla säkerhet" theme={theme} />
            </Section>
          </FadeInView>

          <FadeInView delay={250}>
            <Section title="4. Tjänsteleverantörer" theme={theme}>
              <Text style={[styles.bodyText, { color: theme.colors.text }]}>
                Vi använder följande tjänster som kan komma åt din data:
              </Text>
              <SubBulletPoint title="Supabase" desc="Databas och autentisering (Sverige/EU)" theme={theme} />
              <SubBulletPoint title="RevenueCat" desc="Hantering av prenumerationer (USA, med GDPR-avtal)" theme={theme} />
              <SubBulletPoint title="OpenAI" desc="AI-chattfunktionen (USA, med GDPR-avtal, meddelanden sparas ej)" theme={theme} />
              <Text style={[styles.bodyText, { color: theme.colors.text, marginTop: 8 }]}>
                Alla leverantörer är bundna av databearbetningsavtal enligt GDPR.
              </Text>
            </Section>
          </FadeInView>

          <FadeInView delay={300}>
            <Section title="5. Hur länge sparar vi data?" theme={theme}>
              <BulletPoint text="Kontodata sparas så länge ditt konto är aktivt" theme={theme} />
              <BulletPoint text="Studiedata sparas tills du raderar ditt konto eller begär borttagning" theme={theme} />
              <BulletPoint text="Användningsloggar raderas automatiskt efter 90 dagar" theme={theme} />
            </Section>
          </FadeInView>

          <FadeInView delay={350}>
            <Section title="6. Dina rättigheter enligt GDPR" theme={theme}>
              <Text style={[styles.bodyText, { color: theme.colors.text }]}>
                Enligt EU:s dataskyddsförordning (GDPR) har du rätt att:
              </Text>
              <BulletPoint text="Begära tillgång till dina personuppgifter (artikel 15)" theme={theme} />
              <BulletPoint text="Begära rättelse av felaktiga uppgifter (artikel 16)" theme={theme} />
              <BulletPoint text="Begära radering av dina uppgifter (artikel 17)" theme={theme} />
              <BulletPoint text="Invända mot bearbetning (artikel 21)" theme={theme} />
              <BulletPoint text="Begära dataportabilitet (artikel 20)" theme={theme} />
              <BulletPoint text="Dra tillbaka samtycke (artikel 7)" theme={theme} />
              <Text style={[styles.bodyText, { color: theme.colors.text, marginTop: 8 }]}>
                Du kan också radera ditt konto direkt i appen under Inställningar → Radera konto.
              </Text>
            </Section>
          </FadeInView>

          <FadeInView delay={400}>
            <Section title="7. Datasäkerhet" theme={theme}>
              <Text style={[styles.bodyText, { color: theme.colors.text }]}>
                Vi vidtar lämpliga tekniska och organisatoriska åtgärder för att skydda dina uppgifter, inklusive kryptering vid överföring och lagring, samt åtkomstkontroller. Trots detta kan ingen digital lagring vara 100 % säker.
              </Text>
            </Section>
          </FadeInView>

          <FadeInView delay={450}>
            <Section title="8. Kakor och liknande tekniker" theme={theme}>
              <Text style={[styles.bodyText, { color: theme.colors.text }]}>
                Appen använder endast nödvändiga tekniker för att fungera (t.ex. inloggning och sessionshantering). Vi använder inte spårningskakor från tredje part.
              </Text>
            </Section>
          </FadeInView>

          <FadeInView delay={500}>
            <Section title="9. Barns integritet" theme={theme}>
              <Text style={[styles.bodyText, { color: theme.colors.text }]}>
                StudieStugan är riktad till ungdomar och studenter. Om du är under 13 år får du inte använda appen utan förälders medgivande. För användare under 16 år krävs förälders godkännande enligt GDPR. Vi samlar inte medvetet in uppgifter från barn under 13 år utan sådant godkännande.
              </Text>
            </Section>
          </FadeInView>

          <FadeInView delay={550}>
            <Section title="10. Ändringar i policyn" theme={theme}>
              <Text style={[styles.bodyText, { color: theme.colors.text }]}>
                Vi kan uppdatera denna integritetspolicy från tid till annan. Vi meddelar dig om väsentliga ändringar via appen eller e-post. Senaste versionen finns alltid tillgänglig i appen.
              </Text>
            </Section>
          </FadeInView>

          <FadeInView delay={600}>
            <Section title="11. Kontakt" theme={theme}>
              <Text style={[styles.bodyText, { color: theme.colors.text }]}>
                Om du har frågor om denna integritetspolicy eller vill utöva dina rättigheter, kontakta oss:
              </Text>
              <InfoRow label="E-post" value="studiestuganuf@hotmail.com" theme={theme} />
              <Text style={[styles.bodyText, { color: theme.colors.textSecondary, marginTop: 12, fontStyle: 'italic' }]}>
                Vi svarar inom 30 dagar enligt GDPR.
              </Text>
            </Section>
          </FadeInView>

          <View style={styles.spacer} />

          <FadeInView delay={650}>
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

function SubBulletPoint({ title, desc, theme }: { title: string; desc: string; theme: any }) {
  return (
    <View style={styles.bulletRow}>
      <Text style={[styles.bullet, { color: theme.colors.primary }]}>•</Text>
      <Text style={[styles.bulletText, { color: theme.colors.text }]}>
        <Text style={{ fontWeight: '600' as const }}>{title}</Text>{' — '}{desc}
      </Text>
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
