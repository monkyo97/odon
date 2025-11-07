import { toast, Slide, ToastOptions } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '@styles/notifications.css'; // 👈 nuestro estilo personalizado

export class Notifications {
  private static baseConfig: ToastOptions = {
    position: 'top-right',
    autoClose: 4000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    transition: Slide,
    className: 'custom-notification', // 🔹 clase base única
  };

  static info(message: string): void {
    toast.info(message, {
      ...this.baseConfig,
      className: 'custom-notification info',
    });
  }

  static success(message: string): void {
    toast.success(message, {
      ...this.baseConfig,
      className: 'custom-notification success',
    });
  }

  static warning(message: string): void {
    toast.warning(message, {
      ...this.baseConfig,
      className: 'custom-notification warning',
    });
  }

  static error(message: string): void {
    toast.error(message, {
      ...this.baseConfig,
      className: 'custom-notification error',
    });
  }
}
