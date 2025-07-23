#!/bin/bash

# iOS打包脚本
# 使用方法: ./build_ipa.sh [adhoc|appstore|development]

set -e

# 默认打包类型
BUILD_TYPE=${1:-adhoc}

# 项目配置
WORKSPACE="AIToys.xcworkspace"
SCHEME="AIToys"
CONFIGURATION="Release"
ARCHIVE_PATH="./build/AIToys.xcarchive"
EXPORT_PATH="./build"

echo "🚀 开始iOS打包流程..."
echo "📦 打包类型: $BUILD_TYPE"

# 创建build目录
mkdir -p build

# 清理之前的构建
echo "🧹 清理之前的构建..."
rm -rf build/*

# 首先运行React Native代码生成
echo "📝 生成React Native代码..."
cd ..
npx react-native codegen
cd ios

# 复制生成的文件到正确位置
echo "📋 复制生成的文件..."
mkdir -p build/generated
cp -r ../build/generated/ios build/generated/

# 清理Xcode构建缓存
xcodebuild clean -workspace $WORKSPACE -scheme $SCHEME

# 构建Archive
echo "🔨 开始构建Archive..."
xcodebuild archive \
  -workspace $WORKSPACE \
  -scheme $SCHEME \
  -configuration $CONFIGURATION \
  -destination "generic/platform=iOS" \
  -archivePath $ARCHIVE_PATH \
  -allowProvisioningUpdates

# 根据类型选择导出配置
case $BUILD_TYPE in
  "adhoc")
    EXPORT_OPTIONS="ExportOptions.plist"
    ;;
  "appstore")
    EXPORT_OPTIONS="ExportOptionsAppStore.plist"
    ;;
  "development")
    EXPORT_OPTIONS="ExportOptionsDevelopment.plist"
    ;;
  *)
    echo "❌ 未知的打包类型: $BUILD_TYPE"
    echo "支持的类型: adhoc, appstore, development"
    exit 1
    ;;
esac

# 检查导出配置文件是否存在
if [ ! -f "$EXPORT_OPTIONS" ]; then
  echo "❌ 导出配置文件不存在: $EXPORT_OPTIONS"
  exit 1
fi

# 导出IPA
echo "📱 导出IPA包..."
xcodebuild -exportArchive \
  -archivePath $ARCHIVE_PATH \
  -exportPath $EXPORT_PATH \
  -exportOptionsPlist $EXPORT_OPTIONS \
  -quiet

# 查找生成的IPA文件
IPA_FILE=$(find $EXPORT_PATH -name "*.ipa" | head -1)

if [ -f "$IPA_FILE" ]; then
  echo "✅ 打包成功!"
  echo "📍 IPA文件位置: $IPA_FILE"
  echo "📊 文件大小: $(du -h "$IPA_FILE" | cut -f1)"
  
  # 显示文件信息
  echo ""
  echo "📋 包信息:"
  echo "   Bundle ID: com.talenpal.talenpalapp"
  echo "   版本号: 1.0.0"
  echo "   构建号: 6"
  echo "   打包类型: $BUILD_TYPE"
  
  # 如果是Ad Hoc包，提示安装方法
  if [ "$BUILD_TYPE" = "adhoc" ]; then
    echo ""
    echo "📲 安装方法:"
    echo "   1. 将IPA文件发送给测试人员"
    echo "   2. 在iOS设备上使用Safari打开IPA文件"
    echo "   3. 或使用iTunes/Apple Configurator 2安装"
    echo "   4. 或使用第三方工具如蒲公英、fir.im分发"
  fi
else
  echo "❌ 打包失败，未找到IPA文件"
  exit 1
fi
