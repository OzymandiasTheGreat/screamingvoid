#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use std::sync::{Arc, Mutex};
use tauri::{
	api::process::{Command, CommandEvent},
	Manager,
};

fn main() {
  tauri::Builder::default()
    .setup(|app| {
		let window = app.get_window("main").unwrap();
		tauri::async_runtime::spawn(async move {
			let (mut rx, mut child) = Command::new_sidecar("backend")
				.expect("Failed to setup `backend` sidecar")
				.spawn()
				.expect("Failed to spawn packaged node");
			let child = Arc::new(Mutex::new(child));

			window.listen_global("backend-in", move |event| {
				child.lock().unwrap().write(format!("{}\n", event.payload().unwrap()).as_bytes()).unwrap();
			});

			while let Some(event) = rx.recv().await {
				if let CommandEvent::Stdout(line) = event {
					window
						.emit("backend-out", Some(format!("{}\n", line)))
						.expect("Failed to emit event");
				}
			}
		});

		Ok(())
	})
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
