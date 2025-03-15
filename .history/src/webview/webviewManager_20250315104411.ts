import * as vscode from 'vscode';
import { CommandConfig } from '../types';

export class WebviewManager {
  private static currentPanel: vscode.WebviewPanel | undefined;

  static show(context: vscode.ExtensionContext) {
    if (this.currentPanel) {
      this.currentPanel.reveal();
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      'customCommands',
      '命令配置',
      vscode.ViewColumn.One,
      { enableScripts: true }
    );

    panel.webview.html = this.getWebviewContent();
    this.setupMessageHandler(panel, context);
    this.currentPanel = panel;
  }

  private static getWebviewContent() {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>命令配置</title>
      </head>
      <body>
        <div id="app">
          <h1>自定义命令配置</h1>
          <!-- 配置表单将动态渲染在这里 -->
        </div>
        <script>
          const vscode = acquireVsCodeApi();
        </script>
      </body>
      </html>
    `;
  }

  private static setupMessageHandler(panel: vscode.WebviewPanel, context: vscode.ExtensionContext) {
    panel.webview.onDidReceiveMessage(
      message => {
        switch (message.type) {
          case 'saveCommand':
            this.handleSaveCommand(message.data, context);
            break;
        }
      },
      undefined,
      context.subscriptions
    );
  }

  private static async handleSaveCommand(command: CommandConfig, context: vscode.ExtensionContext) {
    const commands = context.workspaceState.get<CommandConfig[]>('customCommands') || [];
    const index = commands.findIndex(c => c.name === command.name);
    if (index >= 0) {
      commands[index] = command;
    } else {
      commands.push(command);
    }
    await context.workspaceState.update('customCommands', commands);
    vscode.window.showInformationMessage(`命令 ${command.name} 保存成功`);
  }
}