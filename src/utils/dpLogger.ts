/**
 * DP 系统日志和错误处理
 * 提供统一的日志记录和错误处理机制
 */

import { DPError, DPErrorType } from '../types/dp';

// 日志级别
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

// 日志条目接口
interface LogEntry {
  timestamp: number;
  level: LogLevel;
  category: string;
  message: string;
  data?: any;
  error?: Error;
}

// DP 日志管理器
class DPLogger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000; // 最大日志条数
  private currentLogLevel = LogLevel.INFO;

  // 设置日志级别
  setLogLevel(level: LogLevel) {
    this.currentLogLevel = level;
  }

  // 记录日志
  private log(level: LogLevel, category: string, message: string, data?: any, error?: Error) {
    if (level < this.currentLogLevel) {
      return;
    }

    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      category,
      message,
      data,
      error,
    };

    this.logs.push(entry);

    // 限制日志数量
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // 输出到控制台
    this.outputToConsole(entry);
  }

  // 输出到控制台
  private outputToConsole(entry: LogEntry) {
    const timestamp = new Date(entry.timestamp).toISOString();
    const levelStr = LogLevel[entry.level];
    const prefix = `[${timestamp}] [${levelStr}] [${entry.category}]`;

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(prefix, entry.message, entry.data);
        break;
      case LogLevel.INFO:
        console.info(prefix, entry.message, entry.data);
        break;
      case LogLevel.WARN:
        console.warn(prefix, entry.message, entry.data);
        break;
      case LogLevel.ERROR:
        console.error(prefix, entry.message, entry.data, entry.error);
        break;
    }
  }

  // 调试日志
  debug(category: string, message: string, data?: any) {
    this.log(LogLevel.DEBUG, category, message, data);
  }

  // 信息日志
  info(category: string, message: string, data?: any) {
    this.log(LogLevel.INFO, category, message, data);
  }

  // 警告日志
  warn(category: string, message: string, data?: any) {
    this.log(LogLevel.WARN, category, message, data);
  }

  // 错误日志
  error(category: string, message: string, data?: any, error?: Error) {
    this.log(LogLevel.ERROR, category, message, data, error);
  }

  // 获取日志
  getLogs(level?: LogLevel, category?: string): LogEntry[] {
    let filteredLogs = this.logs;

    if (level !== undefined) {
      filteredLogs = filteredLogs.filter(log => log.level >= level);
    }

    if (category) {
      filteredLogs = filteredLogs.filter(log => log.category === category);
    }

    return filteredLogs;
  }

  // 清除日志
  clearLogs() {
    this.logs = [];
  }

  // 导出日志
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  // 获取统计信息
  getStats() {
    const stats = {
      total: this.logs.length,
      debug: 0,
      info: 0,
      warn: 0,
      error: 0,
      categories: {} as Record<string, number>,
    };

    this.logs.forEach(log => {
      switch (log.level) {
        case LogLevel.DEBUG:
          stats.debug++;
          break;
        case LogLevel.INFO:
          stats.info++;
          break;
        case LogLevel.WARN:
          stats.warn++;
          break;
        case LogLevel.ERROR:
          stats.error++;
          break;
      }

      stats.categories[log.category] = (stats.categories[log.category] || 0) + 1;
    });

    return stats;
  }
}

// 全局日志实例
export const dpLogger = new DPLogger();

// DP 错误处理器
export class DPErrorHandler {
  private errorCallbacks: Map<DPErrorType, Set<(error: DPError) => void>> = new Map();

