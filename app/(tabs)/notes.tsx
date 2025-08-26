import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Modal,
  Alert
} from 'react-native';
import { useStudy } from '@/contexts/StudyContext';
import { StickyNote, Plus, Search, X, Edit3, Trash2, BookOpen } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function NotesScreen() {
  const { notes, courses, addNote, updateNote, deleteNote } = useStudy();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [newNote, setNewNote] = useState({
    content: '',
    courseId: ''
  });

  const filteredNotes = notes.filter(note =>
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddNote = async () => {
    if (!newNote.content.trim()) {
      Alert.alert('Fel', 'Skriv något i anteckningen');
      return;
    }

    try {
      await addNote({
        content: newNote.content,
        courseId: newNote.courseId || undefined
      });
      setNewNote({ content: '', courseId: '' });
      setShowAddModal(false);
    } catch (error) {
      Alert.alert('Fel', 'Kunde inte spara anteckning');
    }
  };

  const handleUpdateNote = async (noteId: string, content: string) => {
    try {
      await updateNote(noteId, { content });
      setEditingNote(null);
    } catch (error) {
      Alert.alert('Fel', 'Kunde inte uppdatera anteckning');
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    Alert.alert(
      'Ta bort anteckning',
      'Är du säker på att du vill ta bort denna anteckning?',
      [
        { text: 'Avbryt', style: 'cancel' },
        {
          text: 'Ta bort',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteNote(noteId);
            } catch (error) {
              Alert.alert('Fel', 'Kunde inte ta bort anteckning');
            }
          }
        }
      ]
    );
  };

  const getCourseTitle = (courseId?: string) => {
    if (!courseId) return 'Allmän anteckning';
    const course = courses.find(c => c.id === courseId);
    return course ? course.title : 'Okänd kurs';
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Anteckningar</Text>
        <Text style={styles.headerSubtitle}>Samla dina tankar</Text>
      </LinearGradient>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Sök anteckningar..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Plus size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Notes List */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredNotes.length > 0 ? (
          filteredNotes.map((note) => (
            <View key={note.id} style={styles.noteCard}>
              <View style={styles.noteHeader}>
                <View style={styles.noteInfo}>
                  <Text style={styles.courseTitle}>{getCourseTitle(note.courseId)}</Text>
                  <Text style={styles.noteDate}>
                    {new Date(note.createdAt).toLocaleDateString('sv-SE', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Text>
                </View>
                <View style={styles.noteActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => setEditingNote(note.id)}
                  >
                    <Edit3 size={16} color="#6B7280" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDeleteNote(note.id)}
                  >
                    <Trash2 size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
              
              {editingNote === note.id ? (
                <EditNoteForm
                  initialContent={note.content}
                  onSave={(content) => handleUpdateNote(note.id, content)}
                  onCancel={() => setEditingNote(null)}
                />
              ) : (
                <Text style={styles.noteContent}>{note.content}</Text>
              )}
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <StickyNote size={64} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>
              {searchQuery ? 'Inga anteckningar hittades' : 'Inga anteckningar än'}
            </Text>
            <Text style={styles.emptyText}>
              {searchQuery 
                ? 'Prova att söka på något annat'
                : 'Skapa din första anteckning för att komma igång'
              }
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Add Note Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Ny anteckning</Text>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Kurs (valfritt)</Text>
              <View style={styles.courseSelector}>
                <TouchableOpacity
                  style={[
                    styles.courseOption,
                    !newNote.courseId && styles.courseOptionActive
                  ]}
                  onPress={() => setNewNote({ ...newNote, courseId: '' })}
                >
                  <Text style={[
                    styles.courseOptionText,
                    !newNote.courseId && styles.courseOptionTextActive
                  ]}>Allmän</Text>
                </TouchableOpacity>
                {courses.map((course) => (
                  <TouchableOpacity
                    key={course.id}
                    style={[
                      styles.courseOption,
                      newNote.courseId === course.id && styles.courseOptionActive
                    ]}
                    onPress={() => setNewNote({ ...newNote, courseId: course.id })}
                  >
                    <Text style={[
                      styles.courseOptionText,
                      newNote.courseId === course.id && styles.courseOptionTextActive
                    ]}>{course.title}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Anteckning</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Skriv din anteckning här..."
                value={newNote.content}
                onChangeText={(text) => setNewNote({ ...newNote, content: text })}
                multiline
                numberOfLines={8}
                textAlignVertical="top"
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowAddModal(false)}
            >
              <Text style={styles.cancelButtonText}>Avbryt</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.saveButton,
                !newNote.content.trim() && styles.saveButtonDisabled
              ]}
              onPress={handleAddNote}
              disabled={!newNote.content.trim()}
            >
              <Text style={styles.saveButtonText}>Spara</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

// Edit Note Form Component
function EditNoteForm({ 
  initialContent, 
  onSave, 
  onCancel 
}: { 
  initialContent: string;
  onSave: (content: string) => void;
  onCancel: () => void;
}) {
  const [content, setContent] = useState(initialContent);

  return (
    <View style={styles.editForm}>
      <TextInput
        style={[styles.input, styles.editTextArea]}
        value={content}
        onChangeText={setContent}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        autoFocus
      />
      <View style={styles.editActions}>
        <TouchableOpacity
          style={styles.editCancelButton}
          onPress={onCancel}
        >
          <Text style={styles.editCancelText}>Avbryt</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.editSaveButton}
          onPress={() => onSave(content)}
        >
          <Text style={styles.editSaveText}>Spara</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 24,
    paddingTop: 60,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: -20,
    marginBottom: 20,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  addButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  noteCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  noteInfo: {
    flex: 1,
  },
  courseTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
    marginBottom: 4,
  },
  noteDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  noteActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  noteContent: {
    fontSize: 14,
    color: '#1F2937',
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    padding: 48,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: 'white',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  courseSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  courseOption: {
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  courseOptionActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  courseOptionText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  courseOptionTextActive: {
    color: 'white',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    color: '#1F2937',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  // Edit form styles
  editForm: {
    marginTop: 8,
  },
  editTextArea: {
    height: 80,
    marginBottom: 12,
  },
  editActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editCancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
  },
  editCancelText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  editSaveButton: {
    flex: 1,
    backgroundColor: '#4F46E5',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
  },
  editSaveText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
  },
});