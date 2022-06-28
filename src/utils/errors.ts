export class ConfigError extends Error {
  constructor(message: any) {
    super(message);
    this.name = 'ConfigError';
  }
}

export class WarningError extends Error {
  constructor(message: any) {
    super(message);
    this.name = 'WarningError';
  }
}
