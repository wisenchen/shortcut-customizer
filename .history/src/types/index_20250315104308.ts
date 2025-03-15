export interface CommandConfig {
  name: string;
  command: string;
  parameters?: Array<{
    name: string;
    defaultValue?: string;
    prompt?: string;
  }>;
}

export interface CommandExecutionResult {
  success: boolean;
  output: string;
}
