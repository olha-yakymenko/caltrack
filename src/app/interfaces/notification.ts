import { NotificationType } from "../serivces/notification.service";

export interface Notification {
  readonly id: number;
  readonly type: NotificationType;
  readonly message: string;
  readonly duration?: number;
  readonly autoClose?: boolean;
}
