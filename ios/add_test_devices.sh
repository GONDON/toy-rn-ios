#!/bin/bash

# 添加测试设备脚本
# 使用方法: ./add_test_devices.sh

echo "📱 添加测试设备到Apple Developer账号"
echo "===================================="

echo ""
echo "📋 请按以下格式准备测试设备信息："
echo "设备名称,UDID,设备类型"
echo "例如："
echo "张三的iPhone,00008030-001234567890123A,iPhone"
echo "李四的iPad,00008030-001234567890123B,iPad"
echo ""

# 创建设备信息模板文件
cat > devices_template.txt << 'EOF'
# 设备注册模板文件
# 格式: 设备名称,UDID,设备类型
# 示例:
# 张三的iPhone,00008030-001234567890123A,iPhone
# 李四的iPad,00008030-001234567890123B,iPad

# 请在下面添加测试设备信息:

EOF

echo "📝 已创建设备信息模板文件: devices_template.txt"
echo "请编辑此文件，添加测试设备信息"
echo ""

echo "🔧 完整操作步骤："
echo "================================"
echo ""
echo "步骤1: 收集设备信息"
echo "  - 让测试人员发送设备UDID"
echo "  - 编辑 devices_template.txt 文件"
echo ""
echo "步骤2: 在Apple Developer中注册设备"
echo "  1. 访问 https://developer.apple.com"
echo "  2. 登录开发者账号 (Team ID: 8Q58Y9TGLW)"
echo "  3. 进入 Certificates, Identifiers & Profiles"
echo "  4. 选择 Devices → 点击 + 按钮"
echo "  5. 逐个添加设备或批量上传"
echo ""
echo "步骤3: 更新描述文件"
echo "  1. 进入 Profiles 页面"
echo "  2. 找到 Bundle ID: com.talenpal.talenpalapp 的开发描述文件"
echo "  3. 点击 Edit → 勾选新设备 → Generate"
echo "  4. 下载并双击安装新的描述文件"
echo ""
echo "步骤4: 重新打包"
echo "  运行: ./build_ipa.sh development"
echo ""

echo "📱 测试人员如何获取UDID："
echo "================================"
echo ""
echo "方法1 - 通过设置应用："
echo "  设置 → 通用 → 关于本机 → 复制设备标识符"
echo ""
echo "方法2 - 通过iTunes/Finder："
echo "  连接设备 → 点击设备信息 → 复制UDID"
echo ""
echo "方法3 - 通过第三方网站："
echo "  访问 https://www.whatsmyudid.com"
echo "  使用Safari浏览器获取UDID"
echo ""

echo "💡 重要提示："
echo "================================"
echo "- UDID是40位字符串，类似: 00008030-001234567890123A"
echo "- 每个Apple Developer账号每年最多注册100台设备"
echo "- 设备注册后一年内不能删除"
echo "- Development包只能安装在注册的设备上"
echo "- 如果需要更多设备，考虑使用TestFlight"
echo ""

echo "🚀 TestFlight替代方案："
echo "================================"
echo "如果测试设备较多，建议使用TestFlight："
echo "1. 打包App Store版本: ./build_ipa.sh appstore"
echo "2. 上传到App Store Connect"
echo "3. 邀请测试人员通过邮箱加入TestFlight"
echo "4. 测试人员通过TestFlight应用安装"
echo ""

# 检查是否有设备信息文件
if [ -f "devices_template.txt" ]; then
    echo "✅ 设备模板文件已创建: devices_template.txt"
    echo "请编辑此文件添加测试设备信息"
fi

echo ""
echo "📞 需要帮助？"
echo "如果遇到问题，请提供以下信息："
echo "- 测试设备的UDID"
echo "- 设备类型（iPhone/iPad）"
echo "- 错误信息截图"
