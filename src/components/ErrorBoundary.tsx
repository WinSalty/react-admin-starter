import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button, Result } from 'antd';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

/**
 * 页面级错误边界。
 * 捕获渲染期异常，避免单页异常导致整个后台白屏。
 * author: sunshengxian
 * 创建日期：2026-04-17
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    errorMessage: '',
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Page render error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Result
          status="500"
          title="页面加载失败"
          subTitle={this.state.errorMessage || '页面渲染异常，请刷新或返回工作台。'}
          extra={
            <Button type="primary" onClick={() => this.setState({ hasError: false, errorMessage: '' })}>
              重试
            </Button>
          }
        />
      );
    }
    return this.props.children;
  }
}
