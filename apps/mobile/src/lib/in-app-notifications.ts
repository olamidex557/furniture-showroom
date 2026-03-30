type Listener = (message: NotificationMessage) => void;

export type NotificationMessage = {
  title: string;
  body: string;
};

let listeners: Listener[] = [];

export function subscribeToNotifications(listener: Listener) {
  listeners.push(listener);

  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

export function sendInAppNotification(message: NotificationMessage) {
  listeners.forEach((listener) => listener(message));
}