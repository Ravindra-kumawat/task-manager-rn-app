import RNFS from 'react-native-fs';

export const formatDueDate = (isoString: string): string => {
  const date = new Date(isoString);
  const today = new Date();

  const formatTime = (date: Date) =>
    date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });

  const isSameDay = (d1: Date, d2: Date) =>
    d1.toDateString() === d2.toDateString();

  const diffInDays = Math.floor(
    (new Date(date.toDateString()).getTime() - new Date(today.toDateString()).getTime()) /
    (1000 * 60 * 60 * 24)
  );

  const timePart = `at ${formatTime(date)}`;

  if (diffInDays === 0) return `Today ${timePart}`;
  if (diffInDays === 1) return `Tomorrow ${timePart}`;
  if (diffInDays === -1) return `Yesterday ${timePart}`;

  const datePart = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return `${datePart} ${timePart}`;
};

export const formatSelectedDate = (isoString: string): string => {
  const date = new Date(isoString);
  const datePart = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return datePart;
};
export const capitalizeFirstChar = (text: string): string =>
  text?.charAt(0).toUpperCase() + text.slice(1).toLowerCase();

export const downloadVideoToStorage = async (videoUrl: string, id: string): Promise<string> => {
  const fileName = `video_${id}.mp4`;
  const path = `${RNFS.DocumentDirectoryPath}/${fileName}`;

  const exists = await RNFS.exists(path);
  if (exists) return path; // Already downloaded

  const downloadResult = await RNFS.downloadFile({
    fromUrl: videoUrl,
    toFile: path,
  }).promise;

  if (downloadResult.statusCode === 200) {
    return path;
  } else {
    throw new Error('Download failed');
  }
};

export const getLocalVideoPath = (id: string) =>
  `${RNFS.DocumentDirectoryPath}/video_${id}.mp4`;