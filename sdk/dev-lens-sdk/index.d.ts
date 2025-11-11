export interface DevLensOptions {
  baseUrl?: string;
  enabled?: boolean;
}

export interface NetworkRequest {
  id: string;
  method: string;
  url: string;
  status: number;
  response_time: number;
  headers: {
    request: Record<string, string>;
    response: Record<string, string>;
  };
  response: string;
  type: 'Fetch/XHR' | 'Socket';
}

export interface ConsoleLog {
  level: 'info' | 'warn' | 'error';
  message: string;
}

export default class DevLens {
  constructor(options?: DevLensOptions);
  sendNetworkLog(request: NetworkRequest): Promise<void>;
  sendConsoleLog(log: ConsoleLog): Promise<void>;
  interceptNetwork(): void;
  interceptWebSocket(): void;
  interceptConsole(): void;
  init(): void;
}
