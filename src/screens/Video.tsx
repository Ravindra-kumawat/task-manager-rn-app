import React, { useCallback, useEffect, useState } from 'react';
import { View, FlatList, SafeAreaView, StyleSheet, ToastAndroid, Platform, Alert, ActivityIndicator } from 'react-native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { RootState } from '../store/store';
import { downloadVideo, fetchVideos } from '../store/features/videoSlice';
import VideoCard from '../components/VideoCard';
import { getLocalVideoPath } from '../utils/utils';
import { useFocusEffect } from '@react-navigation/native';
import NetInfo from '@react-native-community/netinfo';

const VideoListScreen = () => {
  const dispatch = useAppDispatch();
  const { videos = [], loading } = useAppSelector((state: RootState) => state.videos);
  const downloaded = useAppSelector((state) => state.videos.downloadedVideoIds || []);
  const progressMap = useAppSelector((state) => state.videos.downloadProgress || {});

  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const [shouldPause, setShouldPause] = useState<boolean>(false);

  useEffect(() => {
    dispatch(fetchVideos());
  }, [dispatch]);

  useFocusEffect(
    useCallback(() => {
      setShouldPause(false);
      return () => setShouldPause(true);
    }, [])
  );

  const handleDownload = useCallback(async (video: any) => {
    const netState = await NetInfo.fetch();
    if (!netState.isConnected) {
      const msg = 'No internet connection. Please check your network.';
      Platform.OS === 'android'
        ? ToastAndroid.show(msg, ToastAndroid.LONG)
        : Alert.alert('Network Error', msg);
      return;
    }
    try {
      await dispatch(downloadVideo(video)).unwrap();
      const msg = 'Video downloaded successfully!';
      Platform.OS === 'android'
        ? ToastAndroid.show(msg, ToastAndroid.SHORT)
        : Alert.alert('Download Complete', msg);
    } catch (error: any) {
      const errorMessage = 'Network Error, Please check your internet connection.';

      Platform.OS === 'android'
        ? ToastAndroid.show(`Download failed: ${errorMessage}`, ToastAndroid.LONG)
        : Alert.alert('Download Failed', errorMessage);
    }
  }, [dispatch]);

  const renderItem = useCallback(({ item }: { item: any }) => {
    const isDownloaded = downloaded?.includes?.(item.id);
    const videoUrl = isDownloaded ? getLocalVideoPath(item.id) : item?.videoUrl;
    const progress = progressMap?.[item.id]?.progress || 0;
    const status = progressMap?.[item.id]?.status;

    return (
      <VideoCard
        title={item.title}
        author={item.author}
        thumbnailUrl={item.thumbnailUrl}
        isDownloaded={isDownloaded}
        videoUrl={videoUrl}
        onDownload={() => handleDownload(item)}
        progress={progress}
        status={status}
        isPlaying={playingVideoId === item.id}
        onPlay={() => setPlayingVideoId(item.id)}
        onStop={() => setPlayingVideoId(null)}
        shouldPause={shouldPause}
      />
    );
  }, [downloaded, progressMap, playingVideoId, handleDownload, shouldPause]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={videos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
      />
    </SafeAreaView>
  );
};

export default VideoListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f6f6',
  },
  listContent: {
    padding: 16,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
