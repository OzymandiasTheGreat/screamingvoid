import { notification } from "@tauri-apps/api";

export async function notify(opts: {
	body: string;
	title: string;
	icon?: string;
}) {
	return notification.isPermissionGranted().then(async (granted) => {
		if (!granted) {
			granted = (await notification.requestPermission()) === "granted";
		}
		if (granted) {
			notification.sendNotification(opts);
		}
	});
}
