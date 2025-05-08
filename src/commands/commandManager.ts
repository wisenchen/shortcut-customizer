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

    // 收集所有需要注册的快捷键
    const shortcutsToRegister: { shortcut: string; command: string }[] = [];

    configs.forEach((config) => {
      // 注册命令
      console.log("[shortcut-customizer] registerCommand", config);
      const commandName = `shortcut-customizer.${config.name}`;
      const disposable = vscode.commands.registerCommand(commandName, async () => {
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

      // 收集快捷键
      if (config.shortcut) {
        shortcutsToRegister.push({
          shortcut: config.shortcut,
          command: commandName,
        });
      }
      this.disposables.push(disposable);
    });

    // 批量注册快捷键
    if (shortcutsToRegister.length > 0) {
      await this.registerShortcutsBatch(shortcutsToRegister);
    }
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
        const options = configs.map((config) => ({
          label: config.name,
          description: config.shortcut ? `快捷键: ${config.shortcut}` : "无快捷键",
          detail: config.command,
        }));

        if (options.length === 0) {
          vscode.window.showInformationMessage("没有找到自定义命令，请先添加命令");
          return;
        }

        const selected = await vscode.window.showQuickPick(options, {
          placeHolder: "选择要运行的自定义命令",
          matchOnDescription: true,
          matchOnDetail: true,
        });

        if (selected) {
          vscode.commands.executeCommand(`shortcut-customizer.${selected.label}`);
        }
      })
    );
  }

  // 获取编辑器类型
  private getEditorType(): { isVSCode: boolean; isCursor: boolean } {
    const isVSCode = vscode.env.appName.includes("Visual Studio Code");
    const isCursor = vscode.env.appName.includes("Cursor");
    return { isVSCode, isCursor };
  }

  // 获取keybindings.json文件路径
  private getKeybindingsPath(): string {
    const { isCursor } = this.getEditorType();
    const homeDir = process.env.USERPROFILE || process.env.HOME || "";

    let userKeybindingsPath = path.join(homeDir, "AppData", "Roaming", "Code", "User", "keybindings.json");
    if (isCursor) {
      userKeybindingsPath = path.join(homeDir, "AppData", "Roaming", "Cursor", "User", "keybindings.json");
    }
    return userKeybindingsPath;
  }

  // 确保keybindings文件存在
  private async ensureKeybindingsFileExists(filePath: string): Promise<void> {
    try {
      const fileExists = fs.existsSync(filePath);
      if (!fileExists) {
        // 确保目录存在
        const dirPath = path.dirname(filePath);
        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath, { recursive: true });
        }
        // 创建空的 keybindings.json 文件
        fs.writeFileSync(filePath, "[]");
        console.log("[shortcut-customizer] 创建配置文件");
      }
    } catch (error: any) {
      console.log(`确保文件存在失败: ${error.message}`);
      throw new Error(`无法创建配置文件: ${error.message}`);
    }
  }

  // 解析keybindings文件内容
  private async parseKeybindingsFile(filePath: string): Promise<{ keybindings: any[]; commentLine: string | null }> {
    try {
      const data = await vscode.workspace.fs.readFile(vscode.Uri.file(filePath));
      const fileContent = data.toString() || "[]";

      // 检查是否第一行是注释
      const lines = fileContent.split("\n");
      let commentLine = null;
      let contentToProcess = fileContent;

      if (lines.length > 0 && lines[0].trim().startsWith("//")) {
        commentLine = lines[0];
        // 去掉第一行，解析剩余内容
        contentToProcess = lines.slice(1).join("\n");
      }

      const keybindings = JSON.parse(contentToProcess);
      return { keybindings, commentLine };
    } catch (error: any) {
      console.log(`解析keybindings.json失败: ${error.message}`);
      throw new Error(`无法解析配置文件: ${error.message}`);
    }
  }

  // 更新keybindings内容
  private updateKeybindings(keybindings: any[], newBindings: any[]): any[] {
    // 先清除所有与shortcut-customizer相关的绑定
    keybindings = keybindings.filter((item: any) => {
      // 保留不属于shortcut-customizer的绑定
      return !item.command || !item.command.startsWith("shortcut-customizer.");
    });

    // 添加新的绑定
    return [...keybindings, ...newBindings];
  }

  // 写回keybindings文件，保留注释
  private async writeKeybindingsFile(filePath: string, keybindings: any[], commentLine: string | null): Promise<void> {
    try {
      // 序列化keybindings
      const updatedContent = JSON.stringify(keybindings, null, 2);
      let finalContent = updatedContent;

      // 如果有注释行，添加回去
      if (commentLine) {
        finalContent = commentLine + "\n" + updatedContent;
      }

      // 写回文件
      await vscode.workspace.fs.writeFile(vscode.Uri.file(filePath), Buffer.from(finalContent));
    } catch (error: any) {
      console.log(`写入keybindings.json失败: ${error.message}`);
      throw new Error(`无法写入配置文件: ${error.message}`);
    }
  }

  // 批量注册快捷键
  async registerShortcutsBatch(shortcuts: { shortcut: string; command: string }[]) {
    try {
      if (shortcuts.length === 0) return;

      const { isVSCode } = this.getEditorType();

      // 1. 获取keybindings.json路径
      const keybindingsPath = this.getKeybindingsPath();
      console.log("[shortcut-customizer] 使用配置文件路径:", keybindingsPath);

      // 2. 确保文件存在
      await this.ensureKeybindingsFileExists(keybindingsPath);

      // 3. 解析文件内容
      const { keybindings, commentLine } = await this.parseKeybindingsFile(keybindingsPath);

      // 4. 准备所有需要添加的绑定
      const newBindings = shortcuts.map(({ shortcut, command }) => ({ key: shortcut, command }));

      // 5. 更新keybindings
      const updatedKeybindings = this.updateKeybindings(keybindings, newBindings);

      // 6. 写回文件
      await this.writeKeybindingsFile(keybindingsPath, updatedKeybindings, commentLine);

      // 7. 显示成功消息
      vscode.window.showInformationMessage(
        `已批量更新${shortcuts.length}个快捷键到${isVSCode ? "VSCode" : "Cursor"}配置！`
      );
    } catch (error: any) {
      console.log(`批量设置快捷键失败: ${error.message}`);
      vscode.window.showErrorMessage(`批量修改快捷键失败: ${error.message}`);
    }
  }

  // 注册单个快捷键（保留向后兼容性）
  async registerShortcut(shortcut: string, command: string) {
    await this.registerShortcutsBatch([{ shortcut, command }]);
  }

  dispose() {
    // 清理所有注册的命令
    this.disposables.forEach((d) => d.dispose());
    this.disposables = []; // 重置数组，避免重复dispose
    console.log("[shortcut-customizer] 已清理所有命令资源");
  }
}
