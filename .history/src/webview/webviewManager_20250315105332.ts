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
    const script = `
      <script>
        const { createApp } = Vue;
        createApp({
          data() {
            return {
              command: {
                name: '',
                command: '',
                parameters: []
              }
            }
          },
          methods: {
            saveConfig() {
              vscode.postMessage({
                type: 'saveCommand',
                data: this.command
              })
            }
          }
        }).mount('#app')
      <\/script>
    `;
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>命令配置</title>
      </head>
      <body>
        <div id="app">
          <h1>自定义命令配置</h1>
          <form @submit.prevent="saveConfig">
            <div>
              <label>命令名称：</label>
              <input v-model="command.name" required>
            </div>
            <div>
              <label>命令模板：</label>
              <textarea v-model="command.command" placeholder="例如：npm run $param$" required></textarea>
            </div>
            <button type="submit">保存配置</button>
          </form>
        </div>
        <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
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