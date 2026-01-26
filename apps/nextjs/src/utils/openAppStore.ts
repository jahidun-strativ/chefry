import { isAndroid, isIOS } from "react-device-detect";

const appStoreLink = "https://apps.apple.com/se/app/startracker-access-all-areas/id6466398416";
const playStoreLink = "https://play.google.com/store/apps/details?id=app.startracker.one";

export function openAppStore() {
  if (isIOS) {
    window.location.href = appStoreLink;
  } else if (isAndroid) {
    window.location.href = playStoreLink;
  } else {
    window.location.href = appStoreLink; // fallback for other devices
  }
}
