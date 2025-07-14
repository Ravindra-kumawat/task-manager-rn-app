export type Priority = 'Low' | 'Medium' | 'High';

export interface Task {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  priority: Priority;
  completed: boolean;
}

export interface Video {
  id: string;
  title: string;
  thumbnailUrl: string;
  duration: string;
  uploadTime: string;
  views: string;
  author: string;
  subscriber: string;
  videoUrl: string;
  description: string;
  isLive: boolean;
  downloaded: boolean;
  localPath?: string;
  isDownloaded?: boolean;
}

