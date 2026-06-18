import React from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check } from 'lucide-react-native';
import { onboardingStyles as styles } from './styles';
import { StepProps, ACCENT, TEXT3 } from './shared';

export default function ProfileStep({
  data,
  setData,
  usernameAvailable,
  checkingUsername,
  checkUsername,
}: StepProps): React.ReactElement {
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={styles.page}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>Bra jobbat! 🎉</Text>
        <Text style={styles.pageSubtitle}>
          Tusentals studenter har förbättrat sina resultat. Låt oss skapa din profil.
        </Text>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Vad heter du?</Text>
          <TextInput
            style={styles.input}
            placeholder="Ditt namn"
            placeholderTextColor={TEXT3}
            value={data.displayName}
            onChangeText={(t) => setData({ ...data, displayName: t })}
            maxLength={50}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Välj användarnamn</Text>
          <View style={styles.usernameRow}>
            <Text style={styles.atSign}>@</Text>
            <TextInput
              style={[styles.input, { flex: 1, borderLeftWidth: 0, borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }]}
              placeholder="användarnamn"
              placeholderTextColor={TEXT3}
              value={data.username}
              onChangeText={(t) => {
                const clean = t.toLowerCase().replace(/[^a-z0-9_]/g, '');
                setData({ ...data, username: clean });
                if (clean.length >= 3) checkUsername(clean);
              }}
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={20}
            />
            <View style={styles.usernameStatus}>
              {checkingUsername && <ActivityIndicator size="small" color={TEXT3} />}
              {usernameAvailable === true && <Check size={16} color={ACCENT} />}
              {usernameAvailable === false && (
                <Text style={{ color: '#EF4444', fontSize: 12 }}>✕</Text>
              )}
            </View>
          </View>
          {usernameAvailable === false && (
            <Text style={styles.errorTxt}>Användarnamnet är inte tillgängligt</Text>
          )}
          <Text style={styles.hintTxt}>3–20 tecken, bokstäver, siffror och _</Text>
        </View>

        <TouchableOpacity
          style={styles.termsRow}
          onPress={() => setData({ ...data, acceptedTerms: !data.acceptedTerms })}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, data.acceptedTerms && styles.checkboxOn]}>
            {data.acceptedTerms && <Check size={12} color="#fff" />}
          </View>
          <Text style={styles.termsText}>
            Jag godkänner användarvillkoren och bekräftar att jag är minst 13 år
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
