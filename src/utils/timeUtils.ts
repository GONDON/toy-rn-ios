/**
 * 时间格式化工具函数
 */

/**
 * 将秒数格式化为 MM:SS 或 HH:MM:SS 格式
 * @param seconds 秒数
 * @returns 格式化后的时间字符串
 */
export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) {
    return '00:00';
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formatNumber = (num: number): string => {
    return num.toString().padStart(2, '0');
  };

  if (hours > 0) {
    return `${formatNumber(hours)}:${formatNumber(minutes)}:${formatNumber(remainingSeconds)}`;
  } else {
    return `${formatNumber(minutes)}:${formatNumber(remainingSeconds)}`;
  }
}

/**
 * 将时间字符串转换为秒数
 * @param timeString 时间字符串 (MM:SS 或 HH:MM:SS)
 * @returns 秒数
 */
export function parseTime(timeString: string): number {
  const parts = timeString.split(':').map(part => parseInt(part, 10));
  
  if (parts.length === 2) {
    // MM:SS 格式
    const [minutes, seconds] = parts;
    return minutes * 60 + seconds;
  } else if (parts.length === 3) {
    // HH:MM:SS 格式
    const [hours, minutes, seconds] = parts;
    return hours * 3600 + minutes * 60 + seconds;
  }
  
  return 0;
}

/**
 * 计算播放进度百分比
 * @param currentTime 当前时间（秒）
 * @param duration 总时长（秒）
 * @returns 进度百分比 (0-1)
 */
export function calculateProgress(currentTime: number, duration: number): number {
  if (duration <= 0) {
    return 0;
  }
  
  return Math.max(0, Math.min(1, currentTime / duration));
}

/**
 * 根据进度百分比计算时间
 * @param progress 进度百分比 (0-1)
 * @param duration 总时长（秒）
 * @returns 对应的时间（秒）
 */
export function progressToTime(progress: number, duration: number): number {
  return Math.max(0, Math.min(duration, progress * duration));
}
