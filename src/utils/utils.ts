import RNFS from 'react-native-fs';

/**
 * Formats a given ISO date string into a readable label like:
 * "Today at 5:30 PM", "Tomorrow at 8:00 AM", or "Jul 13, 2025 at 3:15 PM"
 */
export const formatDueDate = (isoString: string): string => {
  const date = new Date(isoString);
  const today = new Date();

  // Helper to format time as "5:30 PM"
  const formatTime = (date: Date) =>
    date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });

  // Helper to check if two dates are on the same day
  const isSameDay = (d1: Date, d2: Date) =>
    d1.toDateString() === d2.toDateString();

  // Calculate difference in whole days
  const diffInDays = Math.floor(
    (new Date(date.toDateString()).getTime() - new Date(today.toDateString()).getTime()) /
    (1000 * 60 * 60 * 24)
  );

  const timePart = `at ${formatTime(date)}`;

  if (diffInDays === 0) return `Today ${timePart}`;
  if (diffInDays === 1) return `Tomorrow ${timePart}`;
  if (diffInDays === -1) return `Yesterday ${timePart}`;

  // Format as "Jul 13, 2025 at 5:00 PM"
  const datePart = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return `${datePart} ${timePart}`;
};

/**
 * Converts an ISO string into "Jul 13, 2025" format.
 * Used for displaying the selected date in a date picker.
 */
export const formatSelectedDate = (isoString: string): string => {
  const date = new Date(isoString);
  const datePart = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return datePart;
};

/**
 * Capitalizes the first letter of a given string and makes the rest lowercase.
 * e.g. "hello WORLD" => "Hello world"
 */
export const capitalizeFirstChar = (text: string): string =>
  text?.charAt(0).toUpperCase() + text.slice(1).toLowerCase();

/**
 * Downloads a video file to local device storage if not already downloaded.
 * - Saves it to the app's document directory using RNFS
 * - File is named as `video_<id>.mp4`
 * - Returns the local path if successful
 * - Throws error if download fails
 */
export const downloadVideoToStorage = async (videoUrl: string, id: string): Promise<string> => {
  const fileName = `video_${id}.mp4`;
  const path = `${RNFS.DocumentDirectoryPath}/${fileName}`;

  const exists = await RNFS.exists(path);
  if (exists) return path; // Return existing file path if already downloaded

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

/**
 * Constructs the local storage path for a downloaded video
 * based on its ID.
 * Example: video ID = "123" => returns ".../video_123.mp4"
 */
export const getLocalVideoPath = (id: string) =>
  `${RNFS.DocumentDirectoryPath}/video_${id}.mp4`;
