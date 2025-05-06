export interface CommandConfig {
  /**
   * 自定义命令名称
   */
  name: string;
  /**
   * 自定义命令快捷键
   */
  shortcut?: string;
  /**
   * 执行命令
   */
  command: string;

  /**
   * 执行命令类型
   * shell: 执行shell命令
   * code: 执行vscode命令
   */
  type: "shell" | "code";
  /**
   * 参数定义
   */
  parameters?: Array<CommandParameter>;
}

/**
 * 命令参数定义
 */
export interface CommandParameter {
  /**
   * 参数名称
   */
  name: string;
  /**
   * 参数类型
   */
  type: "input" | "select";
  /**
   * 默认值
   */
  defaultValue?: string;
  /**
   * 提示信息
   */
  prompt?: string;
  /**
   * 下拉菜单枚举， 如果是 select类型， 则必须指定enum
   */
  options?: string[];
}

export interface CommandExecutionResult {
  success: boolean;
  output: string;
}

/**
 * 自定义命令 配置项的 JSON 类型定义
 */
export interface CustomCommandConfig {
  commands: CommandConfig[];
}
