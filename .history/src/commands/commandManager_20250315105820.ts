import * as vscode from 'vscode';
import { CommandConfig } from '../types';
import { CommandExecutor } from './commandExecutor';

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
    const params: Record<string, string> = {};
    
    if (config.parameters) {
      for (const param of config.parameters) {
        const value = await vscode.window.showInputBox({
          prompt: param.prompt || `请输入 ${param.name} (默认值: ${param.defaultValue || '无'})`,
          placeHolder: param.defaultValue || '',
          ignoreFocusOut: true
        });
        params[param.name] = value || param.defaultValue || '';
      }
    }
    return params;
  }

  // 执行终端命令
  private executeCommand(command: string, params: Record<string, string>) {
    const result = CommandExecutor.execute(command, params);
    if (!result.success) {
      vscode.window.showErrorMessage(result.output);
    }
  }

  dispose() {
    this.disposables.forEach(d => d.dispose());
  }
}