import * as vscode from "vscode";
import { CommandManager } from "./commands";
import { WebviewManager } from "./webview/webviewManager";

export function activate(context: vscode.ExtensionContext) {
  const commandManager = new CommandManager(context);

  // 初始化已存储的命令
  commandManager.registerCommands();

}
