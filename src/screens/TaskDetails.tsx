import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  ToastAndroid,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { RootState } from './../store/store';
import { deleteTask, toggleTaskStatus } from './../store/features/taskSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { capitalizeFirstChar, formatDueDate } from '../utils/utils';

type Props = NativeStackScreenProps<RootStackParamList, 'TaskDetails'>;

const TaskDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { taskId } = route.params;
  const dispatch = useAppDispatch();

  // Find the task from Redux store using the ID from route params
  const task = useAppSelector((state: RootState) =>
    state.task.tasks.find(t => t.id === taskId)
  );

  // Return to Previous Screen When task undefined
  if (!task) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Task not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.goBackBtn}>
          <Text style={styles.goBackText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Confirm deletion and dispatch deleteTask action
  const handleDelete = () => {
    Alert.alert(
      '🗑️ Confirm Delete',
      'Are you sure you want to delete this task? This action cannot be undone.',
      [
        { text: 'No, Cancel', style: 'cancel' },
        {
          text: 'Yes, Delete',
          style: 'destructive',
          onPress: () => {
            dispatch(deleteTask(task.id));

            // Show feedback after deletion
            if (Platform.OS === 'android') {
              ToastAndroid.show('Task deleted successfully', ToastAndroid.LONG);
            } else {
              Alert.alert('Deleted', 'Task deleted successfully');
            }
            navigation.goBack();
          },
        },
      ],
      { cancelable: true }
    );
  };

  // Toggle task status (completed/incomplete)
  const handleToggleStatus = () => {
    dispatch(toggleTaskStatus(task.id));
    if (Platform.OS === 'android') {
      ToastAndroid.show('Task status updated successfully', ToastAndroid.LONG);
    } else {
      Alert.alert('Status Update', 'Task status updated successfully');
    }
  };

  return (
    <View style={styles.container}>
      {/* Task Title */}
      <Text style={styles.title}>{capitalizeFirstChar(task.title)}</Text>

      {/* Task Description */}
      <View style={styles.metaRow}>
        <Icon name="document-text-outline" size={18} color="#555" />
        <Text style={styles.description}>
          {capitalizeFirstChar(task.description) || 'No description provided.'}
        </Text>
      </View>

      {/* Due Date */}
      <View style={styles.metaRow}>
        <Icon name="calendar-outline" size={18} color="#555" />
        <Text style={styles.metaText}>{formatDueDate(task.dueDate)}</Text>
      </View>

      {/* Priority */}
      <View style={styles.metaRow}>
        <Icon name="funnel-outline" size={18} color="#555" />
        <Text style={styles.metaText}>Priority: {task.priority}</Text>
      </View>

      {/* Status */}
      <View style={styles.metaRow}>
        <Icon
          name={task.completed ? 'checkmark-circle' : 'close-circle'}
          size={18}
          color={task.completed ? '#2ecc71' : '#e74c3c'}
        />
        <Text style={styles.metaText}>
          {task.completed ? 'Completed' : 'Incomplete'}
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        {/* Toggle Status */}
        <TouchableOpacity
          style={[styles.button, styles.statusButton]}
          onPress={handleToggleStatus}
        >
          <Icon
            name={task.completed ? 'close-circle-outline' : 'checkmark-circle-outline'}
            size={18}
            color="#fff"
          />
          <Text style={styles.buttonText}>
            Mark as {task.completed ? 'Incomplete' : 'Completed'}
          </Text>
        </TouchableOpacity>

        {/* Edit Task */}
        <TouchableOpacity
          style={[styles.button, styles.editButton]}
          onPress={() => navigation.navigate('TaskForm', { taskId: task.id })}
        >
          <Icon name="create-outline" size={18} color="#fff" />
          <Text style={styles.buttonText}>Edit Task</Text>
        </TouchableOpacity>

        {/* Delete Task */}
        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={handleDelete}
        >
          <Icon name="trash-outline" size={18} color="#fff" />
          <Text style={styles.buttonText}>Delete Task</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default TaskDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  metaText: {
    marginLeft: 8,
    fontSize: 15,
    color: '#444',
  },
  actions: {
    marginTop: 30,
    gap: 14,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 6,
    justifyContent: 'center',
  },
  statusButton: {
    backgroundColor: '#6c757d',
  },
  editButton: {
    backgroundColor: '#007bff',
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
  },
  buttonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
    marginLeft: 8,
  },
   goBackBtn: {
    marginTop: 16,
    alignSelf: 'center',
    padding: 12,
    backgroundColor: '#007bff',
    borderRadius: 8,
  },
  goBackText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
