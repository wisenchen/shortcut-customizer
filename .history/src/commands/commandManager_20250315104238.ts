import * as vscode from 'vscode';
import { CommandConfig } from '../types';

export class CommandManager {
  private disposables: vscode.Disposable[] = [];

  constructor(private context: vscode.ExtensionContext) {}

  // 注册所有存储的命令
  async registerCommands() {
    const configs = this.getStoredCommands();
    configs.forEach(config => {
      const disposable = vscode.commands.registerCommand(
        `extension.${config.name}`,
        async () => {
          const params = await this.promptForParameters(config);
          this.executeCommand(config.command, params);
        }
      );
      this.disposables.push(disposable);
    });
  }

  // 获取存储的指令配置
  private getStoredCommands(): CommandConfig[] {
    return this.context.workspaceState.get('customCommands') || [];
  }

  // 参数输入交互
  private async promptForParameters(config: CommandConfig) {
    // 参数收集逻辑
  }

  // 执行终端命令
  private executeCommand(command: string, params: Record<string, string>) {
    // 命令执行逻辑
  }

  dispose() {
    this.disposables.forEach(d => d.dispose());
  }
}