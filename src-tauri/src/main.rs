#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};
use std::time::SystemTime;
use tauri::{async_runtime::spawn, Manager, Runtime};
use tokio::io::AsyncReadExt;
use tokio_serial::SerialPortBuilderExt;

#[derive(Serialize, Deserialize, Debug, Clone)]
struct LocalState {
    lap: i32,
    lap_start: i64,
    best_lap: i32,

    ar_teo_status: DeviceStatus,
    ar_teo: ArTeo,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
enum DeviceStatus {
    Error,
    Connected,
    Disconnected,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct ArTeo {
    rpm: i32,
    speed: i32,
    bat1: f32,
    bat2: f32,
    lap_trigger: i8,
}

//? This function reads from the serial port and emits the data to the frontend
// TODO: Instead of emitting, save the data to state for the state emitter
async fn teo_parser<R: Runtime>(
    app: &tauri::AppHandle<R>,
    port_name: String,
    event_name: String,
    state: Arc<Mutex<LocalState>>,
) -> Result<(), Box<dyn std::error::Error>> {
    let mut port = tokio_serial::new(port_name, 9600).open_native_async()?;
    let mut read_buffer = vec![0; 2048];

    loop {
        let n = port.read(&mut read_buffer).await?;

        let msg = String::from_utf8_lossy(&read_buffer[..n]).to_string();
        let msg_split: Vec<&str> = msg.trim().split("%").collect();

        if msg_split.len() != 5 {
            state.lock().unwrap().ar_teo_status = DeviceStatus::Error;
            continue;
        }

        state.lock().unwrap().ar_teo_status = DeviceStatus::Connected;
        state.lock().unwrap().ar_teo = ArTeo {
            lap_trigger: msg_split[0].parse().unwrap(),
            rpm: msg_split[1].parse().unwrap(),
            speed: msg_split[2].parse().unwrap(),
            bat1: msg_split[3].parse().unwrap(),
            bat2: msg_split[4].parse().unwrap(),
        };

        if msg_split[0] == "1" {
            state.lock().unwrap().lap += 1;
            state.lock().unwrap().lap_start = SystemTime::now()
                .duration_since(SystemTime::UNIX_EPOCH)
                .unwrap()
                .as_secs() as i64;
        }

        println!("State: {:?}", state.lock().unwrap());

        app.emit_all(&event_name, state.lock().unwrap().clone())
            .expect("TODO: panic message");
    }
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let app_handle = app.handle();

            // Initial state
            let state = Arc::new(Mutex::new(LocalState {
                lap: 0,
                lap_start: 0,
                best_lap: 0,

                ar_teo_status: DeviceStatus::Disconnected,
                ar_teo: ArTeo {
                    rpm: 0,
                    speed: 0,
                    bat1: 0.0,
                    bat2: 0.0,
                    lap_trigger: 0,
                },
            }));

            // Serial reading logic from arduino 1
            spawn(async move {
                if let Err(e) = teo_parser(&app_handle, "/dev/cu.usbmodem1101".into(), "ar_teo".into(), state.clone()).await {
                    eprintln!("Failed to read serial port: {}", e);
                }
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
