# Command Shortcut Customizer

[![English](https://img.shields.io/badge/Language-English-blue)](README_EN.md)

一个强大的 VSCode 扩展，允许你创建自定义快捷键来执行命令、脚本，并支持参数化配置。

## 功能特点

- **自定义命令快捷键**：为常用的 shell 命令或 VSCode 命令绑定快捷键
- **参数化命令**：支持在命令中使用变量，执行时动态输入
- **多种参数类型**：支持文本输入和下拉选择两种参数类型
- **命令面板集成**：快速从命令面板中搜索并执行自定义命令

![功能演示](https://i.vgy.me/01qJDH.gif)

## 安装

在 VSCode 扩展市场中搜索"Command Shortcut Customizer"或从[VSCode 扩展市场](https://marketplace.visualstudio.com/items?itemName=wisen.shortcut-customizer)直接安装。

## 使用方法

### 基本配置

打开 VSCode 设置（`Ctrl+,`），搜索"Command Shortcut Customizer"，编辑`settings.json`来配置你的自定义命令：

```json
"shortcut-customizer.commands": [
  {
    "name": "start-dev-server",            // 命令名称，用于在命令面板中显示
    "command": "npm run dev",              // 要执行的shell命令
    "shortcut": "alt+shift+d",             // 可选：绑定的快捷键
    "type": "shell",                       // 命令类型：shell或code
    "parameters": []                       // 可选：命令参数
  }
]
```

### 添加参数

你可以为命令添加参数，使其更加灵活：

```json
"shortcut-customizer.commands": [
  {
    "name": "run-script",
    "command": "node scripts/$scriptName$.js --env=${env}$",
    "type": "shell",
    "parameters": [
      {
        "name": "scriptName",                // 参数名称，用于替换命令中的$scriptName$
        "type": "select",                    // 参数类型：input或select
        "prompt": "选择要运行的脚本",          // 提示信息
        "defaultValue": "main",              // 默认值
        "options": ["main", "build", "test"] // 当type为select时的选项
      },
      {
        "name": "env",
        "type": "input",                     // 文本输入类型
        "prompt": "输入环境名称",
        "defaultValue": "development"
      }
    ]
  }
]
```

### 配置后操作

新增配置后需要运行命令重新启动窗口注册快捷键

1. 打开命令面板（`Ctrl+Shift+P`）
2. 运行 "Reload Window"

### 执行命令

有三种方式可以执行你的自定义命令：

1. 使用已配置的快捷键
2. 打开命令面板（`Ctrl+Shift+P`），输入命令名称
3. 打开命令面板，运行"Run Customizer Command"，然后从列表中选择

## 配置项说明

### 命令配置

| 属性       | 类型              | 必填 | 描述                                                    |
| ---------- | ----------------- | ---- | ------------------------------------------------------- |
| name       | string            | 是   | 命令名称，用于在命令面板中显示和识别                    |
| command    | string            | 是   | 要执行的 shell 命令或 VSCode 命令                       |
| type       | "shell" \| "code" | 是   | 命令类型，shell 表示终端命令，code 表示 VSCode 内部命令 |
| shortcut   | string            | 否   | 绑定的快捷键，例如"alt+shift+1"                         |
| parameters | array             | 否   | 命令参数定义                                            |

### 参数配置

| 属性         | 类型                | 必填                     | 描述                                          |
| ------------ | ------------------- | ------------------------ | --------------------------------------------- |
| name         | string              | 是                       | 参数名称，用于在命令中替换$name$              |
| type         | "input" \| "select" | 是                       | 参数类型，input 为文本输入，select 为下拉选择 |
| prompt       | string              | 否                       | 参数提示信息                                  |
| defaultValue | string              | 否                       | 参数默认值                                    |
| options      | array               | 当 type 为 select 时必填 | 下拉选项列表                                  |

## 使用示例

### 示例 1：启动开发服务器

```json
{
  "name": "start-dev",
  "command": "cd $projectPath$ && npm run dev",
  "shortcut": "alt+d",
  "type": "shell",
  "parameters": [
    {
      "name": "projectPath",
      "type": "input",
      "prompt": "项目路径",
      "defaultValue": "${workspaceFolder}"
    }
  ]
}
```

### 示例 2：Git 操作

```json
{
  "name": "git-commit",
  "command": "git add . && git commit -m \"${message}$\"",
  "type": "shell",
  "parameters": [
    {
      "name": "message",
      "type": "input",
      "prompt": "输入提交信息"
    }
  ]
}
```

### 示例 3：运行不同环境的测试

```json
{
  "name": "run-test",
  "command": "npm run test:${env}$",
  "shortcut": "alt+shift+t",
  "type": "shell",
  "parameters": [
    {
      "name": "env",
      "type": "select",
      "prompt": "选择测试环境",
      "options": ["unit", "integration", "e2e"],
      "defaultValue": "unit"
    }
  ]
}
```

## 已知问题

- 某些复杂的 shell 命令可能需要使用转义字符
- 在 Windows 中使用特定路径时可能需要调整路径分隔符

## 更新日志

### 1.1.0

- 初始版本发布
- 支持自定义命令和快捷键
- 支持参数化命令
- 支持 input 和 select 参数类型
- 命令面板集成

## 贡献

欢迎提交问题和建议到[GitHub 仓库](https://github.com/wisenchen/shortcut-customizer)。

## 许可证

MIT
