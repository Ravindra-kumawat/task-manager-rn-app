// taskSlice.ts - Redux Toolkit slice for managing tasks (TypeScript)

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Task } from '../types';

const TASK_STORAGE_KEY = 'TASKS_STORAGE';

export const fetchInitialTasks = createAsyncThunk<Task[]>(
  'tasks/fetchInitial',
  async (_, thunkAPI) => {
    try {
      const localData = await AsyncStorage.getItem(TASK_STORAGE_KEY);
      if (localData) return JSON.parse(localData);

      const res = await axios.get('https://jsonplaceholder.typicode.com/todos?_limit=20');
      console.log('response===', res)
      const priorities = ['Low', 'Medium', 'High'] as const;
      const getRandomPriority = () => priorities[Math.floor(Math.random() * priorities.length)];
      const getRandomDate = (): string => {
        const today = new Date();
        const offset = Math.floor(Math.random() * 15) - 7;
        const randomDate = new Date(today);
        randomDate.setDate(today.getDate() + offset);
        return randomDate.toISOString();
      };

      const formatted: Task[] = res.data.map((item: any) => ({
        id: item.id,
        title: item.title,
        description: `Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.`,
        dueDate: getRandomDate(),
        priority: getRandomPriority(),
        completed: item.completed,
      }));

      await AsyncStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(formatted));
      return formatted;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

const saveTasksToStorage = async (tasks: Task[]) => {
  await AsyncStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(tasks));
};

interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
}

const initialState: TaskState = {
  tasks: [],
  loading: false,
  error: null,
};

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    addTask: (state, action: PayloadAction<Task>) => {
      state.tasks.push(action.payload);
      saveTasksToStorage(state.tasks);
    },
    editTask: (state, action: PayloadAction<Task>) => {
      const index = state.tasks.findIndex(t => t.id === action.payload.id);
      if (index >= 0) {
        state.tasks[index] = action.payload;
        saveTasksToStorage(state.tasks);
      }
    },
    deleteTask: (state, action: PayloadAction<number>) => {
      state.tasks = state.tasks.filter(t => t.id !== action.payload);
      saveTasksToStorage(state.tasks);
    },
    toggleTaskStatus: (state, action: PayloadAction<number>) => {
      const task = state.tasks.find(t => t.id === action.payload);
      if (task) {
        task.completed = !task.completed;
        saveTasksToStorage(state.tasks);
      }
    },
  },
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

export const { addTask, editTask, deleteTask, toggleTaskStatus } = taskSlice.actions;
export default taskSlice.reducer;
