#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use std::sync::{Arc, Mutex};
use tauri::{api::process::{Command, CommandEvent}, Manager};
use tauri_plugin_store::PluginBuilder;
use keyring::Entry;

const SERVICE: &str = "me.screamingvoid.app";

#[tauri::command]
fn get_identity(public_key: String) -> Result<String, String> {
	let entry = Entry::new(SERVICE, &*public_key);
	let id = entry.get_password();
	match id {
		Ok(json) => Ok(json),
		Err(err) => Err(err.to_string()),
	}
}

#[tauri::command]
async fn set_identity(public_key: String, identity: String) -> Result<(), String> {
	let entry = Entry::new(SERVICE, &*public_key);
	let result = entry.set_password(&*identity);
	match result {
		Ok(_) => Ok(()),
		Err(err) => Err(err.to_string()),
	}
}

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
		.plugin(PluginBuilder::default().build())
		.invoke_handler(tauri::generate_handler![get_identity, set_identity])
		.run(tauri::generate_context!())
		.expect("error while running tauri application");
}
