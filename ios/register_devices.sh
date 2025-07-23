#!/bin/bash

# iOS设备注册脚本
# 使用方法: ./register_devices.sh

echo "📱 iOS设备UDID获取和注册指南"
echo "================================"

echo ""
echo "🔍 获取设备UDID的方法："
echo ""
echo "方法1 - 通过Xcode："
echo "  1. 连接设备到Mac"
echo "  2. 打开Xcode → Window → Devices and Simulators"
echo "  3. 选择设备，复制Identifier"
echo ""
echo "方法2 - 通过命令行："
echo "  连接设备后运行: xcrun xctrace list devices"
echo ""
echo "方法3 - 通过设备设置："
echo "  设置 → 通用 → 关于本机 → 查看设备信息"

echo ""
echo "📋 当前已连接的设备："
echo "================================"

# 获取当前连接的设备
if command -v xcrun &> /dev/null; then
    xcrun xctrace list devices 2>/dev/null | grep -E "iPhone|iPad" | grep -v "Simulator" | head -10
else
    echo "❌ 未找到Xcode命令行工具"
fi

echo ""
echo "🔧 注册设备步骤："
echo "================================"
echo "1. 访问 https://developer.apple.com"
echo "2. 登录Apple Developer账号"
echo "3. 进入 Certificates, Identifiers & Profiles"
echo "4. 选择 Devices → 点击 + 按钮"
echo "5. 输入设备名称和上面显示的UDID"
echo "6. 选择设备类型并注册"
echo ""
echo "📱 更新描述文件："
echo "================================"
echo "1. 在Profiles中找到开发描述文件"
echo "2. 点击Edit，勾选新设备"
echo "3. 重新生成并下载描述文件"
echo "4. 双击安装到Xcode"
echo ""
echo "🚀 重新打包："
echo "================================"
echo "设备注册完成后，运行以下命令重新打包："
echo "  ./build_ipa.sh development"
echo ""

# 检查当前项目的Bundle ID
if [ -f "AIToys/Info.plist" ]; then
    BUNDLE_ID=$(plutil -p AIToys/Info.plist | grep CFBundleIdentifier | cut -d'"' -f4)
    echo "📦 当前项目Bundle ID: $BUNDLE_ID"
    echo "   请确保在Developer账号中使用相同的Bundle ID"
fi

echo ""
echo "💡 提示："
echo "- Development包只能安装在注册的设备上"
echo "- 免费开发者账号最多注册100台设备/年"
echo "- 付费开发者账号最多注册100台设备/年"
echo "- 设备注册后一年内不能删除"
