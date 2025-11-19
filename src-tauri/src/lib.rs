use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter};
use std::collections::HashMap;
use axum::{
    extract::{ws::WebSocketUpgrade, State},
    response::IntoResponse,
    routing::get,
    Router,
};
use axum::extract::ws::{WebSocket, Message};
use tower_http::cors::{CorsLayer, Any};
use std::sync::Arc;
use futures::{sink::SinkExt, stream::StreamExt};

#[derive(Debug, Deserialize, Serialize, Clone)]
struct WebSocketMessage {
    id: String,
    direction: String,
    data: String,
    timestamp: u64,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
struct NetworkRequest {
    id: String,
    method: String,
    url: String,
    status: u16,
    response_time: u64,
    headers: NetworkHeaders,
    #[serde(skip_serializing_if = "Option::is_none")]
    cookies: Option<HashMap<String, String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    query_params: Option<HashMap<String, String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    request_body: Option<String>,
    response_body: String,
    #[serde(rename = "type")]
    request_type: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    ws_state: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    ws_messages: Option<Vec<WebSocketMessage>>,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
struct NetworkHeaders {
    request: HashMap<String, String>,
    response: HashMap<String, String>,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
struct ConsoleLog {
    level: String,
    message: String,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
struct WebSocketUpdate {
    #[serde(skip_serializing_if = "Option::is_none")]
    state: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    status: Option<u16>,
    #[serde(skip_serializing_if = "Option::is_none")]
    response_time: Option<u64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    message: Option<WebSocketMessage>,
    #[serde(skip_serializing_if = "Option::is_none")]
    error: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    close_reason: Option<String>,
}

#[derive(Clone)]
struct AppState {
    app_handle: AppHandle,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(tag = "type")]
enum ClientMessage {
    #[serde(rename = "network")]
    Network { data: NetworkRequest },
    #[serde(rename = "console")]
    Console { data: ConsoleLog },
    #[serde(rename = "websocket-update")]
    WebSocketUpdate { ws_id: String, data: WebSocketUpdate },
}

async fn handle_websocket(
    ws: WebSocketUpgrade,
    State(state): State<Arc<AppState>>,
) -> impl IntoResponse {
    ws.on_upgrade(|socket| handle_socket(socket, state))
}

async fn handle_socket(socket: WebSocket, state: Arc<AppState>) {
    let (mut sender, mut receiver) = socket.split();
    
    println!("WebSocket client connected");

    while let Some(msg) = receiver.next().await {
        match msg {
            Ok(Message::Text(text)) => {
                // 解析消息
                match serde_json::from_str::<ClientMessage>(&text) {
                    Ok(client_msg) => {
                        match client_msg {
                            ClientMessage::Network { data } => {
                                if let Err(e) = state.app_handle.emit("network-log", &data) {
                                    eprintln!("Failed to emit network-log: {}", e);
                                }
                            }
                            ClientMessage::Console { data } => {
                                if let Err(e) = state.app_handle.emit("console-log", &data) {
                                    eprintln!("Failed to emit console-log: {}", e);
                                }
                            }
                            ClientMessage::WebSocketUpdate { ws_id, data } => {
                                #[derive(Serialize)]
                                struct WebSocketUpdateEvent {
                                    ws_id: String,
                                    update: WebSocketUpdate,
                                }
                                
                                let event = WebSocketUpdateEvent {
                                    ws_id,
                                    update: data,
                                };
                                
                                if let Err(e) = state.app_handle.emit("websocket-update", &event) {
                                    eprintln!("Failed to emit websocket-update: {}", e);
                                }
                            }
                        }
                        
                        // 发送确认消息
                        if let Err(e) = sender.send(Message::Text(r#"{"status":"ok"}"#.to_string())).await {
                            eprintln!("Failed to send ack: {}", e);
                            break;
                        }
                    }
                    Err(e) => {
                        eprintln!("Failed to parse message: {}", e);
                    }
                }
            }
            Ok(Message::Close(_)) => {
                println!("WebSocket client disconnected");
                break;
            }
            Err(e) => {
                eprintln!("WebSocket error: {}", e);
                break;
            }
            _ => {}
        }
    }
}

async fn start_websocket_server(app_handle: AppHandle) {
    let state = Arc::new(AppState { app_handle });

    let app = Router::new()
        .route("/ws", get(handle_websocket))
        .layer(CorsLayer::new().allow_origin(Any).allow_methods(Any).allow_headers(Any))
        .with_state(state);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3927")
        .await
        .expect("Failed to bind to port 3927");

    println!("Dev Lens WebSocket server listening on ws://0.0.0.0:3927/ws");
    println!("Local access: ws://127.0.0.1:3927/ws");
    
    // Try to get local IP address
    if let Ok(hostname) = hostname::get() {
        if let Some(hostname_str) = hostname.to_str() {
            println!("Network access: ws://{}:3927/ws (or use your IP address)", hostname_str);
        }
    }

    axum::serve(listener, app)
        .await
        .expect("Failed to start WebSocket server");
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn log_network(app: AppHandle, request: NetworkRequest) -> Result<(), String> {
    app.emit("network-log", &request).map_err(|e| e.to_string())
}

#[tauri::command]
fn log_console(app: AppHandle, log: ConsoleLog) -> Result<(), String> {
    app.emit("console-log", &log).map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, log_network, log_console])
        .setup(|app| {
            let app_handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                start_websocket_server(app_handle).await;
            });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
