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

  const task = useAppSelector((state: RootState) =>
    state.task.tasks.find(t => t.id === taskId)
  );

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

            // Show success feedback
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

  const handleToggleStatus = () => {
    dispatch(toggleTaskStatus(task.id));
    if (Platform.OS === 'android') {
      ToastAndroid.show('Task status update successfully', ToastAndroid.LONG);
    } else {
      Alert.alert('Status Update', 'Task status update successfully');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{capitalizeFirstChar(task.title)}</Text>

      <View style={styles.metaRow}>
        <Icon name="document-text-outline" size={18} color="#555" />
        <Text style={styles.description}>
          {capitalizeFirstChar(task.description) || 'No description provided.'}
        </Text>
      </View>

      <View style={styles.metaRow}>
        <Icon name="calendar-outline" size={18} color="#555" />
        <Text style={styles.metaText}>{formatDueDate(task.dueDate)}</Text>
      </View>

      <View style={styles.metaRow}>
        <Icon name="funnel-outline" size={18} color="#555" />
        <Text style={styles.metaText}>Priority: {task.priority}</Text>
      </View>

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

      <View style={styles.actions}>
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

        <TouchableOpacity
          style={[styles.button, styles.editButton]}
          onPress={() => navigation.navigate('TaskForm', { taskId: task.id })}
        >
          <Icon name="create-outline" size={18} color="#fff" />
          <Text style={styles.buttonText}>Edit Task</Text>
        </TouchableOpacity>

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
});
