import * as vscode from "vscode";
import { CommandConfig, CommandParameter } from "../types";
import { CommandExecutor } from "./commandExecutor";
import path from "path";
import fs from "fs";
export class CommandManager {
  private disposables: vscode.Disposable[] = [];

  constructor(private context: vscode.ExtensionContext) {
    this.registerSelectCommand(context);
  }

  // 注册所有存储的命令
  async registerCommands() {
    const configs = this.getStoredCommands();
    console.log("[shortcut-customizer] configs", configs);
    configs.forEach((config) => {
      // 注册命令
      console.log("[shortcut-customizer] registerCommand", config);
      const disposable = vscode.commands.registerCommand(`shortcut-customizer.${config.name}`, async () => {
        // 运行了
        vscode.window.showInformationMessage(`[shortcut-customizer] 运行 ${config.name}`);

        // 如果有参数
        if (config.parameters && config.parameters.length > 0) {
          const params = await this.promptForParameters(config.parameters);
          this.executeCommand(config, params);
          return;
        }
        this.executeCommand(config);
      });

      // 注册快捷键
      if (config.shortcut) {
        this.registerShortcut(config.shortcut, config.command);
      }
      this.disposables.push(disposable);
    });
  }

  // 获取存储的指令配置
  private getStoredCommands(): CommandConfig[] {
    // 从配置文件中获取
    const config = vscode.workspace.getConfiguration("shortcut-customizer");
    return config.get("commands") || [];
  }

  // 参数输入交互
  private async promptForParameters(parameters: CommandParameter[]) {
    const params: Record<string, string> = {};

    if (parameters) {
      for (const param of parameters) {
        const value = await vscode.window.showInputBox({
          prompt: param.prompt || `请输入 ${param.name} (默认值: ${param.defaultValue || "无"})`,
          placeHolder: param.defaultValue || "",
          ignoreFocusOut: true,
        });
        params[param.name] = value || param.defaultValue || "";
      }
    }
    return params;
  }

  // 执行终端命令
  private executeCommand(config: CommandConfig, params?: Record<string, string>) {
    const result = CommandExecutor.execute(config.name, config.command, params);
    if (!result.success) {
      vscode.window.showErrorMessage(result.output);
    }
  }

  registerSelectCommand(context: vscode.ExtensionContext) {
    context.subscriptions.push(
      vscode.commands.registerCommand("shortcut-customizer.runCommand", async () => {
        const configs = this.getStoredCommands();
        const options = configs.map((config) => config.name);
        const value = await vscode.window.showQuickPick(options);
        vscode.commands.executeCommand(`shortcut-customizer.${value}`);
      })
    );
  }

  // 注册快捷键
  async registerShortcut(shortcut: string, command: string) {
    const newBinding = {
      key: shortcut,
      command: command,
    };
    try {
      // 获取用户级 keybindings.json 路径， 如果没有则创建
      // console.log(vscode.env);
      // console.log(vscode.workspace.workspaceFolders?[0].uri)
      const workspaceFolders = vscode.workspace.workspaceFolders;
      const workspaceFolder = (workspaceFolders?.length ? workspaceFolders[0].uri.path : "").replace(/^\//,'')
      console.log('workspaceFolder', workspaceFolder)
      const userKeybindingsPath = path.join(workspaceFolder, ".vscode", "keybindings.json");
      console.log('userKeybindingsPath', userKeybindingsPath)
      // 判断是否有该文件
      const fileExists = fs.existsSync(userKeybindingsPath);
      console.log('fileExists', fileExists)
      if (!fileExists) {
        const res = fs.writeFileSync(userKeybindingsPath, Buffer.from("[]"));
        console.log('create file', res)
      }
      // 读取现有内容
      const data = await vscode.workspace.fs.readFile(vscode.Uri.file(userKeybindingsPath));
      let keybindings = JSON.parse(data.toString() || "[]");

      // 避免重复添加
      const existingIndex = keybindings.findIndex((item: any) => item.command === newBinding.command);
      if (existingIndex >= 0) {
        keybindings[existingIndex] = newBinding; // 更新现有条目
      } else {
        keybindings.push(newBinding); // 新增条目
      }

      // 写回文件
      await vscode.workspace.fs.writeFile(
        vscode.Uri.file(userKeybindingsPath),
        Buffer.from(JSON.stringify(keybindings, null, 2))
      );
      vscode.window.showInformationMessage("快捷键已更新！");
    } catch (error: any) {
      console.log(`设置快捷键失败: ${error.message}`)
      vscode.window.showErrorMessage(`修改快捷键失败: ${error.message}`);
    }
  }

  dispose() {
    this.disposables.forEach((d) => d.dispose());
  }
}
