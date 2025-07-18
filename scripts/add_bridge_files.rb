#!/usr/bin/env ruby

require 'xcodeproj'

# 项目路径
project_path = 'ios/AIToys.xcodeproj'
project = Xcodeproj::Project.open(project_path)

# 找到主target
main_target = project.targets.find { |target| target.name == 'AIToys' }
test_target = project.targets.find { |target| target.name == 'AIToysTests' }
ui_test_target = project.targets.find { |target| target.name == 'AIToysUITests' }

# 找到RN文件夹组
rn_group = project.main_group.find_subpath('AIToys/RN')

if rn_group.nil?
  puts "❌ 未找到RN文件夹组"
  exit 1
end

# 要添加的文件
files_to_add = [
  {
    path: 'ios/AIToys/RN/TuyaDeviceControlBridge.h',
    name: 'TuyaDeviceControlBridge.h'
  },
  {
    path: 'ios/AIToys/RN/TuyaDeviceControlBridge.m',
    name: 'TuyaDeviceControlBridge.m'
  }
]

files_to_add.each do |file_info|
  file_path = file_info[:path]
  file_name = file_info[:name]
  
  # 检查文件是否存在
  unless File.exist?(file_path)
    puts "❌ 文件不存在: #{file_path}"
    next
  end
  
  # 检查文件是否已经在项目中
  existing_file = rn_group.children.find { |child| child.display_name == file_name }
  if existing_file
    puts "⚠️  文件已存在于项目中: #{file_name}"
    next
  end
  
  # 添加文件引用
  file_ref = rn_group.new_reference(file_path)
  file_ref.name = file_name
  
  # 如果是.m文件，添加到编译阶段
  if file_name.end_with?('.m')
    # 添加到主target
    if main_target
      main_target.source_build_phase.add_file_reference(file_ref)
      puts "✅ 已将 #{file_name} 添加到主target编译阶段"
    end
    
    # 添加到测试target
    if test_target
      test_target.source_build_phase.add_file_reference(file_ref)
      puts "✅ 已将 #{file_name} 添加到测试target编译阶段"
    end
    
    # 添加到UI测试target
    if ui_test_target
      ui_test_target.source_build_phase.add_file_reference(file_ref)
      puts "✅ 已将 #{file_name} 添加到UI测试target编译阶段"
    end
  end
  
  puts "✅ 已添加文件: #{file_name}"
end

# 保存项目
project.save

puts "🎉 所有文件已成功添加到Xcode项目中！"
puts ""
puts "下一步："
puts "1. 在Xcode中打开项目: open ios/AIToys.xcworkspace"
puts "2. 编译项目验证: Cmd + B"
puts "3. 运行测试组件验证功能"
