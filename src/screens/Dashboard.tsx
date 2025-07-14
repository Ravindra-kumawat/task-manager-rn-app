import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { fetchInitialTasks } from './../store/features/taskSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import Icon from 'react-native-vector-icons/Ionicons';
import TaskCard from '../components/TaskCard';
import EmptyState from '../components/EmptyState';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

// Define colors for task cards
const TaskCardColors = ['#ffe878', '#ff99f7', '#92f1ff', '#a0ffa0'];

const DashboardScreen = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { tasks, loading } = useAppSelector(state => state.task);

  // Filter and sorting state
  const [filter, setFilter] = useState<'all' | 'completed' | 'incomplete'>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority'>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Fetch initial tasks when component mounts
  useEffect(() => {
    dispatch(fetchInitialTasks());
  }, []);

  // Filter tasks based on status
  const filteredTasks = useMemo(() => {
    switch (filter) {
      case 'completed':
        return tasks.filter(t => t.completed);
      case 'incomplete':
        return tasks.filter(t => !t.completed);
      default:
        return tasks;
    }
  }, [tasks, filter]);

  // Sort tasks based on due date or priority
  const sortedTasks = useMemo(() => {
    const priorityValue = (p: string) => (p === 'High' ? 3 : p === 'Medium' ? 2 : 1);

    return [...filteredTasks].sort((a, b) => {
      if (sortBy === 'dueDate') {
        return sortOrder === 'asc'
          ? new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
          : new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
      }

      if (sortBy === 'priority') {
        return sortOrder === 'asc'
          ? priorityValue(a.priority) - priorityValue(b.priority)
          : priorityValue(b.priority) - priorityValue(a.priority);
      }

      return 0;
    });
  }, [filteredTasks, sortBy, sortOrder]);

  // Render individual task item
  const renderItem = ({ item, index }: any) => (
    <TaskCard
      task={item}
      bgColor={TaskCardColors[index % TaskCardColors.length]}
      dotColor={item.completed ? '#2ecc71' : '#e74c3c'}
      showLine={index !== sortedTasks.length - 1}
    />
  );

  // Count task by filter
  const taskCount = {
    all: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    incomplete: tasks.filter(t => !t.completed).length,
  };

  // Show loader while fetching tasks
  if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

  return (
    <View style={styles.container}>
      {/* Filter buttons */}
      <View style={styles.filterRow}>
        {(['all', 'completed', 'incomplete'] as const).map(type => (
          <TouchableOpacity
            key={type}
            onPress={() => setFilter(type)}
            style={[
              styles.filterButton,
              filter === type && styles.activeFilterButton,
            ]}
          >
            <View style={styles.filterButtonContent}>
              <Text
                style={[
                  styles.filterButtonText,
                  filter === type && styles.activeFilterButtonText,
                ]}
              >
                {type.toUpperCase()}
              </Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{taskCount[type]}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Sort buttons */}
      {sortedTasks.length > 0 && (
        <View style={styles.sortRow}>
          <Text>Sort By: </Text>

          {/* Sort by due date */}
          <TouchableOpacity
            onPress={() => {
              setSortBy('dueDate');
              setSortOrder(prev => (sortBy === 'dueDate' && prev === 'asc' ? 'desc' : 'asc'));
            }}
            style={styles.sortButton}
          >
            <Icon
              name="calendar-outline"
              size={20}
              color={sortBy === 'dueDate' ? '#007bff' : '#555'}
            />
            <Text style={styles.sortText}>Due Date</Text>
            {sortBy === 'dueDate' && (
              <Icon name={sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'} size={16} color="#007bff" />
            )}
          </TouchableOpacity>

          {/* Sort by priority */}
          <TouchableOpacity
            onPress={() => {
              setSortBy('priority');
              setSortOrder(prev => (sortBy === 'priority' && prev === 'asc' ? 'desc' : 'asc'));
            }}
            style={styles.sortButton}
          >
            <Icon
              name="funnel-outline"
              size={20}
              color={sortBy === 'priority' ? '#007bff' : '#555'}
            />
            <Text style={styles.sortText}>Priority</Text>
            {sortBy === 'priority' && (
              <Icon name={sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'} size={16} color="#007bff" />
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Task List / Empty State */}
      {sortedTasks.length === 0 ? (
        <EmptyState title='No tasks found' message="Try changing the filter or add new tasks." />
      ) : (
        <FlatList
          data={sortedTasks}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
        />
      )}

      {/* FAB to add new task */}
      <TouchableOpacity
        onPress={() => navigation.navigate('TaskForm')}
        style={styles.fab}
      >
        <Icon name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingBottom: 0,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    marginHorizontal: 5,
    backgroundColor: '#f2f2f2',
  },
  activeFilterButton: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  filterButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#333',
  },
  activeFilterButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  badge: {
    marginLeft: 6,
    backgroundColor: '#e74c3c',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },

  // Sort Styles
  sortRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
    gap: 10,
    alignItems: 'center',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#f9f9f9',
    marginHorizontal: 5,
  },
  sortText: {
    marginHorizontal: 6,
    fontSize: 14,
    color: '#333',
  },

  // Fab Action Button
  fab: {
    position: 'absolute',
    right: 18,
    bottom: 18,
    backgroundColor: '#007bff',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
});

export default DashboardScreen;
