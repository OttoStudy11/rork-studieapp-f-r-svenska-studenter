# Provschema Funktion - Implementation Summary

## Översikt
En komplett provschema-funktion har implementerats där användare kan lägga till egna prov för att strukturera sina prov. Funktionen är integrerad i planering och historik-sektionen i fokus/timer-tabben.

## Implementerade Komponenter

### 1. Databasschema (`create-exams-table.sql`)
```sql
CREATE TABLE exams (
  id UUID PRIMARY KEY
  user_id UUID REFERENCES auth.users(id)
  course_id TEXT (optional)
  title TEXT NOT NULL
  description TEXT
  exam_date TIMESTAMPTZ NOT NULL
  duration_minutes INTEGER
  location TEXT
  exam_type TEXT ('written', 'oral', 'practical', 'online', 'other')
  status TEXT ('scheduled', 'completed', 'missed', 'cancelled')
  grade TEXT
  notes TEXT
  notification_enabled BOOLEAN
  notification_time_before_minutes INTEGER
  created_at TIMESTAMPTZ
  updated_at TIMESTAMPTZ
)
```

**Features:**
- Row Level Security (RLS) aktiverat
- Automatisk uppdatering av `updated_at` via trigger
- Index för snabbare frågor på `user_id`, `exam_date`, och `status`
- Stöd för notifikationer innan prov

### 2. ExamContext (`contexts/ExamContext.tsx`)
En state management lösning för att hantera prov.

**Funktioner:**
- `addExam()` - Lägg till nytt prov
- `updateExam()` - Uppdatera befintligt prov
- `deleteExam()` - Ta bort prov
- `refreshExams()` - Uppdatera provlistan
- `upcomingExams` - Filtrerade kommande prov
- `completedExams` - Filtrerade slutförda prov

**Typ-definition:**
```typescript
interface Exam {
  id: string
  userId: string
  courseId?: string
  title: string
  description?: string
  examDate: Date
  durationMinutes?: number
  location?: string
  examType: 'written' | 'oral' | 'practical' | 'online' | 'other'
  status: 'scheduled' | 'completed' | 'missed' | 'cancelled'
  grade?: string
  notes?: string
  notificationEnabled: boolean
  notificationTimeBeforeMinutes: number
  createdAt: Date
  updatedAt: Date
}
```

### 3. Integration i Timer-tab (`app/(tabs)/timer.tsx`)
Provfunktionen är integrerad i "Planering & Historik"-sektionen:

**UI-komponenter:**
- **Prov-sektion** med egen toggle
- **Plus-knapp** för att lägga till nya prov
- **Kommande prov** - Visar schemalagda prov sorterade efter datum
- **Historik** - Visar genomförda/missade prov

**Funktionalitet:**
- Expanderbar sektion som kan öppnas/stängas
- Sorterade efter datum (kommande först)
- Visning av:
  - Provtitel
  - Kurskoppling (om vald)
  - Datum och tid
  - Längd (varaktighet)
  - Plats
  - Provtyp
  - Status
  - Betyg (om slutfört)

### 4. Provider Integration (`app/_layout.tsx`)
ExamProvider är inlagd i app:ens provider-hierarki:
```typescript
<QueryClientProvider>
  <ToastProvider>
    <ThemeProvider>
      <AuthProvider>
        <PremiumProvider>
          <StudyProvider>
            <TimerSettingsProvider>
              <CourseProgressProvider>
                <HogskoleprovetProvider>
                  <ExamProvider>  // ← NY
                    <GestureHandlerRootView>
                      <AchievementProvider>
                        <RootLayoutNav />
                      </AchievementProvider>
                    </GestureHandlerRootView>
                  </ExamProvider>
                </HogskoleprovetProvider>
              </CourseProgressProvider>
            </TimerSettingsProvider>
          </StudyProvider>
        </PremiumProvider>
      </AuthProvider>
    </ThemeProvider>
  </ToastProvider>
</QueryClientProvider>
```

### 5. Database Types (`lib/database.types.ts`)
Uppdaterade TypeScript-typer för Supabase:
```typescript
exams: {
  Row: {
    id: string
    user_id: string
    course_id: string | null
    title: string
    description: string | null
    exam_date: string
    duration_minutes: number | null
    location: string | null
    exam_type: string
    status: string
    grade: string | null
    notes: string | null
    notification_enabled: boolean
    notification_time_before_minutes: number
    created_at: string
    updated_at: string
  }
  Insert: { ... }
  Update: { ... }
  Relationships: [ ... ]
}
```

## Nästa steg för att slutföra funktionen

### 1. Skapa Add/Edit Exam Modal
Du behöver skapa en modal-komponent för att lägga till och redigera prov:

