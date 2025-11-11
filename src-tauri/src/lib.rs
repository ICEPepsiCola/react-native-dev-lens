use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter};
use std::collections::HashMap;
use axum::{
    extract::{State, Path},
    http::StatusCode,
    routing::post,
    Json, Router,
};
use tower_http::cors::{CorsLayer, Any};
use std::sync::Arc;

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
    response: String,
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

async fn handle_network_log(
    State(state): State<Arc<AppState>>,
    Json(request): Json<NetworkRequest>,
) -> StatusCode {
    match state.app_handle.emit("network-log", &request) {
        Ok(_) => StatusCode::OK,
        Err(e) => {
            eprintln!("Failed to emit network-log: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        }
    }
}

async fn handle_console_log(
    State(state): State<Arc<AppState>>,
    Json(log): Json<ConsoleLog>,
) -> StatusCode {
    match state.app_handle.emit("console-log", &log) {
        Ok(_) => StatusCode::OK,
        Err(e) => {
            eprintln!("Failed to emit console-log: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        }
    }
}

async fn handle_websocket_update(
    State(state): State<Arc<AppState>>,
    Path(ws_id): Path<String>,
    Json(update): Json<WebSocketUpdate>,
) -> StatusCode {
    println!("Received WebSocket update for {}: {:?}", ws_id, update);
    
    #[derive(Serialize)]
    struct WebSocketUpdateEvent {
        ws_id: String,
        update: WebSocketUpdate,
    }
    
    let event = WebSocketUpdateEvent {
        ws_id,
        update,
    };
    
    match state.app_handle.emit("websocket-update", &event) {
        Ok(_) => StatusCode::OK,
        Err(e) => {
            eprintln!("Failed to emit websocket-update: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        }
    }
}

async fn start_http_server(app_handle: AppHandle) {
    let state = Arc::new(AppState { app_handle });

    let app = Router::new()
        .route("/api/network", post(handle_network_log))
        .route("/api/console", post(handle_console_log))
        .route("/api/websocket/:ws_id", post(handle_websocket_update))
        .layer(CorsLayer::new().allow_origin(Any).allow_methods(Any).allow_headers(Any))
        .with_state(state);

    let listener = tokio::net::TcpListener::bind("127.0.0.1:9527")
        .await
        .expect("Failed to bind to port 9527");

    println!("Dev Lens HTTP server listening on http://127.0.0.1:9527");

    axum::serve(listener, app)
        .await
        .expect("Failed to start HTTP server");
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
                start_http_server(app_handle).await;
            });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
