/**
 * DP 系统测试工具
 * 用于验证 DP 系统的功能完整性
 */

import {
  DPId,
  ChargeStatus,
  AIConversationMode,
  TimeFormat,
  PlaybackData,
  StoryDownloadingData,
} from '../types/dp';
import { validateDPValue, formatDPValue, parseDPValue } from '../utils/dpUtils';
import { getDPDefinition, getAllDPDefinitions } from '../config/dpDefinitions';

// 测试结果接口
interface TestResult {
  testName: string;
  passed: boolean;
  error?: string;
  details?: any;
}

// DP 系统测试类
export class DPSystemTester {
  private results: TestResult[] = [];

  // 运行所有测试
  async runAllTests(): Promise<TestResult[]> {
    this.results = [];

    // 基础功能测试
    this.testDPDefinitions();
    this.testDPValidation();
    this.testDPFormatting();
    this.testDPParsing();
    
    // 类型安全测试
    this.testTypeSafety();
    
    // 边界条件测试
    this.testBoundaryConditions();
    
    // 错误处理测试
    this.testErrorHandling();

    return this.results;
  }

  // 添加测试结果
  private addResult(testName: string, passed: boolean, error?: string, details?: any) {
    this.results.push({
      testName,
      passed,
      error,
      details,
    });
  }

  // 测试 DP 定义
  private testDPDefinitions() {
    try {
      const definitions = getAllDPDefinitions();
      
      // 检查是否有定义
      if (Object.keys(definitions).length === 0) {
        this.addResult('DP定义检查', false, '没有找到任何DP定义');
        return;
      }

      // 检查关键DP是否存在
      const keyDPs = [
        DPId.BATTERY_PERCENTAGE,
        DPId.VOLUME_SET,
        DPId.CHARGE_STATUS,
        DPId.AI_CONVERSATION,
        DPId.LIGHT_PERCENTAGE,
      ];

      for (const dpId of keyDPs) {
        const definition = getDPDefinition(dpId);
        if (!definition) {
          this.addResult('DP定义检查', false, `关键DP ${dpId} 定义缺失`);
          return;
        }
      }

      this.addResult('DP定义检查', true, undefined, {
        totalDPs: Object.keys(definitions).length,
        keyDPsFound: keyDPs.length,
      });
    } catch (error) {
      this.addResult('DP定义检查', false, `测试失败: ${error}`);
    }
  }

  // 测试 DP 验证
  private testDPValidation() {
    try {
      const testCases = [
        // 电量百分比测试
        { dpId: DPId.BATTERY_PERCENTAGE, value: 50, expected: true },
        { dpId: DPId.BATTERY_PERCENTAGE, value: 101, expected: false },
        { dpId: DPId.BATTERY_PERCENTAGE, value: -1, expected: false },
        { dpId: DPId.BATTERY_PERCENTAGE, value: 'invalid', expected: false },
        
        // 充电状态测试
        { dpId: DPId.CHARGE_STATUS, value: ChargeStatus.CHARGING, expected: true },
        { dpId: DPId.CHARGE_STATUS, value: 'invalid_status', expected: false },
        
        // AI对话测试
        { dpId: DPId.AI_CONVERSATION, value: true, expected: true },
        { dpId: DPId.AI_CONVERSATION, value: false, expected: true },
        { dpId: DPId.AI_CONVERSATION, value: 'not_boolean', expected: false },
        
        // 屏幕亮度测试
        { dpId: DPId.LIGHT_PERCENTAGE, value: 5, expected: true },
        { dpId: DPId.LIGHT_PERCENTAGE, value: 8, expected: false },
        { dpId: DPId.LIGHT_PERCENTAGE, value: -1, expected: false },
        
        // 播放数据测试
        { 
          dpId: DPId.PLAYBACK, 
          value: { fileId: '123', action: 'play' } as PlaybackData, 
          expected: true 
        },
        { 
          dpId: DPId.PLAYBACK, 
          value: { fileId: '123', action: 'invalid' }, 
          expected: false 
        },
      ];

      let passedTests = 0;
      const failedTests: any[] = [];

      for (const testCase of testCases) {
        const result = validateDPValue(testCase.dpId, testCase.value);
        if (result === testCase.expected) {
          passedTests++;
        } else {
          failedTests.push({
            dpId: testCase.dpId,
            value: testCase.value,
            expected: testCase.expected,
            actual: result,
          });
        }
      }

      if (failedTests.length === 0) {
        this.addResult('DP验证测试', true, undefined, {
          totalTests: testCases.length,
          passedTests,
        });
      } else {
        this.addResult('DP验证测试', false, '部分验证测试失败', {
          totalTests: testCases.length,
          passedTests,
          failedTests,
        });
      }
    } catch (error) {
      this.addResult('DP验证测试', false, `测试失败: ${error}`);
    }
  }