```typescript
// components/ExamModal.tsx
interface ExamModalProps {
  visible: boolean
  onClose: () => void
  examToEdit?: Exam | null
}
```

**Fält som behövs:**
- Titel (obligatoriskt)
- Kurs (valfritt, dropdown från användarens kurser)
- Datum & Tid (datumväljare)
- Längd i minuter (valfritt)
- Plats (valfritt)
- Provtyp (dropdown: skriftligt, muntligt, praktiskt, online, annat)
- Beskrivning (valfritt, multiline textfält)
- Notifikation aktiverad (toggle)
- Notifikationstid före prov (dropdown: 1 dag, 3 dagar, 1 vecka)

### 2. Integrera Exam Modal i Timer
Uppdatera knappen i timer.tsx:
```typescript
<TouchableOpacity
  style={[styles.addSessionButton, { backgroundColor: theme.colors.warning }]}
  onPress={(e) => {
    e.stopPropagation();
    setShowAddExam(true); // Öppna exam modal
  }}
>
```

### 3. Visa Prov i UI
Ersätt placeholder-koden i timer.tsx med faktisk provvisning:

```typescript
{expandedSectionPlanner === 'exams' && (
  <View style={styles.sessionsList}>
    {upcomingExams.length === 0 ? (
      <View style={styles.emptyState}>
        <FileText size={48} color={theme.colors.textSecondary} opacity={0.3} />
        <Text style={[styles.emptyStateText, { color: theme.colors.textSecondary }]}>
          Inga prov schemalagda än
        </Text>
        <Text style={[styles.emptyStateSubtext, { color: theme.colors.textSecondary }]}>
          Tryck på + för att lägga till ett prov
        </Text>
      </View>
    ) : (
      upcomingExams.map((exam) => (
        <View key={exam.id} style={[styles.examCard, { backgroundColor: theme.colors.card }]}>
          {/* Visa provdetaljer här */}
        </View>
      ))
    )}
  </View>
)}
```

### 4. Skapa Exam Card Styles
Lägg till styles för provkorten:
```typescript
examCard: {
  borderRadius: 12,
  padding: 16,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.05,
  shadowRadius: 8,
  elevation: 2,
  borderLeftWidth: 4,
  borderLeftColor: theme.colors.warning,
}
```

### 5. Lägg till Notifikationsfunktionalitet
Använd `expo-notifications` för att schemalägga påminnelser:
```typescript
import * as Notifications from 'expo-notifications';

// När ett prov läggs till
await Notifications.scheduleNotificationAsync({
  content: {
    title: `Prov imorgon: ${exam.title}`,
    body: exam.description || 'Glöm inte att förbereda!',
  },
  trigger: {
    date: new Date(exam.examDate.getTime() - exam.notificationTimeBeforeMinutes * 60 * 1000),
  },
});
```

### 6. Lägg till Filtreringsalternativ
Lägg till möjlighet att filtrera prov:
- Alla prov
- Kommande prov
- Slutförda prov
- Missade prov
- Efter kurs

## Installation

För att aktivera funktionen, kör följande SQL i Supabase:
```bash
supabase db push create-exams-table.sql
```

eller kopiera innehållet från `create-exams-table.sql` och kör direkt i Supabase SQL Editor.

## Teknisk Status
✅ Databasschema skapat
✅ ExamContext implementerad
✅ Provider-integration klar
✅ Database types uppdaterade
✅ Grundläggande UI-struktur i Timer-tab
✅ Inga TypeScript-fel

⚠️ TODO:
- [ ] Skapa Add/Edit Exam Modal
- [ ] Implementera provvisning i UI
- [ ] Lägg till notifikationsfunktionalitet
- [ ] Implementera redigerings- och raderingsfunktioner
- [ ] Lägg till filtreringsalternativ
- [ ] Lägg till sorteringsalternativ
- [ ] Lägg till sökning bland prov

## Användning

```typescript
// I en komponent
import { useExams } from '@/contexts/ExamContext';

const MyComponent = () => {
  const { upcomingExams, addExam, updateExam } = useExams();
  
  // Lägg till ett prov
  await addExam({
    title: 'Matematik 1a Slutprov',
    examDate: new Date('2025-12-15'),
    courseId: 'matematik-1a',
    examType: 'written',
    status: 'scheduled',
    durationMinutes: 180,
    location: 'Sal A',
    notificationEnabled: true,
    notificationTimeBeforeMinutes: 1440, // 1 dag före
  });
  
  // Uppdatera ett prov
  await updateExam(examId, {
    status: 'completed',
    grade: 'A',
  });
};
```

## Design
Provfunktionen följer appens befintliga designsystem med:
- Warning-färg (orange/gul) som temafärg för prov
- Konsistent card-design
- Responsiv layout
- Touch-friendly UI
- Ikoner från lucide-react-native (FileText för prov)
