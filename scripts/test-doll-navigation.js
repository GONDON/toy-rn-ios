#!/usr/bin/env node

/**
 * 测试Doll导航功能的脚本
 * 验证HomeViewController到DollPanel的导航实现
 */

const fs = require('fs');

console.log('🧪 开始验证Doll导航实现...\n');

// 检查HomeViewController.m是否正确导入和使用ReactViewController
const homeVC = fs.readFileSync('ios/AIToys/Home/HomeViewController.m', 'utf8');

console.log('🔍 检查HomeViewController.m实现...');

if (homeVC.includes('#import "ReactViewController.h"')) {
  console.log('✅ ReactViewController.h - 已正确导入');
} else {
  console.log('❌ ReactViewController.h - 未导入');
}

if (homeVC.includes('viewControllerWithInitialRoute:@"DollPanel"')) {
  console.log('✅ 导航方法 - 正确使用DollPanel路由');
} else {
  console.log('❌ 导航方法 - 未正确设置路由');
}

if (homeVC.includes('@"dollId": doll') && homeVC.includes('@"source": @"home-page"')) {
  console.log('✅ 参数传递 - 正确传递dollId和source参数');
} else {
  console.log('❌ 参数传递 - 参数设置不正确');
}

// 检查DollPanel页面是否正确处理参数
const dollPanel = fs.readFileSync('src/pages/DollPanel/index.tsx', 'utf8');

console.log('\n🔍 检查DollPanel页面实现...');

if (dollPanel.includes('route.params') && dollPanel.includes('params?.dollId')) {
  console.log('✅ 参数接收 - 正确处理路由参数');
} else {
  console.log('❌ 参数接收 - 未正确处理参数');
}

if (dollPanel.includes('console.log') && dollPanel.includes('从iOS接收到dollId')) {
  console.log('✅ 调试日志 - 包含调试信息');
} else {
  console.log('❌ 调试日志 - 缺少调试信息');
}

// 检查导航类型定义
const navTypes = fs.readFileSync('src/types/navigation.d.ts', 'utf8');

console.log('\n🔍 检查导航类型定义...');

if (navTypes.includes('DollPanel:') && navTypes.includes('dollId?:')) {
  console.log('✅ 类型定义 - DollPanel参数类型已定义');
} else {
  console.log('❌ 类型定义 - DollPanel参数类型缺失');
}

console.log('\n🎉 验证完成！');
console.log('\n📝 使用方法：');
console.log('在HomeViewController中调用：');
console.log('[self navigateToRNPageWithDoll:@"your-doll-id"];');
console.log('\n📱 测试步骤：');
console.log('1. 启动RN开发服务器');
console.log('2. 在Xcode中编译运行');
console.log('3. 在首页调用navigateToRNPageWithDoll方法');
console.log('4. 查看控制台日志确认参数传递');
