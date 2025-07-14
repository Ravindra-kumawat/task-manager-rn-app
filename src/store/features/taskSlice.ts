// taskSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Task } from '../types';

// Key used for storing/retrieving tasks in local storage
const TASK_STORAGE_KEY = 'TASKS_STORAGE';

/**
 * Async thunk to fetch initial tasks.
 * - Checks if tasks exist in AsyncStorage.
 * - If not, fetches from mock API and generates extra info (priority, dueDate).
 * - Stores fetched data in AsyncStorage for persistence.
 */
export const fetchInitialTasks = createAsyncThunk<Task[]>(
  'tasks/fetchInitial',
  async (_, thunkAPI) => {
    try {
      const localData = await AsyncStorage.getItem(TASK_STORAGE_KEY);

      // If local data exists, return parsed tasks
      if (localData) return JSON.parse(localData);

      // Else fetch from remote API
      const res = await axios.get('https://jsonplaceholder.typicode.com/todos?_limit=20');

      const priorities = ['Low', 'Medium', 'High'] as const;

      // Randomly select priority
      const getRandomPriority = () => priorities[Math.floor(Math.random() * priorities.length)];

      // Generate a due date ±7 days from today
      const getRandomDate = (): string => {
        const today = new Date();
        const offset = Math.floor(Math.random() * 15) - 7;
        const randomDate = new Date(today);
        randomDate.setDate(today.getDate() + offset);
        return randomDate.toISOString();
      };

      // Format the API response into our Task model
      const formatted: Task[] = res.data.map((item: any) => ({
        id: item.id,
        title: item.title,
        description: `Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.`,
        dueDate: getRandomDate(),
        priority: getRandomPriority(),
        completed: item.completed,
      }));

      // Store to AsyncStorage
      await AsyncStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(formatted));
      return formatted;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// Helper function to persist tasks to AsyncStorage
const saveTasksToStorage = async (tasks: Task[]) => {
  await AsyncStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(tasks));
};

// Define the shape of the task state
interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: TaskState = {
  tasks: [],
  loading: false,
  error: null,
};

// Redux slice definition
const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    /**
     * Add a new task and persist updated list to storage.
     */
    addTask: (state, action: PayloadAction<Task>) => {
      state.tasks.push(action.payload);
      saveTasksToStorage(state.tasks);
    },

    /**
     * Edit an existing task by matching ID and replace it.
     */
    editTask: (state, action: PayloadAction<Task>) => {
      const index = state.tasks.findIndex(t => t.id === action.payload.id);
      if (index >= 0) {
        state.tasks[index] = action.payload;
        saveTasksToStorage(state.tasks);
      }
    },

    /**
     * Delete task by ID and persist.
     */
    deleteTask: (state, action: PayloadAction<number>) => {
      state.tasks = state.tasks.filter(t => t.id !== action.payload);
      saveTasksToStorage(state.tasks);
    },

    /**
     * Toggle completed status of a task.
     */
    toggleTaskStatus: (state, action: PayloadAction<number>) => {
      const task = state.tasks.find(t => t.id === action.payload);
      if (task) {
        task.completed = !task.completed;
        saveTasksToStorage(state.tasks);
      }
    },
  },

  /**
   * Handle async states of fetchInitialTasks thunk.
   */
  extraReducers: builder => {
    builder
      .addCase(fetchInitialTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInitialTasks.fulfilled, (state, action: PayloadAction<Task[]>) => {
        state.tasks = action.payload;
        state.loading = false;
      })
      .addCase(fetchInitialTasks.rejected, (state, action) => {
        state.error = action.payload as string;
        state.loading = false;
      });
  }
});

// Export action creators
export const { addTask, editTask, deleteTask, toggleTaskStatus } = taskSlice.actions;
export default taskSlice.reducer;
