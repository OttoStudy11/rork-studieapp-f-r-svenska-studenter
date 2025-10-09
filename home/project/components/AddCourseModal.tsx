import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { X, BookOpen } from 'lucide-react-native';

interface AddCourseModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (course: {
    name: string;
    code?: string;
    color: string;
    icon: string;
    totalHours: number;
    year?: 1 | 2 | 3;
    points?: number;
    mandatory?: boolean;
    category?: 'gymnasiegemensam' | 'programgemensam' | 'inriktning' | 'programfördjupning' | 'individuellt val';
  }) => Promise<void>;
  currentYear?: 1 | 2 | 3;
}

const courseColors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
  '#F8B195', '#F67280', '#C06C84', '#6C5CE7', '#A29BFE',
];

const categories = [
  { value: 'gymnasiegemensam' as const, label: 'Gymnasiegemensam' },
  { value: 'programgemensam' as const, label: 'Programgemensam' },
  { value: 'inriktning' as const, label: 'Inriktning' },
  { value: 'programfördjupning' as const, label: 'Programfördjupning' },
  { value: 'individuellt val' as const, label: 'Individuellt val' },
];

export default function AddCourseModal({ visible, onClose, onAdd, currentYear }: AddCourseModalProps) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [points, setPoints] = useState('100');
  const [selectedColor, setSelectedColor] = useState(courseColors[0]);
  const [selectedCategory, setSelectedCategory] = useState<typeof categories[number]['value']>('individuellt val');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Fel', 'Kursnamn krävs');
      return;
    }

    const pointsNum = parseInt(points) || 100;
    if (pointsNum <= 0) {
      Alert.alert('Fel', 'Poäng måste vara större än 0');
      return;
    }

    setIsSubmitting(true);
    try {
      await onAdd({
        name: name.trim(),
        code: code.trim() || undefined,
        color: selectedColor,
        icon: 'BookOpen',
        totalHours: Math.ceil(pointsNum / 10),
        year: currentYear,
        points: pointsNum,
        mandatory: false,
        category: selectedCategory,
      });

      setName('');
      setCode('');
      setPoints('100');
      setSelectedColor(courseColors[0]);
      setSelectedCategory('individuellt val');
      onClose();
    } catch (error) {
      console.error('Error adding course:', error);
      Alert.alert('Fel', 'Kunde inte lägga till kursen. Försök igen.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Lägg till egen kurs</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#2c3e50" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Kursnamn *</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="t.ex. Programmering 1"
                placeholderTextColor="#95a5a6"
                editable={!isSubmitting}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Kurskod (valfritt)</Text>
              <TextInput
                style={styles.input}
                value={code}
                onChangeText={setCode}
                placeholder="t.ex. PRRPRR01"
                placeholderTextColor="#95a5a6"
                editable={!isSubmitting}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Poäng</Text>
              <TextInput
                style={styles.input}
                value={points}
                onChangeText={setPoints}
                placeholder="100"
                keyboardType="numeric"
                placeholderTextColor="#95a5a6"
                editable={!isSubmitting}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Kategori</Text>
              <View style={styles.categoryContainer}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.value}
                    style={[
                      styles.categoryButton,
                      selectedCategory === cat.value && styles.categoryButtonActive,
                    ]}
                    onPress={() => setSelectedCategory(cat.value)}
                    disabled={isSubmitting}
                  >
                    <Text
                      style={[
                        styles.categoryButtonText,
                        selectedCategory === cat.value && styles.categoryButtonTextActive,
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Färg</Text>
              <View style={styles.colorContainer}>
                {courseColors.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorButton,
                      { backgroundColor: color },
                      selectedColor === color && styles.colorButtonActive,
                    ]}
                    onPress={() => setSelectedColor(color)}
                    disabled={isSubmitting}
                  />
                ))}
              </View>
            </View>

            <View style={styles.previewContainer}>
              <Text style={styles.previewLabel}>Förhandsvisning</Text>
              <View style={[styles.previewCard, { borderLeftColor: selectedColor }]}>
                <View style={[styles.previewIcon, { backgroundColor: selectedColor }]}>
                  <BookOpen size={20} color="#fff" />
                </View>
                <View style={styles.previewInfo}>
                  <Text style={styles.previewName}>{name || 'Kursnamn'}</Text>
                  {code && <Text style={styles.previewCode}>{code}</Text>}
                  <Text style={styles.previewPoints}>{points}p</Text>
                </View>
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={isSubmitting}
            >
              <Text style={styles.cancelButtonText}>Avbryt</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.addButton, isSubmitting && styles.addButtonDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <Text style={styles.addButtonText}>
                {isSubmitting ? 'Lägger till...' : 'Lägg till'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#2c3e50',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#2c3e50',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#2c3e50',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  categoryContainer: {
    gap: 8,
  },
  categoryButton: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  categoryButtonActive: {
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  categoryButtonTextActive: {
    color: '#fff',
  },
  colorContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  colorButtonActive: {
    borderColor: '#2c3e50',
  },
  previewContainer: {
    marginTop: 8,
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#2c3e50',
    marginBottom: 12,
  },
  previewCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
  },
  previewIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  previewInfo: {
    flex: 1,
  },
  previewName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#2c3e50',
    marginBottom: 4,
  },
  previewCode: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  previewPoints: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#4ECDC4',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#7f8c8d',
  },
  addButton: {
    backgroundColor: '#4ECDC4',
  },
  addButtonDisabled: {
    backgroundColor: '#95a5a6',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
  },
});
