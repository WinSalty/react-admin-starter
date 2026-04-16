import { useEffect, useMemo, useState } from 'react';
import type { CheckboxOptionType, TreeDataNode } from 'antd';
import { App, Button, Card, Checkbox, Descriptions, Form, Select, Space, Tag, Tree, Typography } from 'antd';
import { fetchPermissionAssignment, savePermissionAssignment } from '@/services/permission';
import { fetchSystemPage } from '@/services/system';
import { useAuthStore } from '@/stores/auth';
import type { PermissionMenu } from '@/types/permission';
import type { SystemRecord } from '@/types/system';

const { Paragraph } = Typography;

/**
 * 权限目录与角色权限分配页面。
 * 支持从 service/mock 链路读取角色、菜单树、路由权限和按钮权限。
 * author: sunshengxian
 * 创建日期：2026-04-16
 */
function PermissionPage() {
  const { message } = App.useApp();
  const [form] = Form.useForm<{ roleCode: string }>();
  const menus = useAuthStore((state) => state.menus);
  const routeCodes = useAuthStore((state) => state.routeCodes);
  const actions = useAuthStore((state) => state.actions);
  const role = useAuthStore((state) => state.role);
  const [roles, setRoles] = useState<SystemRecord[]>([]);
  const [selectedRole, setSelectedRole] = useState('super_admin');
  const [checkedMenuIds, setCheckedMenuIds] = useState<string[]>([]);
  const [checkedRouteCodes, setCheckedRouteCodes] = useState<string[]>([]);
  const [checkedActionCodes, setCheckedActionCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void loadRoles();
  }, []);

  useEffect(() => {
    form.setFieldsValue({ roleCode: selectedRole });
    void loadAssignment(selectedRole);
  }, [form, selectedRole]);

  const menuTree = useMemo(() => mapMenusToTreeData(menus), [menus]);
  const routeOptions = useMemo<CheckboxOptionType[]>(
    () => routeCodes.map((code) => ({ label: code, value: code })),
    [routeCodes],
  );
  const actionOptions = useMemo<CheckboxOptionType[]>(
    () => actions.map((action) => ({ label: `${action.name} (${action.code})`, value: action.code })),
    [actions],
  );

  /**
   * 加载角色选项。
   */
  async function loadRoles() {
    const response = await fetchSystemPage({
      moduleKey: 'roles',
      pageNo: 1,
      pageSize: 50,
    });
    if (response.code === 0) {
      setRoles(response.data.records);
    }
  }

  /**
   * 加载角色权限分配数据。
   */
  async function loadAssignment(roleCode: string) {
    setLoading(true);
    try {
      const response = await fetchPermissionAssignment(roleCode);
      if (response.code !== 0) {
        message.error(response.message || '权限分配数据获取失败');
        return;
      }
      setCheckedMenuIds(response.data.menuIds);
      setCheckedRouteCodes(response.data.routeCodes);
      setCheckedActionCodes(response.data.actionCodes);
    } catch {
      message.error('权限分配数据获取失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }

  /**
   * 保存角色权限分配。
   */
  async function handleSave() {
    setSaving(true);
    try {
      const response = await savePermissionAssignment({
        roleCode: selectedRole,
        menuIds: checkedMenuIds,
        routeCodes: checkedRouteCodes,
        actionCodes: checkedActionCodes,
      });
      if (response.code !== 0) {
        message.error(response.message || '权限分配保存失败');
        return;
      }
      message.success(response.message);
    } catch {
      message.error('权限分配保存失败，请稍后重试');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page-stack">
      <Card title="当前登录权限快照">
        <Descriptions bordered column={1} size="small">
          <Descriptions.Item label="当前角色">{role || '未登录'}</Descriptions.Item>
          <Descriptions.Item label="路由权限">
            {routeCodes.length === 0 ? (
              <Paragraph type="secondary">暂无路由权限或权限数据未加载。</Paragraph>
            ) : (
              <Space size={[8, 8]} wrap>
                {routeCodes.map((code) => (
                  <Tag key={code} color="blue">{code}</Tag>
                ))}
              </Space>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="按钮权限">
            {actions.length === 0 ? (
              <Paragraph type="secondary">暂无按钮权限。</Paragraph>
            ) : (
              <Space size={[8, 8]} wrap>
                {actions.map((action) => (
                  <Tag key={action.code} color="green">{action.name}（{action.code}）</Tag>
                ))}
              </Space>
            )}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card
        title="角色权限分配"
        extra={
          <Button type="primary" loading={saving} onClick={() => void handleSave()}>
            保存分配
          </Button>
        }
      >
        <Form form={form} layout="inline" className="query-form">
          <Form.Item label="角色" name="roleCode">
            <Select
              loading={loading}
              style={{ width: 220 }}
              options={roles.map((item) => ({ label: item.name, value: item.code }))}
              onChange={setSelectedRole}
            />
          </Form.Item>
        </Form>

        <div className="permission-assignment-grid">
          <Card size="small" title="菜单权限树">
            <Tree
              checkable
              blockNode
              checkedKeys={checkedMenuIds}
              treeData={menuTree}
              onCheck={(keys) => setCheckedMenuIds(Array.isArray(keys) ? keys.map(String) : keys.checked.map(String))}
            />
          </Card>
          <Card size="small" title="路由权限">
            <Checkbox.Group
              className="permission-checkbox-group"
              options={routeOptions}
              value={checkedRouteCodes}
              onChange={(values) => setCheckedRouteCodes(values.map(String))}
            />
          </Card>
          <Card size="small" title="按钮权限">
            <Checkbox.Group
              className="permission-checkbox-group"
              options={actionOptions}
              value={checkedActionCodes}
              onChange={(values) => setCheckedActionCodes(values.map(String))}
            />
          </Card>
        </div>
      </Card>

      <Card title="权限接入计划">
        <Descriptions bordered column={1}>
          <Descriptions.Item label="菜单权限">控制侧边栏目录显示，通过菜单树和 routeCodes 联合过滤。</Descriptions.Item>
          <Descriptions.Item label="路由权限">控制页面访问，无权限时跳转至 403。</Descriptions.Item>
          <Descriptions.Item label="按钮权限">控制页面按钮和表格操作列，使用 Access 组件。</Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
}

function mapMenusToTreeData(menus: PermissionMenu[]): TreeDataNode[] {
  return menus.map((menu) => ({
    title: menu.title,
    key: menu.id,
    children: menu.children ? mapMenusToTreeData(menu.children) : undefined,
  }));
}

export default PermissionPage;
