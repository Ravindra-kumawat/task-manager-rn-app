// navigation/types.ts

export type RootStackParamList = {
  Dashboard: undefined;
  TaskForm: { taskId?: number } | undefined;
  TaskDetails: { taskId: number };
};

export type RootTabParamList = {
  Tasks: undefined;   // Contains Dashboard stack
  Videos: undefined;  // Offline video screen
};