  // 处理错误
  handleError(error: DPError) {
    // 记录错误日志
    dpLogger.error('DP_ERROR', error.message, {
      type: error.type,
      dpId: error.dpId,
      originalError: error.originalError,
    }, error.originalError instanceof Error ? error.originalError : undefined);

    // 调用错误回调
    const callbacks = this.errorCallbacks.get(error.type);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(error);
        } catch (callbackError) {
          dpLogger.error('ERROR_HANDLER', '错误回调执行失败', {
            originalError: error,
            callbackError,
          });
        }
      });
    }

    // 根据错误类型执行特定处理
    this.handleSpecificError(error);
  }

  // 处理特定类型的错误
  private handleSpecificError(error: DPError) {
    switch (error.type) {
      case DPErrorType.DEVICE_OFFLINE:
        dpLogger.warn('DEVICE', '设备离线，尝试重连');
        // 这里可以触发重连逻辑
        break;

      case DPErrorType.PERMISSION_DENIED:
        dpLogger.warn('PERMISSION', '权限被拒绝', { dpId: error.dpId });
        break;

      case DPErrorType.INVALID_VALUE:
        dpLogger.warn('VALIDATION', '无效的DP值', { 
          dpId: error.dpId, 
          message: error.message 
        });
        break;

      case DPErrorType.TIMEOUT:
        dpLogger.warn('TIMEOUT', 'DP操作超时', { dpId: error.dpId });
        break;

      case DPErrorType.BRIDGE_ERROR:
        dpLogger.error('BRIDGE', '桥接错误', {
          dpId: error.dpId,
          message: error.message,
        });
        break;

      case DPErrorType.UNKNOWN_DP:
        dpLogger.error('UNKNOWN_DP', '未知的DP', { dpId: error.dpId });
        break;
    }
  }

  // 添加错误回调
  addErrorCallback(errorType: DPErrorType, callback: (error: DPError) => void): () => void {
    if (!this.errorCallbacks.has(errorType)) {
      this.errorCallbacks.set(errorType, new Set());
    }

    this.errorCallbacks.get(errorType)!.add(callback);

    // 返回取消回调的函数
    return () => {
      this.errorCallbacks.get(errorType)?.delete(callback);
    };
  }

  // 清除所有回调
  clearCallbacks() {
    this.errorCallbacks.clear();
  }
}

// 全局错误处理器实例
export const dpErrorHandler = new DPErrorHandler();

// 便捷的日志函数
export const dpLog = {
  debug: (message: string, data?: any) => dpLogger.debug('DP', message, data),
  info: (message: string, data?: any) => dpLogger.info('DP', message, data),
  warn: (message: string, data?: any) => dpLogger.warn('DP', message, data),
  error: (message: string, data?: any, error?: Error) => dpLogger.error('DP', message, data, error),
};

// 桥接日志函数
export const bridgeLog = {
  debug: (message: string, data?: any) => dpLogger.debug('BRIDGE', message, data),
  info: (message: string, data?: any) => dpLogger.info('BRIDGE', message, data),
  warn: (message: string, data?: any) => dpLogger.warn('BRIDGE', message, data),
  error: (message: string, data?: any, error?: Error) => dpLogger.error('BRIDGE', message, data, error),
};

// UI日志函数
export const uiLog = {
  debug: (message: string, data?: any) => dpLogger.debug('UI', message, data),
  info: (message: string, data?: any) => dpLogger.info('UI', message, data),
  warn: (message: string, data?: any) => dpLogger.warn('UI', message, data),
  error: (message: string, data?: any, error?: Error) => dpLogger.error('UI', message, data, error),
};

// 性能监控
export class DPPerformanceMonitor {
  private timers: Map<string, number> = new Map();
  private metrics: Map<string, number[]> = new Map();

  // 开始计时
  startTimer(name: string) {
    this.timers.set(name, Date.now());
  }

  // 结束计时
  endTimer(name: string) {
    const startTime = this.timers.get(name);
    if (startTime) {
      const duration = Date.now() - startTime;
      this.timers.delete(name);
      
      if (!this.metrics.has(name)) {
        this.metrics.set(name, []);
      }
      
      this.metrics.get(name)!.push(duration);
      
      dpLogger.debug('PERFORMANCE', `${name} 耗时: ${duration}ms`);
      
      return duration;
    }
    return 0;
  }

  // 获取性能统计
  getStats(name: string) {
    const durations = this.metrics.get(name);
    if (!durations || durations.length === 0) {
      return null;
    }

    const sorted = [...durations].sort((a, b) => a - b);
    const avg = durations.reduce((sum, d) => sum + d, 0) / durations.length;
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const median = sorted[Math.floor(sorted.length / 2)];

    return {
      count: durations.length,
      avg: Math.round(avg),
      min,
      max,
      median,
    };
  }

  // 清除指标
  clearMetrics() {
    this.metrics.clear();
    this.timers.clear();
  }
}

// 全局性能监控实例
export const dpPerformanceMonitor = new DPPerformanceMonitor();

// 性能装饰器
export function measurePerformance(name: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      dpPerformanceMonitor.startTimer(name);
      try {
        const result = await originalMethod.apply(this, args);
        return result;
      } finally {
        dpPerformanceMonitor.endTimer(name);
      }
    };

    return descriptor;
  };
}
