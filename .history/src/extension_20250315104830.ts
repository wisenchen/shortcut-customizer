import * as vscode from 'vscode';
import { CommandManager } from './commands';
import { WebviewManager } from './webview/webviewManager';

export function activate(context: vscode.ExtensionContext) {
  const commandManager = new CommandManager(context);

  // 注册配置命令
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.configureCommands', () => {
      WebviewManager.show(context);
    })
  );

  // 初始化已存储的命令
  commandManager.registerCommands();

  // 注册重启命令
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.reloadCommands', () => {
      commandManager.dispose();
      commandManager.registerCommands();
      vscode.window.showInformationMessage('命令已重新加载');
    })
  );
}