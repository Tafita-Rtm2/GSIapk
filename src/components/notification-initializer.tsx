"use client";

import { useEffect } from "react";
import { LocalNotifications } from "@capacitor/local-notifications";
import { Capacitor } from "@capacitor/core";

export function NotificationInitializer() {
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      const requestPermissions = async () => {
        const status = await LocalNotifications.checkPermissions();
        if (status.display !== "granted") {
          await LocalNotifications.requestPermissions();
        }
      };
      requestPermissions();
    }
  }, []);

  return null;
}
