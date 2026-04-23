export interface AccountProfile {
  userId: number;
  username: string;
  email: string;
  nickname: string;
  description?: string;
  avatarUrl?: string;
  country?: string;
  province?: string;
  city?: string;
  streetAddress?: string;
  phonePrefix?: string;
  phoneNumber?: string;
  notifyAccount: boolean;
  notifySystem: boolean;
  notifyTodo: boolean;
  roleCode?: string;
  roleName?: string;
}

export interface AccountProfileUpdateParams {
  email: string;
  nickname: string;
  description?: string;
  avatarUrl?: string;
  country?: string;
  province?: string;
  city?: string;
  streetAddress?: string;
  phonePrefix?: string;
  phoneNumber?: string;
}

export interface AccountPasswordUpdateParams {
  currentPassword: string;
  newPassword: string;
}

export interface AccountNotificationSettings {
  notifyAccount: boolean;
  notifySystem: boolean;
  notifyTodo: boolean;
}

export interface AccountAvatarUploadResult {
  id: string;
  originalName: string;
  storedName: string;
  storageType: 'local' | 'aliyun-oss';
  objectKey?: string;
  fileUrl?: string;
  contentType?: string;
  extension: string;
  sizeBytes: number;
  status: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ObjectStorageStatus {
  enabled: boolean;
  provider: 'aliyun-oss';
}
