import * as vscode from "vscode";
import { CommandManager } from "./commands";

export function activate(context: vscode.ExtensionContext) {
  const commandManager = new CommandManager(context);

  // 初始化已存储的命令
  commandManager.registerCommands();

  // 注册重载命令配置的命令
  context.subscriptions.push(
    vscode.commands.registerCommand("shortcut-customizer.reloadCommands", () => {
      commandManager.dispose(); // 清除旧的命令注册
      commandManager.registerCommands(); // 重新注册命令
      vscode.window.showInformationMessage("快捷键命令已重新加载!");
    })
  );

  // 输出状态信息
  console.log("[shortcut-customizer] 扩展已激活");
}

export function deactivate() {
  // 清理资源
}
