import { useState, useCallback } from "react";

export const useNotification = () => {
  const [notification, setNotification] = useState({
    visible: false,
    message: "",
    type: "success", // 'success' | 'info' | 'error'
  });

  const showNotification = useCallback((message, type = "success") => {
    setNotification({ visible: true, message, type });

    // Automatically dismiss after 3 seconds
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, visible: false }));
    }, 3000);
  }, []);

  const hideNotification = useCallback(() => {
    setNotification((prev) => ({ ...prev, visible: false }));
  }, []);

  return { notification, showNotification, hideNotification };
};