  // 测试 DP 格式化
  private testDPFormatting() {
    try {
      const testCases = [
        { dpId: DPId.BATTERY_PERCENTAGE, value: 75, expectedPattern: /75%/ },
        { dpId: DPId.AI_CONVERSATION, value: true, expectedPattern: /开启/ },
        { dpId: DPId.AI_CONVERSATION, value: false, expectedPattern: /关闭/ },
        { dpId: DPId.CHARGE_STATUS, value: ChargeStatus.CHARGING, expectedPattern: /charging/ },
      ];

      let passedTests = 0;
      const failedTests: any[] = [];

      for (const testCase of testCases) {
        const formatted = formatDPValue(testCase.dpId, testCase.value);
        if (testCase.expectedPattern.test(formatted)) {
          passedTests++;
        } else {
          failedTests.push({
            dpId: testCase.dpId,
            value: testCase.value,
            formatted,
            expectedPattern: testCase.expectedPattern.toString(),
          });
        }
      }

      if (failedTests.length === 0) {
        this.addResult('DP格式化测试', true, undefined, {
          totalTests: testCases.length,
          passedTests,
        });
      } else {
        this.addResult('DP格式化测试', false, '部分格式化测试失败', {
          totalTests: testCases.length,
          passedTests,
          failedTests,
        });
      }
    } catch (error) {
      this.addResult('DP格式化测试', false, `测试失败: ${error}`);
    }
  }

  // 测试 DP 解析
  private testDPParsing() {
    try {
      const testCases = [
        { dpId: DPId.BATTERY_PERCENTAGE, rawValue: '75', expected: 75 },
        { dpId: DPId.AI_CONVERSATION, rawValue: true, expected: true },
        { dpId: DPId.CHARGE_STATUS, rawValue: 'charging', expected: 'charging' },
        { 
          dpId: DPId.PLAYBACK, 
          rawValue: '{"fileId":"123","action":"play"}', 
          expected: { fileId: '123', action: 'play' } 
        },
      ];

      let passedTests = 0;
      const failedTests: any[] = [];

      for (const testCase of testCases) {
        const parsed = parseDPValue(testCase.dpId, testCase.rawValue);
        if (JSON.stringify(parsed) === JSON.stringify(testCase.expected)) {
          passedTests++;
        } else {
          failedTests.push({
            dpId: testCase.dpId,
            rawValue: testCase.rawValue,
            parsed,
            expected: testCase.expected,
          });
        }
      }

      if (failedTests.length === 0) {
        this.addResult('DP解析测试', true, undefined, {
          totalTests: testCases.length,
          passedTests,
        });
      } else {
        this.addResult('DP解析测试', false, '部分解析测试失败', {
          totalTests: testCases.length,
          passedTests,
          failedTests,
        });
      }
    } catch (error) {
      this.addResult('DP解析测试', false, `测试失败: ${error}`);
    }
  }

  // 测试类型安全
  private testTypeSafety() {
    try {
      // 这里主要是编译时检查，运行时我们检查一些基本的类型约束
      const definition = getDPDefinition(DPId.BATTERY_PERCENTAGE);
      
      if (!definition) {
        this.addResult('类型安全测试', false, '无法获取DP定义');
        return;
      }

      // 检查定义的结构
      const requiredFields = ['id', 'name', 'identifier', 'transmissionType', 'dataType'];
      const missingFields = requiredFields.filter(field => !(field in definition));
      
      if (missingFields.length > 0) {
        this.addResult('类型安全测试', false, `DP定义缺少必要字段: ${missingFields.join(', ')}`);
        return;
      }

      this.addResult('类型安全测试', true, undefined, {
        checkedFields: requiredFields,
        definitionStructure: Object.keys(definition),
      });
    } catch (error) {
      this.addResult('类型安全测试', false, `测试失败: ${error}`);
    }
  }

