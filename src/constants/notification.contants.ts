import { Types } from 'mongoose';
import { INotification } from 'src/api/v1/notifications/interface/notifications.interface';

// User Notifications
export const adminReviewingOrder = ({
  orderId,
  userId,
}: {
  orderId: string;
  userId: string;
}): INotification => ({
  message: 'Your test is under review',
  description: `Test #${orderId} is now being processed`,
  read: false,
  user: new Types.ObjectId(userId),
  order: new Types.ObjectId(orderId),
});

export const orderRejected = ({
  orderId,
  userId,
}: {
  orderId: string;
  userId: string;
}): INotification => ({
  message: 'Test Update: Rejected',
  description: `Test #${orderId} needs modifications`,
  read: false,
  user: new Types.ObjectId(userId),
  order: new Types.ObjectId(orderId),
});

export const orderCompleted = ({
  orderId,
  userId,
}: {
  orderId: string;
  userId: string;
}): INotification => ({
  message: 'Test Completed!',
  description: `Your report for test #${orderId} is ready`,
  read: false,
  user: new Types.ObjectId(userId),
  order: new Types.ObjectId(orderId),
});

export const refundAccepted = ({
  orderId,
  userId,
}: {
  orderId: string;
  userId: string;
}): INotification => ({
  message: 'Refund Approved',
  description: `Refund processed for test #${orderId}`,
  read: false,
  user: new Types.ObjectId(userId),
  order: new Types.ObjectId(orderId),
});

// Admin Notifications
export const newOrderAlert = ({
  orderId,
  userId,
  userName,
}: {
  orderId: string;
  userId: string;
  userName: string;
}): INotification => ({
  message: 'New Test Submission',
  description: `${userName} submitted test #${orderId}`,
  read: false,
  user: new Types.ObjectId(userId),
  order: new Types.ObjectId(orderId),
});

export const paymentFailed = ({
  orderId,
  userId,
  userName,
}: {
  orderId: string;
  userId: string;
  userName?: string;
}): INotification => ({
  message: 'Payment Issue Detected',
  description: `Test #${orderId} payment failed by ${userName ?? 'Unknown User'}`,
  read: false,
  user: new Types.ObjectId(userId),
  order: new Types.ObjectId(orderId),
});

export const orderResubmitted = ({
  orderId,
  userId,
  userName,
}: {
  orderId: string;
  userId: string;
  userName?: string;
}): INotification => ({
  message: 'Test Resubmitted',
  description: `${userName ?? 'A user'} resubmitted test #${orderId} which needs review`,
  read: false,
  user: new Types.ObjectId(userId),
  order: new Types.ObjectId(orderId),
});

export const refundRequested = ({
  orderId,
  userId,
  userName,
}: {
  orderId: string;
  userId: string;
  userName?: string;
}): INotification => ({
  message: 'Refund Request Received',
  description: `Refund requested for test #${orderId} by ${userName ?? 'a user'}`,
  read: false,
  user: new Types.ObjectId(userId),
  order: new Types.ObjectId(orderId),
});
