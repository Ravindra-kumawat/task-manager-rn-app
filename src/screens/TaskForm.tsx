import React, { useLayoutEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  Alert,
  ToastAndroid,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { addTask, editTask } from '../store/features/taskSlice';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Task } from './../store/types';
import { formatSelectedDate } from '../utils/utils';

type Props = NativeStackScreenProps<RootStackParamList, 'TaskForm'>;

const TaskFormScreen: React.FC<Props> = ({ route, navigation }) => {
  const dispatch = useAppDispatch();
  const { taskId } = route.params || {};
  const editing = !!taskId;

  const existingTask = useAppSelector(state =>
    state.task.tasks.find(t => t.id === taskId)
  );

  const [title, setTitle] = useState(existingTask?.title || '');
  const [titleError, setTitleError] = useState('');
  const [description, setDescription] = useState(existingTask?.description || '');
  const [dueDate, setDueDate] = useState<Date>(
    existingTask ? new Date(existingTask.dueDate) : new Date()
  );
  const [dueDateError, setDueDateError] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [priority, setPriority] = useState<Task['priority']>(
    existingTask?.priority || 'Low'
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      title: editing ? 'Edit Task' : 'Add Task',
    });
  }, [navigation, editing]);

  const validate = () => {
    let valid = true;
    if (!title.trim()) {
      setTitleError('Title is required');
      valid = false;
    }
    if (!dueDate) {
      setDueDateError('Due Date is required');
      valid = false;
    }
    return valid;
  };

  const handleSave = () => {
    if (!validate()) return;

    const payload: Task = {
      id: editing ? existingTask!.id : Date.now(),
      title: title.trim(),
      description: description.trim(),
      dueDate: dueDate.toISOString(),
      priority,
      completed: existingTask?.completed || false,
    };

    editing ? dispatch(editTask(payload)) : dispatch(addTask(payload));
    navigation.goBack();

    Platform.OS === 'android'
      ? ToastAndroid.show(`${editing ? 'Task updated' : 'New task added'} successfully`, ToastAndroid.SHORT)
      : Alert.alert('Success', `${editing ? 'Task updated' : 'New task added'} successfully`);
  };

  const handleDateChange = (_: any, selectedDate?: Date) => {
    if (selectedDate) setDueDate(selectedDate);
    setShowDatePicker(false);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, padding: 16 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Text style={styles.label}>
          Title <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, titleError && styles.errorInput]}
          placeholder="Enter task title"
          placeholderTextColor="#999"
          value={title}
          onChangeText={(text) => {
            setTitle(text);
            if (titleError && text.trim()) setTitleError('');
          }}
          onBlur={() => {
            if (!title.trim()) setTitleError('Title is required');
          }}
        />
        {titleError && <Text style={styles.errorText}>{titleError}</Text>}

        {/* Description */}
        <Text style={styles.label}>Description</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Enter description..."
          placeholderTextColor="#999"
          multiline
          numberOfLines={6}
          style={[styles.input, styles.textArea]}
        />

        {/* Due Date */}
        <Text style={styles.label}>
          Due Date <Text style={styles.required}>*</Text>
        </Text>
        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          style={[styles.input, styles.dateInput]}
        >
          <Text>{formatSelectedDate(dueDate.toDateString())}</Text>
        </TouchableOpacity>
        {dueDateError && <Text style={styles.errorText}>{dueDateError}</Text>}
        {showDatePicker && (
          <DateTimePicker
            value={dueDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}

        {/* Priority */}
        <Text style={styles.label}>
          Priority <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.radioGroup}>
          {['Low', 'Medium', 'High'].map((p) => (
            <TouchableOpacity
              key={p}
              style={styles.radioItem}
              onPress={() => setPriority(p as Task['priority'])}
            >
              <View style={styles.radioCircle}>
                {priority === p && <View style={styles.radioDot} />}
              </View>
              <Text style={styles.radioLabel}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>
            {editing ? 'Update Task' : 'Create Task'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default TaskFormScreen;

const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    marginBottom: 6,
    fontWeight: '500',
  },
  required: {
    color: 'red',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 6,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  errorInput: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    marginTop: -8,
    marginBottom: 10,
    fontSize: 13,
  },
  dateInput: {
    justifyContent: 'center',
  },
  textArea: {
    height: 200,
    textAlignVertical: 'top',
  },
  radioGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#007bff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: '#007bff',
  },
  radioLabel: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#007bff',
    padding: 14,
    borderRadius: 6,
    marginTop: 20,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