  // 测试边界条件
  private testBoundaryConditions() {
    try {
      const boundaryTests = [
        // 电量边界值
        { dpId: DPId.BATTERY_PERCENTAGE, value: 0, expected: true },
        { dpId: DPId.BATTERY_PERCENTAGE, value: 100, expected: true },
        
        // 亮度边界值
        { dpId: DPId.LIGHT_PERCENTAGE, value: 0, expected: true },
        { dpId: DPId.LIGHT_PERCENTAGE, value: 7, expected: true },
        
        // 最大音量边界值
        { dpId: DPId.MAX_VOLUME_SET, value: 0, expected: true },
        { dpId: DPId.MAX_VOLUME_SET, value: 10, expected: true },
      ];

      let passedTests = 0;
      const failedTests: any[] = [];

      for (const test of boundaryTests) {
        const result = validateDPValue(test.dpId, test.value);
        if (result === test.expected) {
          passedTests++;
        } else {
          failedTests.push(test);
        }
      }

      if (failedTests.length === 0) {
        this.addResult('边界条件测试', true, undefined, {
          totalTests: boundaryTests.length,
          passedTests,
        });
      } else {
        this.addResult('边界条件测试', false, '部分边界条件测试失败', {
          totalTests: boundaryTests.length,
          passedTests,
          failedTests,
        });
      }
    } catch (error) {
      this.addResult('边界条件测试', false, `测试失败: ${error}`);
    }
  }

  // 测试错误处理
  private testErrorHandling() {
    try {
      // 测试无效DP ID
      const invalidDPResult = validateDPValue(99999, 'any_value');
      if (invalidDPResult !== false) {
        this.addResult('错误处理测试', false, '无效DP ID应该返回false');
        return;
      }

      // 测试格式化无效DP
      const invalidFormatResult = formatDPValue(99999, 'any_value');
      if (typeof invalidFormatResult !== 'string') {
        this.addResult('错误处理测试', false, '格式化无效DP应该返回字符串');
        return;
      }

      this.addResult('错误处理测试', true, undefined, {
        invalidDPValidation: 'passed',
        invalidDPFormatting: 'passed',
      });
    } catch (error) {
      this.addResult('错误处理测试', false, `测试失败: ${error}`);
    }
  }

  // 生成测试报告
  generateReport(): string {
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.passed).length;
    const failedTests = this.results.filter(r => !r.passed);

    let report = `\n=== DP 系统测试报告 ===\n`;
    report += `总测试数: ${totalTests}\n`;
    report += `通过: ${passedTests}\n`;
    report += `失败: ${failedTests.length}\n`;
    report += `成功率: ${((passedTests / totalTests) * 100).toFixed(2)}%\n\n`;

    if (failedTests.length > 0) {
      report += `失败的测试:\n`;
      failedTests.forEach(test => {
        report += `- ${test.testName}: ${test.error}\n`;
        if (test.details) {
          report += `  详情: ${JSON.stringify(test.details, null, 2)}\n`;
        }
      });
    }

    report += `\n详细结果:\n`;
    this.results.forEach(test => {
      report += `${test.passed ? '✅' : '❌'} ${test.testName}\n`;
    });

    return report;
  }
}

// 便捷的测试运行函数
export async function runDPSystemTests(): Promise<string> {
  const tester = new DPSystemTester();
  await tester.runAllTests();
  return tester.generateReport();
}

// 开发环境下的快速测试
export function quickDPTest() {
  console.log('🧪 开始 DP 系统快速测试...');
  
  runDPSystemTests().then(report => {
    console.log(report);
  }).catch(error => {
    console.error('DP 系统测试失败:', error);
  });
}
