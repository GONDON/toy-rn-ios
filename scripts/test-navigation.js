#!/usr/bin/env node

/**
 * 测试iOS到RN导航功能的脚本
 * 用于验证实现是否正确
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 开始验证iOS到RN导航实现...\n');

// 检查文件是否存在
const filesToCheck = [
  'ios/AIToys/RN/ReactViewController.h',
  'ios/AIToys/RN/ReactViewController.m',
  'ios/AIToys/BaseClass/MyTabBarController.m',
  'App.tsx',
  'src/pages/Creation/index.tsx',
  'src/types/navigation.d.ts'
];

let allFilesExist = true;

filesToCheck.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} - 存在`);
  } else {
    console.log(`❌ ${file} - 不存在`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('\n❌ 部分文件缺失，请检查实现');
  process.exit(1);
}

// 检查关键代码片段
console.log('\n🔍 检查关键代码实现...');

// 检查ReactViewController.h是否包含新方法
const reactVCHeader = fs.readFileSync('ios/AIToys/RN/ReactViewController.h', 'utf8');
if (reactVCHeader.includes('viewControllerWithInitialRoute')) {
  console.log('✅ ReactViewController.h - 包含路由方法');
} else {
  console.log('❌ ReactViewController.h - 缺少路由方法');
}

// 检查MyTabBarController.m是否使用了ReactViewController
const tabBarController = fs.readFileSync('ios/AIToys/BaseClass/MyTabBarController.m', 'utf8');
if (tabBarController.includes('ReactViewController') && tabBarController.includes('viewControllerWithInitialRoute')) {
  console.log('✅ MyTabBarController.m - 已集成ReactViewController');
} else {
  console.log('❌ MyTabBarController.m - 未正确集成ReactViewController');
}

// 检查App.tsx是否使用了NavigationContainer
const appTsx = fs.readFileSync('App.tsx', 'utf8');
if (appTsx.includes('NavigationContainer') && appTsx.includes('initialRoute')) {
  console.log('✅ App.tsx - 支持动态路由');
} else {
  console.log('❌ App.tsx - 不支持动态路由');
}

// 检查Creation页面是否处理路由参数
const creationPage = fs.readFileSync('src/pages/Creation/index.tsx', 'utf8');
if (creationPage.includes('useRoute') && creationPage.includes('route.params')) {
  console.log('✅ Creation页面 - 支持路由参数');
} else {
  console.log('❌ Creation页面 - 不支持路由参数');
}

console.log('\n🎉 验证完成！');
console.log('\n📝 下一步操作：');
console.log('1. 确保React Native开发服务器正在运行');
console.log('2. 在Xcode中编译并运行iOS应用');
console.log('3. 点击"创作"标签页测试导航功能');
console.log('4. 查看控制台日志确认参数传递');
