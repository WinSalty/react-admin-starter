import {
  BellOutlined,
  LockOutlined,
  LinkOutlined,
  MailOutlined,
  MobileOutlined,
  SafetyCertificateOutlined,
  UploadOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  App,
  Avatar,
  Button,
  Card,
  Cascader,
  Col,
  Form,
  Input,
  Menu,
  Row,
  Select,
  Space,
  Switch,
  Typography,
  Upload,
} from 'antd';
import type { MenuProps, UploadProps } from 'antd';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  fetchAccountProfile,
  fetchObjectStorageStatus,
  uploadAccountAvatar,
  updateAccountNotifications,
  updateAccountPassword,
  updateAccountProfile,
} from '@/services/account';
import { useAuthStore } from '@/stores/auth';
import type {
  AccountNotificationSettings,
  AccountPasswordUpdateParams,
  AccountProfile,
  AccountProfileUpdateParams,
} from '@/types/account';

const { Text, Title } = Typography;

type SettingsSection = 'basic' | 'security' | 'binding' | 'notification';

const sectionItems: MenuProps['items'] = [
  { key: 'basic', label: '基本设置', icon: <UserOutlined /> },
  { key: 'security', label: '安全设置', icon: <SafetyCertificateOutlined /> },
  { key: 'binding', label: '账号绑定', icon: <LinkOutlined /> },
  { key: 'notification', label: '新消息通知', icon: <BellOutlined /> },
];

const regionOptions = [
  {
    label: '浙江省',
    value: '浙江省',
    children: [
      { label: '杭州市', value: '杭州市' },
      { label: '宁波市', value: '宁波市' },
      { label: '温州市', value: '温州市' },
    ],
  },
  {
    label: '上海市',
    value: '上海市',
    children: [
      { label: '上海市', value: '上海市' },
    ],
  },
  {
    label: '北京市',
    value: '北京市',
    children: [
      { label: '北京市', value: '北京市' },
    ],
  },
];

/**
 * 个人设置页面。
 * 参考 Ant Design Pro 账号设置的信息架构，使用真实 profile 接口保存当前用户资料。
 * author: sunshengxian
 * 创建日期：2026-04-19
 */
