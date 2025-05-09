# Command Shortcut Customizer

[![中文](https://img.shields.io/badge/语言-中文-red)](README.md)

A powerful VSCode extension that allows you to create custom shortcuts for executing commands, scripts, and supports parameterized configuration.

## Features

- **Custom Command Shortcuts**: Bind keyboard shortcuts to common shell commands or VSCode commands
- **Parameterized Commands**: Use variables in commands that can be dynamically entered during execution
- **Multiple Parameter Types**: Support for both text input and dropdown selection parameter types
- **Command Palette Integration**: Quickly search and execute custom commands from the command palette

![Feature Demo](https://i.vgy.me/01qJDH.gif)

## Installation

Search for "Command Shortcut Customizer" in the VSCode Extension Marketplace or install directly from the [VSCode Extension Marketplace](https://marketplace.visualstudio.com/items?itemName=wisen.shortcut-customizer).

## Usage

### Basic Configuration

Open VSCode settings (`Ctrl+,`), search for "Command Shortcut Customizer", and edit `settings.json` to configure your custom commands:

```json
"shortcut-customizer.commands": [
  {
    "name": "start-dev-server",            // Command name displayed in the command palette
    "command": "npm run dev",              // Shell command to execute
    "shortcut": "alt+shift+d",             // Optional: keyboard shortcut
    "type": "shell",                       // Command type: shell or code
    "parameters": []                       // Optional: command parameters
  }
]
```

### Adding Parameters

You can add parameters to make your commands more flexible:

```json
"shortcut-customizer.commands": [
  {
    "name": "run-script",
    "command": "node scripts/$scriptName$.js --env=${env}$",
    "type": "shell",
    "parameters": [
      {
        "name": "scriptName",                // Parameter name, replaces $scriptName$ in the command
        "type": "select",                    // Parameter type: input or select
        "prompt": "Select script to run",    // Prompt message
        "defaultValue": "main",              // Default value
        "options": ["main", "build", "test"] // Options when type is select
      },
      {
        "name": "env",
        "type": "input",                     // Text input type
        "prompt": "Enter environment name",
        "defaultValue": "development"
      }
    ]
  }
]
```

### After Configuration

After adding new configurations, you need to reload the window to register the shortcuts:

1. Open the command palette (`Ctrl+Shift+P`)
2. Run "Reload Window"

### Executing Commands

There are three ways to execute your custom commands:

1. Use the configured keyboard shortcut
2. Open the command palette (`Ctrl+Shift+P`) and type the command name
3. Open the command palette, run "Run Customizer Command", then select from the list

## Configuration Options

### Command Configuration

| Property   | Type              | Required | Description                                                                  |
| ---------- | ----------------- | -------- | ---------------------------------------------------------------------------- |
| name       | string            | Yes      | Command name for display and identification in command palette               |
| command    | string            | Yes      | Shell command or VSCode command to execute                                   |
| type       | "shell" \| "code" | Yes      | Command type, shell for terminal commands, code for VSCode internal commands |
| shortcut   | string            | No       | Keyboard shortcut binding, e.g., "alt+shift+1"                               |
| parameters | array             | No       | Command parameter definitions                                                |

### Parameter Configuration

| Property     | Type                | Required                     | Description                                               |
| ------------ | ------------------- | ---------------------------- | --------------------------------------------------------- |
| name         | string              | Yes                          | Parameter name, used to replace $name$ in command         |
| type         | "input" \| "select" | Yes                          | Parameter type, input for text input, select for dropdown |
| prompt       | string              | No                           | Parameter prompt message                                  |
| defaultValue | string              | No                           | Parameter default value                                   |
| options      | array               | Required when type is select | List of dropdown options                                  |

## Examples

### Example 1: Start Development Server

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
      "prompt": "Project path",
      "defaultValue": "${workspaceFolder}"
    }
  ]
}
```

### Example 2: Git Operations

```json
{
  "name": "git-commit",
  "command": "git add . && git commit -m \"${message}$\"",
  "type": "shell",
  "parameters": [
    {
      "name": "message",
      "type": "input",
      "prompt": "Enter commit message"
    }
  ]
}
```

### Example 3: Run Tests in Different Environments

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
      "prompt": "Select test environment",
      "options": ["unit", "integration", "e2e"],
      "defaultValue": "unit"
    }
  ]
}
```

## Known Issues

- Some complex shell commands may require escape characters
- Path separators might need adjustment when using specific paths in Windows

## Changelog

### 1.1.0

- Initial release
- Support for custom commands and shortcuts
- Support for parameterized commands
- Support for input and select parameter types
- Command palette integration

## Contributing

Issues and suggestions are welcome in the [GitHub repository](https://github.com/wisenchen/shortcut-customizer).

## License

MIT
