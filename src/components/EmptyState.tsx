import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const EmptyState = ({ message, title = 'No tasks found' }: { message: string, title: string }) => (
  <View style={styles.container}>
    <Icon name="clipboard-outline" size={60} color="#ccc" />
    <Text style={styles.text}>{title}</Text>
    <Text style={styles.subText}>{message}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 40,
  },
  text: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: '600',
    color: '#555',
  },
  subText: {
    color: '#888',
    marginTop: 4,
    fontSize: 14,
  },
});

export default EmptyState;
