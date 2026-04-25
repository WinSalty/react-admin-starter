import type { ReactNode } from 'react';
import type { FormInstance } from 'antd';
import { Form, Modal } from 'antd';

interface SubmitModalFormProps<FormValues extends object> {
  title: ReactNode;
  open: boolean;
  form: FormInstance<FormValues>;
  loading?: boolean;
  width?: number;
  className?: string;
  children: ReactNode;
  onCancel: () => void;
  onFinish: (values: FormValues) => void | Promise<void>;
}

/**
 * 提交型弹窗表单。
 * 统一承载新增、编辑、导出等需要校验后提交的 Modal 表单流程。
 * author: sunshengxian
 * 创建日期：2026-04-25
 */
function SubmitModalForm<FormValues extends object>({
  title,
  open,
  form,
  loading = false,
  width,
  className,
  children,
  onCancel,
  onFinish,
}: SubmitModalFormProps<FormValues>) {
  return (
    <Modal
      title={title}
      open={open}
      width={width}
      confirmLoading={loading}
      destroyOnHidden
      forceRender
      onCancel={onCancel}
      onOk={() => form.submit()}
    >
      <Form form={form} layout="vertical" className={className} onFinish={(values) => void onFinish(values)}>
        {children}
      </Form>
    </Modal>
  );
}

export default SubmitModalForm;
