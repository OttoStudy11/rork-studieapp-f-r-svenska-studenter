import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Search, Check } from 'lucide-react-native';
import { onboardingStyles as styles } from './styles';
import { StepProps, ACCENT, TEXT3 } from './shared';
import { SWEDISH_GYMNASIUMS } from '@/constants/gymnasiums';
import { SWEDISH_UNIVERSITIES, UNIVERSITY_PROGRAMS } from '@/constants/universities';
import type { GymnasiumCourse } from '@/constants/gymnasium-courses';
import type { UniversityProgramYear } from '@/constants/universities';
import { MAX_COURSES } from '@/lib/course-assignment';
import KomvuxSchoolStep from './KomvuxSchoolStep';

export default function SchoolStep(props: StepProps): React.ReactElement {
  const {
    data,
    setData,
    availableCourses,
    gymnasiumSearch,
    setGymnasiumSearch,
    universitySearch,
    setUniversitySearch,
    komvuxSubjectFilter,
    setKomvuxSubjectFilter,
  } = props;

  if (data.studyLevel === 'komvux') {
    return (
      <KomvuxSchoolStep
        data={data}
        setData={setData}
        komvuxSubjectFilter={komvuxSubjectFilter}
        setKomvuxSubjectFilter={setKomvuxSubjectFilter}
      />
    );
  }

  if (data.studyLevel === 'gymnasie') {
    return (
      <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
        <Text style={styles.questionTitle}>Vilket program går du?</Text>

        <View style={{ gap: 10, marginTop: 8 }}>
          {[
            { id: 'na', name: 'Naturvetenskap', emoji: '🔬' },
            { id: 'te', name: 'Teknik', emoji: '⚙️' },
            { id: 'sa', name: 'Samhällsvetenskap', emoji: '🏛️' },
            { id: 'ek', name: 'Ekonomi', emoji: '💼' },
            { id: 'es', name: 'Estetiska', emoji: '🎨' },
            { id: 'hu', name: 'Humanistiska', emoji: '📚' },
          ].map((p) => {
            const sel = data.gymnasiumProgram?.id === p.id;
            return (
              <TouchableOpacity
                key={p.id}
                style={[styles.optionCard, sel && styles.optionCardSel]}
                onPress={() =>
                  setData({
                    ...data,
                    gymnasiumProgram: {
                      id: p.id,
                      name: p.name + 'programmet',
                      abbreviation: p.id.toUpperCase(),
                      category: 'högskoleförberedande',
                    },
                  })
                }
                activeOpacity={0.75}
              >
                <Text style={styles.optionEmoji}>{p.emoji}</Text>
                <Text style={[styles.optionLabel, sel && styles.optionLabelSel]}>
                  {p.name}
                </Text>
                {sel && (
                  <View style={styles.optionCheck}>
                    <Check size={13} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {data.gymnasiumProgram && (
          <>
            <Text style={[styles.questionTitle, { marginTop: 28 }]}>Vilken årskurs?</Text>
            <View style={styles.yearRow}>
              {[1, 2, 3].map((y) => (
                <TouchableOpacity
                  key={y}
                  style={[styles.yearBtn, data.year === y && styles.yearBtnSel]}
                  onPress={() => setData({ ...data, year: y as 1 | 2 | 3 })}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.yearBtnText,
                      data.year === y && styles.yearBtnTextSel,
                    ]}
                  >
                    År {y}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {data.year && availableCourses.length > 0 && (
          <>
            <Text style={[styles.questionTitle, { marginTop: 28 }]}>Välj dina kurser</Text>
            <Text style={styles.pageSubtitle}>
              {data.selectedCourses.size}/{MAX_COURSES} valda
            </Text>
            {availableCourses.map((course: GymnasiumCourse) => {
              const sel = data.selectedCourses.has(course.id);
              return (
                <TouchableOpacity
                  key={course.id}
                  style={[styles.courseRow, sel && styles.courseRowSel]}
                  onPress={() => {
                    const ns = new Set(data.selectedCourses);
                    if (ns.has(course.id)) {
                      if (!course.mandatory) ns.delete(course.id);
                    } else if (ns.size < MAX_COURSES) ns.add(course.id);
                    setData({ ...data, selectedCourses: ns });
                  }}
                  activeOpacity={0.75}
                >
                  <View style={[styles.smallCheck, sel && styles.smallCheckOn]}>
                    {sel && <Check size={11} color="#fff" />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.courseTitle, sel && { color: ACCENT }]}>
                      {course.name}
                    </Text>
                    {course.mandatory && (
                      <Text style={styles.mandTag}>Obligatorisk</Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </>
        )}

        <Text style={[styles.questionTitle, { marginTop: 28 }]}>Gymnasium (valfritt)</Text>
        <View style={styles.searchRow}>
          <Search size={16} color={TEXT3} />
          <TextInput
            style={styles.searchInput}
            placeholder="Sök gymnasium..."
            placeholderTextColor={TEXT3}
            value={gymnasiumSearch}
            onChangeText={setGymnasiumSearch}
          />
        </View>
        {gymnasiumSearch.length > 0 &&
          SWEDISH_GYMNASIUMS.filter((g) =>
            g.name.toLowerCase().includes(gymnasiumSearch.toLowerCase())
          )
            .slice(0, 8)
            .map((g) => {
              const sel = data.gymnasium?.id === g.id;
              return (
                <TouchableOpacity
                  key={g.id}
                  style={[styles.listItem, sel && styles.listItemSel]}
                  onPress={() => setData({ ...data, gymnasium: g })}
                  activeOpacity={0.7}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.listItemTitle, sel && { color: ACCENT }]}>
                      {g.name}
                    </Text>
                    <Text style={styles.listItemSub}>{g.city}</Text>
                  </View>
                  {sel && <Check size={15} color={ACCENT} />}
                </TouchableOpacity>
              );
            })}
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
      <Text style={styles.questionTitle}>Vilken programtyp?</Text>
      <View style={{ gap: 10, marginTop: 8 }}>
        {[
          { type: 'civilingenjör', name: 'Civilingenjör', emoji: '⚙️' },
          { type: 'högskoleingenjör', name: 'Högskoleingenjör', emoji: '🔧' },
          { type: 'professionsprogram', name: 'Professionsprogram', emoji: '🎓' },
          { type: 'kandidat', name: 'Kandidatprogram', emoji: '📚' },
          { type: 'yrkeshögskola', name: 'Yrkeshögskola', emoji: '💼' },
        ].map((pt) => {
          const sel = data.universityProgramType === pt.type;
          return (
            <TouchableOpacity
              key={pt.type}
              style={[styles.optionCard, sel && styles.optionCardSel]}
              onPress={() =>
                setData({
                  ...data,
                  universityProgramType: pt.type,
                  universityProgram: null,
                  universityYear: null,
                })
              }
              activeOpacity={0.75}
            >
              <Text style={styles.optionEmoji}>{pt.emoji}</Text>
              <Text style={[styles.optionLabel, sel && styles.optionLabelSel]}>
                {pt.name}
              </Text>
              {sel && (
                <View style={styles.optionCheck}>
                  <Check size={13} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {data.universityProgramType && (
        <>
          <Text style={[styles.questionTitle, { marginTop: 28 }]}>Välj program</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginTop: 8 }}
          >
            {UNIVERSITY_PROGRAMS.filter(
              (p) => p.degreeType === data.universityProgramType
            ).map((prog) => {
              const sel = data.universityProgram?.id === prog.id;
              return (
                <TouchableOpacity
                  key={prog.id}
                  style={[styles.hChip, sel && styles.hChipSel]}
                  onPress={() =>
                    setData({
                      ...data,
                      universityProgram: prog,
                      universityYear: null,
                    })
                  }
                  activeOpacity={0.75}
                >
                  <Text
                    style={[styles.hChipText, sel && styles.hChipTextSel]}
                    numberOfLines={1}
                  >
                    {prog.name.replace(
                      /^(Civilingenjör|Högskoleingenjör|Kandidatprogram i) - ?/,
                      ''
                    )}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </>
      )}

      {data.universityProgram && (
        <>
          <Text style={[styles.questionTitle, { marginTop: 28 }]}>Vilken termin?</Text>
          <View style={[styles.yearRow, { flexWrap: 'wrap', gap: 8 }]}>
            {Array.from(
              { length: Math.min(data.universityProgram.durationYears * 2, 10) },
              (_, i) => i + 1
            ).map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.yearBtn, data.universityYear === t && styles.yearBtnSel]}
                onPress={() =>
                  setData({ ...data, universityYear: t as UniversityProgramYear })
                }
                activeOpacity={0.75}
              >
                <Text
                  style={[
                    styles.yearBtnText,
                    data.universityYear === t && styles.yearBtnTextSel,
                  ]}
                >
                  T{t}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      <Text style={[styles.questionTitle, { marginTop: 28 }]}>
        Högskola / Universitet (valfritt)
      </Text>
      <View style={styles.searchRow}>
        <Search size={16} color={TEXT3} />
        <TextInput
          style={styles.searchInput}
          placeholder="Sök högskola..."
          placeholderTextColor={TEXT3}
          value={universitySearch}
          onChangeText={setUniversitySearch}
        />
      </View>
      {universitySearch.length > 0 &&
        SWEDISH_UNIVERSITIES.filter(
          (u) =>
            u.name.toLowerCase().includes(universitySearch.toLowerCase()) ||
            u.city.toLowerCase().includes(universitySearch.toLowerCase())
        )
          .slice(0, 8)
          .map((u) => {
            const sel = data.university?.id === u.id;
            return (
              <TouchableOpacity
                key={u.id}
                style={[styles.listItem, sel && styles.listItemSel]}
                onPress={() => setData({ ...data, university: u })}
                activeOpacity={0.7}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.listItemTitle, sel && { color: ACCENT }]}>
                    {u.name}
                  </Text>
                  <Text style={styles.listItemSub}>{u.city}</Text>
                </View>
                {sel && <Check size={15} color={ACCENT} />}
              </TouchableOpacity>
            );
          })}
    </ScrollView>
  );
}