function AccountSettings() {
  const { message } = App.useApp();
  const [activeSection, setActiveSection] = useState<SettingsSection>('basic');
  const [profile, setProfile] = useState<AccountProfile>();
  const [loading, setLoading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingNotifications, setSavingNotifications] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [fileUploadEnabled, setFileUploadEnabled] = useState(true);
  const [activeStorageType, setActiveStorageType] = useState<'local' | 'aliyun-oss'>('local');
  const setAccountProfile = useAuthStore((state) => state.setProfile);
  const [profileForm] = Form.useForm<AccountProfileUpdateParams & { region?: string[] }>();
  const [passwordForm] = Form.useForm<AccountPasswordUpdateParams & { confirmPassword: string }>();
  const [notificationForm] = Form.useForm<AccountNotificationSettings>();

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchAccountProfile();
      if (response.code !== 0 || !response.data) {
        message.error(response.message || '个人设置获取失败');
        return;
      }
      setProfile(response.data);
      setAccountProfile(response.data);
      syncForms(response.data);
    } catch {
      message.error('个人设置获取失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [message, notificationForm, profileForm, setAccountProfile]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    void fetchObjectStorageStatus()
      .then((response) => {
        setFileUploadEnabled(response.code === 0 ? response.data?.fileUploadEnabled !== false : true);
        setActiveStorageType(response.data?.activeStorageType || (response.data?.enabled ? 'aliyun-oss' : 'local'));
      })
      .catch(() => {
        setFileUploadEnabled(true);
        setActiveStorageType('local');
      });
  }, []);

  const uploadProps = useMemo<UploadProps>(
    () => ({
      accept: 'image/*',
      maxCount: 1,
      showUploadList: false,
      beforeUpload: (file) => {
        if (!fileUploadEnabled) {
          message.info('文件上传服务暂不可用');
          return Upload.LIST_IGNORE;
        }
        const isImage = file.type.startsWith('image/');
        if (!isImage) {
          message.error('仅支持上传图片作为头像');
          return Upload.LIST_IGNORE;
        }
        const isAllowedSize = file.size <= 10 * 1024 * 1024;
        if (!isAllowedSize) {
          message.error('头像大小不能超过 10MB');
          return Upload.LIST_IGNORE;
        }
        return true;
      },
      customRequest: async ({ file, onError, onSuccess }) => {
        setUploadingAvatar(true);
        try {
          const response = await uploadAccountAvatar(file as File);
          if (response.code !== 0 || !response.data) {
            message.error(response.message || '头像上传失败');
            onError?.(new Error(response.message || '头像上传失败'));
            return;
          }
          const avatarUrl = normalizePersistentAvatarUrl(response.data.fileUrl || `/api/file/avatar/${response.data.id}`);
          if (!avatarUrl) {
            message.error('头像地址返回异常');
            onError?.(new Error('头像地址返回异常'));
            return;
          }
          profileForm.setFieldValue('avatarUrl', avatarUrl);
          const savedProfile = await saveProfileWithAvatar(avatarUrl);
          if (savedProfile) {
            setProfile(savedProfile);
            setAccountProfile(savedProfile);
            syncForms(savedProfile);
            message.success('头像已上传并保存');
          } else {
            setProfile((prev) => (prev ? { ...prev, avatarUrl } : prev));
            setAccountProfile(profile ? { ...profile, avatarUrl } : undefined);
            message.warning('头像已上传，请保存基本信息后生效');
          }
          onSuccess?.(response.data);
        } catch (error) {
          message.error('头像上传失败，请稍后重试');
          onError?.(error as Error);
        } finally {
          setUploadingAvatar(false);
        }
      },
    }),
    [message, fileUploadEnabled, profile, profileForm, setAccountProfile],
  );

  function syncForms(nextProfile: AccountProfile) {
    const avatarUrl = normalizePersistentAvatarUrl(nextProfile.avatarUrl);
    profileForm.setFieldsValue({
      email: nextProfile.email,
      nickname: nextProfile.nickname,
      description: nextProfile.description,
      avatarUrl,
      country: nextProfile.country || '中国',
      region: [nextProfile.province, nextProfile.city].filter(Boolean) as string[],
      streetAddress: nextProfile.streetAddress,
      phonePrefix: nextProfile.phonePrefix || '86',
      phoneNumber: nextProfile.phoneNumber,
    });
    notificationForm.setFieldsValue({
      notifyAccount: nextProfile.notifyAccount,
      notifySystem: nextProfile.notifySystem,
      notifyTodo: nextProfile.notifyTodo,
    });
  }

  async function handleProfileSubmit(values: AccountProfileUpdateParams & { region?: string[] }) {
    setSavingProfile(true);
    try {
      const [province, city] = values.region || [];
      const response = await updateAccountProfile({
        email: values.email,
        nickname: values.nickname,
        description: values.description,
        avatarUrl: normalizePersistentAvatarUrl(values.avatarUrl),
        country: values.country,
        province,
        city,
        streetAddress: values.streetAddress,
        phonePrefix: values.phonePrefix,
        phoneNumber: values.phoneNumber,
      });
      if (response.code !== 0 || !response.data) {
        message.error(response.message || '基本信息保存失败');
        return;
      }
      setProfile(response.data);
      setAccountProfile(response.data);
      syncForms(response.data);
      message.success(response.message || '保存成功');
    } catch {
      message.error('基本信息保存失败，请稍后重试');
    } finally {
      setSavingProfile(false);
    }
  }

  async function saveProfileWithAvatar(avatarUrl: string) {
    const values = profileForm.getFieldsValue();
    if (!values.email || !values.nickname) {
      return undefined;
    }
    const [province, city] = values.region || [];
    const response = await updateAccountProfile({
      email: values.email,
      nickname: values.nickname,
      description: values.description,
      avatarUrl,
      country: values.country,
      province,
      city,
      streetAddress: values.streetAddress,
      phonePrefix: values.phonePrefix,
      phoneNumber: values.phoneNumber,
    });
    if (response.code !== 0 || !response.data) {
      return undefined;
    }
    return response.data;
  }

  async function handlePasswordSubmit(values: AccountPasswordUpdateParams) {
    setSavingPassword(true);
    try {
      const response = await updateAccountPassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      if (response.code !== 0) {
        message.error(response.message || '密码修改失败');
        return;
      }
      passwordForm.resetFields();
      message.success(response.message || '密码已更新');
    } catch {
      message.error('密码修改失败，请稍后重试');
    } finally {
      setSavingPassword(false);
    }
  }

  async function handleNotificationSubmit(values: AccountNotificationSettings) {
    setSavingNotifications(true);
    try {
      const response = await updateAccountNotifications(values);
      if (response.code !== 0 || !response.data) {
        message.error(response.message || '通知设置保存失败');
        return;
      }
      setProfile(response.data);
      setAccountProfile(response.data);
      syncForms(response.data);
      message.success(response.message || '通知设置已保存');
    } catch {
      message.error('通知设置保存失败，请稍后重试');
    } finally {
      setSavingNotifications(false);
    }
  }

  function renderContent() {
    if (activeSection === 'security') {
      return (
        <div className="account-settings-panel">
          <Title level={4}>安全设置</Title>
          <div className="account-security-summary">
            <Space size={12}>
              <LockOutlined />
              <div>
                <Text strong>账户密码</Text>
                <span>建议定期更新密码，避免多个系统复用同一密码。</span>
              </div>
            </Space>
          </div>
          <Form
            form={passwordForm}
            layout="vertical"
            requiredMark={false}
            onFinish={handlePasswordSubmit}
            className="account-settings-form"
          >
            <Form.Item
              label="当前密码"
              name="currentPassword"
              rules={[{ required: true, message: '请输入当前密码' }]}
            >
              <Input.Password autoComplete="current-password" placeholder="请输入当前密码" />
            </Form.Item>
            <Form.Item
              label="新密码"
              name="newPassword"
              rules={[{ required: true, min: 6, max: 32, message: '请输入 6-32 位新密码' }]}
            >
              <Input.Password autoComplete="new-password" placeholder="请输入新密码" />
            </Form.Item>
            <Form.Item
              label="确认新密码"
              name="confirmPassword"
              dependencies={['newPassword']}
              rules={[
                { required: true, message: '请再次输入新密码' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('两次输入的新密码不一致'));
                  },
                }),
              ]}
            >
              <Input.Password autoComplete="new-password" placeholder="请再次输入新密码" />
            </Form.Item>
            <Button type="primary" htmlType="submit" loading={savingPassword}>
              更新密码
            </Button>
          </Form>
        </div>
      );
    }

    if (activeSection === 'binding') {
      return (
        <div className="account-settings-panel">
          <Title level={4}>账号绑定</Title>
          <div className="account-binding-list">
            <BindingItem
              icon={<MailOutlined />}
              title="邮箱"
              description={profile?.email || '未设置邮箱'}
              actionText="已绑定"
            />
            <BindingItem
              icon={<MobileOutlined />}
              title="手机"
              description={
                profile?.phoneNumber
                  ? `+${profile.phonePrefix || '86'} ${profile.phoneNumber}`
                  : '未设置联系电话'
              }
              actionText={profile?.phoneNumber ? '已绑定' : '去完善'}
              onClick={() => setActiveSection('basic')}
            />
          </div>
        </div>
      );
    }

    if (activeSection === 'notification') {
      return (
        <div className="account-settings-panel">
          <Title level={4}>新消息通知</Title>
          <Form
            form={notificationForm}
            layout="vertical"
            requiredMark={false}
            onFinish={handleNotificationSubmit}
          >
            <NotificationItem
              title="账号安全"
              description="登录、密码变更、敏感操作等安全提醒"
              name="notifyAccount"
            />
            <NotificationItem
              title="系统消息"
              description="公告、配置变更和权限调整通知"
              name="notifySystem"
            />
            <NotificationItem
              title="待办任务"
              description="流程审批、任务分派和处理超时提醒"
              name="notifyTodo"
            />
            <Button type="primary" htmlType="submit" loading={savingNotifications}>
              保存通知设置
            </Button>
          </Form>
        </div>
      );
    }

    return (
      <div className="account-settings-panel">
        <Title level={4}>基本设置</Title>
        <Row gutter={[32, 24]}>
          <Col xs={24} lg={15} xl={14}>
            <Form
              form={profileForm}
              layout="vertical"
              requiredMark={false}
              onFinish={handleProfileSubmit}
              className="account-settings-form"
            >
              <Form.Item
                label="邮箱"
                name="email"
                rules={[
                  { required: true, message: '请输入邮箱' },
                  { type: 'email', message: '邮箱格式不正确' },
                ]}
              >
                <Input placeholder="请输入邮箱" />
              </Form.Item>
              <Form.Item
                label="昵称"
                name="nickname"
                rules={[{ required: true, message: '请输入昵称' }]}
              >
                <Input placeholder="请输入昵称" />
              </Form.Item>
              <Form.Item label="个人简介" name="description">
                <Input.TextArea rows={4} maxLength={255} showCount placeholder="请输入个人简介" />
              </Form.Item>
              <Form.Item label="国家/地区" name="country">
                <Select
                  options={[
                    { label: '中国', value: '中国' },
                    { label: '新加坡', value: '新加坡' },
                    { label: '日本', value: '日本' },
                  ]}
                />
              </Form.Item>
              <Form.Item label="所在省市" name="region">
                <Cascader placeholder="请选择省市" options={regionOptions} />
              </Form.Item>
              <Form.Item label="街道地址" name="streetAddress">
                <Input placeholder="请输入街道地址" />
              </Form.Item>
              <Form.Item label="联系电话">
                <Space.Compact block>
                  <Form.Item name="phonePrefix" noStyle>
                    <Input className="account-phone-prefix" placeholder="区号" />
                  </Form.Item>
                  <Form.Item name="phoneNumber" noStyle>
                    <Input placeholder="请输入联系电话" />
                  </Form.Item>
                </Space.Compact>
              </Form.Item>
              <Form.Item name="avatarUrl" hidden>
                <Input />
              </Form.Item>
              <Button type="primary" htmlType="submit" loading={savingProfile}>
                更新基本信息
              </Button>
            </Form>
          </Col>
          <Col xs={24} lg={9} xl={8}>
            <div className="account-avatar-panel">
              <Text strong>头像</Text>
              <Avatar
                size={120}
                src={
                  normalizePersistentAvatarUrl(profileForm.getFieldValue('avatarUrl') || profile?.avatarUrl)
                }
                icon={<UserOutlined />}
              >
                {(profile?.nickname || profile?.username || 'U').slice(0, 1).toUpperCase()}
              </Avatar>
              {fileUploadEnabled ? (
                <Upload {...uploadProps}>
                  <Button icon={<UploadOutlined />} loading={uploadingAvatar}>
                    更换头像
                  </Button>
                </Upload>
              ) : (
                <Button icon={<UploadOutlined />} disabled>
                  更换头像
                </Button>
              )}
            </div>
          </Col>
        </Row>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <Card className="account-settings-card" loading={loading}>
        <div className="account-settings-layout">
          <aside className="account-settings-menu">
            <Menu
              mode="inline"
              selectedKeys={[activeSection]}
              items={sectionItems}
              onClick={({ key }) => setActiveSection(key as SettingsSection)}
            />
          </aside>
          <main className="account-settings-content">{renderContent()}</main>
        </div>
      </Card>
    </div>
  );
}

function BindingItem({
  icon,
  title,
  description,
  actionText,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  actionText: string;
  onClick?: () => void;
}) {
  return (
    <div className="account-binding-item">
      <Space size={12}>
        <span className="account-binding-icon">{icon}</span>
        <div>
          <Text strong>{title}</Text>
          <span>{description}</span>
        </div>
      </Space>
      <Button type="link" onClick={onClick}>
        {actionText}
      </Button>
    </div>
  );
}

function NotificationItem({
  title,
  description,
  name,
}: {
  title: string;
  description: string;
  name: keyof AccountNotificationSettings;
}) {
  return (
    <div className="account-notification-item">
      <div>
        <Text strong>{title}</Text>
        <span>{description}</span>
      </div>
      <Form.Item name={name} valuePropName="checked" noStyle>
        <Switch checkedChildren="开" unCheckedChildren="关" />
      </Form.Item>
    </div>
  );
}

function normalizePersistentAvatarUrl(value?: string) {
  if (!value) {
    return undefined;
  }
  if (value.startsWith('/api/file/avatar/')) {
    return value;
  }
  return undefined;
}

export default AccountSettings;
