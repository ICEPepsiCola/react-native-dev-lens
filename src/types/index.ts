export type RequestType = 'Fetch/XHR' | 'Socket'

export interface WebSocketMessage {
  id: string;
  direction: 'send' | 'receive';
  data: string;
  timestamp: number;
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
  type: RequestType;
  // WebSocket specific fields
  ws_state?: 'connecting' | 'open' | 'closing' | 'closed' | 'error';
  ws_messages?: WebSocketMessage[];
}

export interface ConsoleLog {
  level: string;
  message: string;
}

export type DetailTab = 'General' | 'Headers' | 'Response'
export type FilterType = 'All' | RequestType
export type LogLevelFilter = 'all' | 'info' | 'warn' | 'error'


export interface WebSocketUpdate {
  state?: 'connecting' | 'open' | 'closing' | 'closed' | 'error'
  status?: number
  response_time?: number
  message?: WebSocketMessage
  error?: string
  close_reason?: string
}
