export class NotificationService {
  static async requestPermission() {
    if (!("Notification" in window)) {
      console.warn("This browser does not support desktop notification");
      return false;
    }

    if (Notification.permission === "granted") {
      return true;
    }

    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }

    return false;
  }

  static async showNotification(title: string, body: string) {
    if (Notification.permission === "granted") {
      new Notification(title, { body, icon: '/favicon.ico' });
    }
  }
}
