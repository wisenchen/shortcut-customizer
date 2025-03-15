import * as vscode from 'vscode';
import { CommandExecutionResult } from '../types';

export class CommandExecutor {
  static execute(command: string, params: Record<string, string>): CommandExecutionResult {
    try {
      const parsedCommand = this.replacePlaceholders(command, params);
      const terminal = vscode.window.createTerminal('Custom Command');
      terminal.show();
      terminal.sendText(parsedCommand);
      return { success: true, output: `命令执行成功: ${parsedCommand}` };
    } catch (error) {
      return { success: false, output: `执行失败: ${error instanceof Error ? error.message : String(error)}` };
    }
  }

  private static replacePlaceholders(command: string, params: Record<string, string>): string {
    return Object.entries(params).reduce(
      (cmd, [key, value]) => cmd.replace(new RegExp(`\$${key}\$`, 'g'), value),
      command
    );
  }
}