import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Task } from './../store/types';
import { useNavigation } from '@react-navigation/native';
import { capitalizeFirstChar, formatDueDate } from '../utils/utils';

interface Props {
  task: Task;
  bgColor: string;
  dotColor: string;
  showLine: boolean;
}

const TaskCard: React.FC<Props> = ({
  task,
  bgColor,
  dotColor,
  showLine,
}) => {
  const navigation: any = useNavigation();

  return (
    <View style={styles.row}>
      {/* Timeline Dot & Line Indicator */}
      <View style={{ flex: 0.12, marginTop: 10 }}>
        <View style={styles.circle}>
          <View style={[styles.circleDot, { backgroundColor: dotColor }]} />
        </View>
        {/* Vertical line to connect timeline dots */}
        {showLine && <View style={styles.verticalLine} />}
      </View>

      {/* Task Card with title, description and meta info */}
      <TouchableOpacity
        style={[styles.card, { backgroundColor: bgColor }]}
        onPress={() => navigation.navigate('TaskDetails', { taskId: task.id })}
      >
        {/* Task Title */}
        <Text style={styles.title}>{capitalizeFirstChar(task.title)}</Text>

        {/* Task Description (2 lines max) */}
        <Text
          numberOfLines={2}
          ellipsizeMode="tail"
          style={styles.description}
        >
          {capitalizeFirstChar(task.description || `Description not added`)}
        </Text>

        {/* Due Date */}
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Due</Text>
          <Text style={styles.metaValue}>: {formatDueDate(task.dueDate)}</Text>
        </View>

        {/* Priority */}
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Priority</Text>
          <Text style={styles.metaValue}>: {task.priority}</Text>
        </View>

        {/* Status with icon */}
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Status</Text>
          <View style={styles.metaValueRow}>
            <Text style={styles.metaValue}>:</Text>
            <Icon
              name={task.completed ? 'checkmark-circle' : 'close-circle'}
              size={20}
              color={task.completed ? '#2ecc71' : '#ff0000'}
              style={{ marginHorizontal: 2 }}
            />
            <Text style={styles.metaValue}>
              {task.completed ? 'Completed' : 'Incomplete'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default TaskCard;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    minHeight: 90,
  },
  card: {
    flex: 1,
    borderRadius: 10,
    padding: 14,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  description: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },

  circle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#d9e8e6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    zIndex: 200,
  },
  circleDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  verticalLine: {
    width: 2,
    height: '120%',
    backgroundColor: '#6568687e',
    position: 'absolute',
    top: 20,
    left: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  metaLabel: {
    fontWeight: '600',
    width: 65,
    color: '#333',
  },
  metaValue: {
    color: '#444',
    flexShrink: 1,
  },
  metaValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
