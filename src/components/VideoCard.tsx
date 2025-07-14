import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Orientation from 'react-native-orientation-locker';
import Icon from 'react-native-vector-icons/Ionicons';
import Video from 'react-native-video';

interface VideoCardProps {
  title: string;
  author: string;
  thumbnailUrl: string;
  isDownloaded: boolean;
  videoUrl: string;
  onDownload: () => void;
  progress?: number;
  status?: 'downloading' | 'completed' | 'failed';
  isPlaying: boolean;
  onPlay: () => void;
  onStop: () => void;
  shouldPause: boolean;
}

const VideoCard: React.FC<VideoCardProps> = ({
  title,
  author,
  thumbnailUrl,
  isDownloaded,
  videoUrl,
  onDownload,
  progress = 0,
  status,
  isPlaying,
  onPlay,
  onStop,
  shouldPause,
}) => {
  const [isBuffering, setIsBuffering] = useState(true);

  const handleFullscreenEnter = useCallback(() => {
    Orientation.lockToLandscape();
  }, []);

  const handleFullscreenExit = useCallback(() => {
    Orientation.lockToPortrait();
  }, []);

  const isFailed = status === 'failed';
  const isDownloading = status === 'downloading';
  const isCompleted = status === 'completed';

  const iconName = useMemo(() => {
    if (isDownloaded) return 'checkmark-circle-outline';
    if (isFailed) return 'close-circle-outline';
    return 'download-outline';
  }, [isDownloaded, isFailed]);

  const iconColor = useMemo(() => {
    if (isDownloaded) return '#2ecc71';
    if (isFailed) return '#e74c3c';
    return '#007bff';
  }, [isDownloaded, isFailed]);

  const downloadText = useMemo(() => {
    if (isFailed) return 'Download failed.';
    if (isDownloaded && isCompleted) return 'Downloaded';
    if (isDownloading) return `Downloading... ${progress}%`;
    return 'Download';
  }, [isFailed, isDownloaded, isCompleted, isDownloading, progress]);

  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={isPlaying ? onStop : onPlay} activeOpacity={0.9}>
        {isPlaying ? (
          <>
            <Video
              source={{ uri: videoUrl }}
              style={styles.video}
              controls
              poster={thumbnailUrl}
              resizeMode="cover"
              paused={shouldPause || !isPlaying}
              onLoadStart={() => setIsBuffering(true)}
              onReadyForDisplay={() => setIsBuffering(false)}
              onBuffer={({ isBuffering }) => setIsBuffering(isBuffering)}
              repeat
              onFullscreenPlayerWillPresent={handleFullscreenEnter}
              onFullscreenPlayerWillDismiss={handleFullscreenExit}
            />
            {isBuffering && (
              <ActivityIndicator
                size="large"
                color="#fff"
                style={styles.bufferingIndicator}
              />
            )}
          </>
        ) : (
          <>
            <Image source={{ uri: thumbnailUrl }} style={styles.thumbnail} />
            <View style={styles.playIcon}>
              <Icon name="play-circle" size={48} color="#fff" />
            </View>
          </>
        )}
      </TouchableOpacity>
      {/* <Video
        source={{ uri: videoUrl }}
        style={{ width: '100%', aspectRatio: 16 / 9 }}
        controls
        poster={thumbnailUrl}
        paused={true}
      /> */}
      <View style={styles.infoContainer}>
        <Text style={styles.author}>{author}</Text>
        <Text style={styles.title} numberOfLines={2}>{title}</Text>

        <TouchableOpacity
          style={styles.downloadBtn}
          onPress={!isDownloaded ? onDownload : undefined}
          disabled={isDownloaded}
        >
          <Icon name={iconName} size={20} color={iconColor} />
          <Text style={[styles.downloadText, { color: iconColor }]}>{downloadText}</Text>
          {isFailed && <Text style={[styles.downloadText, { textDecorationLine: 'underline' }]}>Retry</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: 12,
    backgroundColor: '#fff',
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 2,
  },
  thumbnail: {
    width: '100%',
    height: 180,
  },
  video: {
    width: '100%',
    aspectRatio: 16 / 9,
  },
  bufferingIndicator: {
    position: 'absolute',
    top: '45%',
    left: '45%',
  },
  playIcon: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -24 }, { translateY: -24 }],
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 50,
    padding: 4,
  },
  infoContainer: {
    padding: 12,
    borderTopWidth: 1.5,
    borderTopColor: '#f2f2f2',
  },
  author: {
    fontSize: 12,
    color: '#888',
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#222',
    marginTop: 4,
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  downloadText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#007bff',
  },
});

export default VideoCard;
