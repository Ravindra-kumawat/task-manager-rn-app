import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import RNFS from 'react-native-fs';

import { Video } from '../types';
import { getLocalVideoPath } from '../../utils/utils';

const VIDEO_STORAGE_KEY = 'VIDEO_LIST_STORAGE';

interface VideoState {
  videos: Video[];
  loading: boolean;
  error: string | null;
  downloadedVideoIds: string[];
  downloadProgress: {
    [videoId: string]: {
      progress: number;
      status: 'downloading' | 'completed' | 'failed';
    };
  };
}

const initialState: VideoState = {
  videos: [],
  loading: false,
  error: null,
  downloadedVideoIds: [],
  downloadProgress: {},
};

// Async thunk to fetch videos
export const fetchVideos = createAsyncThunk<Video[]>(
  'videos/fetchVideos',
  async (_, thunkAPI) => {
    try {
      const local = await AsyncStorage.getItem(VIDEO_STORAGE_KEY);
      if (local) return JSON.parse(local);

      const response = await axios.get('https://gist.githubusercontent.com/poudyalanil/ca84582cbeb4fc123a13290a586da925/raw/14a27bd0bcd0cd323b35ad79cf3b493dddf6216b/videos.json');
      const videos = response.data;

      await AsyncStorage.setItem(VIDEO_STORAGE_KEY, JSON.stringify(videos));
      return videos;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// Async thunk to download a video
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

      const task = RNFS.downloadFile({
        fromUrl: video.videoUrl,
        toFile: localPath,
        background: true,
        begin: () => { },
        progress: (res: RNFS.DownloadProgressCallbackResult) => {
          if (hasError) return;
          const currentProgress = Math.floor((res.bytesWritten / res.contentLength) * 100);

          if (currentProgress > lastProgress) {
            lastProgress = currentProgress;
            console.log('Downloaded video percentage>>>:', lastProgress);

            dispatch(
              setDownloadProgress({ videoId: video.id, progress: currentProgress, status: 'downloading' })
            );
          }
        },
      });
      await task.promise;
      dispatch(setDownloadProgress({ videoId: video.id, progress: 100, status: 'completed' }));
      dispatch(markAsDownloaded(video.id));

      return video.id;
    } catch (error: any) {
      hasError = true;
      dispatch(setDownloadProgress({ videoId: video.id, progress: lastProgress, status: 'failed' }));
      return rejectWithValue(error.message || 'Download failed');
    }
  }
);

// Slice
const videoSlice = createSlice({
  name: 'videos',
  initialState,
  reducers: {
    markAsDownloaded: (state, action: PayloadAction<string>) => {
      state.downloadedVideoIds?.push(action.payload);
    },
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
    }
  },
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

export const { markAsDownloaded, setDownloadProgress } = videoSlice.actions;
export default videoSlice.reducer;
