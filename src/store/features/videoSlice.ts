// videoSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import RNFS from 'react-native-fs';

import { Video } from '../types';
import { getLocalVideoPath } from '../../utils/utils';

const VIDEO_STORAGE_KEY = 'VIDEO_LIST_STORAGE';

// Define the state structure for the video feature
interface VideoState {
  videos: Video[]; // list of videos fetched from API or local storage
  loading: boolean; // loading indicator for fetch state
  error: string | null; // error message (if any)
  downloadedVideoIds: string[]; // IDs of videos that are downloaded
  downloadProgress: {
    [videoId: string]: {
      progress: number; // download percentage
      status: 'downloading' | 'completed' | 'failed'; // current status of download
    };
  };
}

// Initial state
const initialState: VideoState = {
  videos: [],
  loading: false,
  error: null,
  downloadedVideoIds: [],
  downloadProgress: {},
};

/**
 * Async thunk to fetch video list from API or AsyncStorage.
 * If already saved in AsyncStorage, use it instead of hitting API.
 */
export const fetchVideos = createAsyncThunk<Video[]>(
  'videos/fetchVideos',
  async (_, thunkAPI) => {
    try {
      const local = await AsyncStorage.getItem(VIDEO_STORAGE_KEY);
      if (local) return JSON.parse(local); // return cached data if exists

      // Fetch video list from remote API
      const response = await axios.get('https://gist.githubusercontent.com/poudyalanil/ca84582cbeb4fc123a13290a586da925/raw/14a27bd0bcd0cd323b35ad79cf3b493dddf6216b/videos.json');
      const videos = response.data;

      // Save to local storage
      await AsyncStorage.setItem(VIDEO_STORAGE_KEY, JSON.stringify(videos));
      return videos;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

/**
 * Async thunk to download a video using `react-native-fs`.
 * It also dispatches intermediate progress updates.
 */
export const downloadVideo = createAsyncThunk<string, Video>(
  'videos/downloadVideo',
  async (video, { dispatch, rejectWithValue }) => {
    let lastProgress = 0;
    let hasError = false;

    try {
      console.log('Downloaded video>>>:', video);
      const localPath = getLocalVideoPath(video.id);
      // const exists = await RNFS.exists(localPath);
      //       console.log('Downloaded video localPath>>>:', localPath);
      //       console.log('Downloaded video exists>>>:', exists);
      // if (exists) return video.id;

      // Download video file to local device storage
      const task = RNFS.downloadFile({
        fromUrl: video.videoUrl,
        toFile: localPath,
        background: true,
        begin: () => {}, // optional: track begin time
        progress: (res: RNFS.DownloadProgressCallbackResult) => {
          if (hasError) return;

          const currentProgress = Math.floor(
            (res.bytesWritten / res.contentLength) * 100
          );

          // Dispatch progress only when percentage increases
          if (currentProgress > lastProgress) {
            lastProgress = currentProgress;
            dispatch(setDownloadProgress({ videoId: video.id, progress: currentProgress, status: 'downloading' }));
          }
        },
      });

      await task.promise;
      dispatch(setDownloadProgress({ videoId: video.id, progress: 100, status: 'completed' }));
      dispatch(markAsDownloaded(video.id));

      return video.id;
    } catch (error: any) {
      // If download fails
      hasError = true;
      dispatch(setDownloadProgress({ videoId: video.id, progress: lastProgress, status: 'failed' }));
      return rejectWithValue(error.message || 'Download failed');
    }
  }
);

// Slice definition
const videoSlice = createSlice({
  name: 'videos',
  initialState,
  reducers: {
    /**
     * Marks a video as downloaded by pushing its ID to `downloadedVideoIds`
     */
    markAsDownloaded: (state, action: PayloadAction<string>) => {
      state.downloadedVideoIds?.push(action.payload);
    },

    /**
     * Sets download progress and status for a video
     */
    setDownloadProgress: (
      state,
      action: PayloadAction<{
        videoId: string;
        progress: number;
        status: 'downloading' | 'completed' | 'failed';
      }>
    ) => {
      const { videoId, progress, status } = action.payload;
      state.downloadProgress[videoId] = { progress, status };
    },
  },

  // Handle extra reducers for async thunks
  extraReducers: builder => {
    builder
      .addCase(fetchVideos.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVideos.fulfilled, (state, action) => {
        state.videos = action.payload;
        state.loading = false;
      })
      .addCase(fetchVideos.rejected, (state, action) => {
        state.error = action.payload as string;
        state.loading = false;
      });
  },
});

// Export actions for components to use
export const { markAsDownloaded, setDownloadProgress } = videoSlice.actions;
export default videoSlice.reducer;
