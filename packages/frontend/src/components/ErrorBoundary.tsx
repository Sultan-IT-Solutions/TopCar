// src/components/ErrorBoundary.tsx
'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { securityLogger, SecurityEventType, SecurityEventSeverity } from '@/lib/security-logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary компонент для отлова runtime ошибок в React
 * Предотвращает падение всего приложения при ошибке в дочернем компоненте
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Обновляем state чтобы показать fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Логируем ошибку
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Сохраняем информацию об ошибке
    this.setState({
      error,
      errorInfo,
    });

    // Логируем в security logger
    securityLogger.log(
      SecurityEventType.API_ERROR,
      SecurityEventSeverity.ERROR,
      `React Error: ${error.message}`,
      {
        error: error.toString(),
        stack: error.stack,
        componentStack: errorInfo.componentStack,
      }
    );

    // Вызываем пользовательский обработчик если есть
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // В production отправляем в внешний сервис мониторинга
    if (process.env.NODE_ENV === 'production') {
      this.reportErrorToService(error, errorInfo);
    }
  }

  private reportErrorToService(error: Error, errorInfo: ErrorInfo): void {
    // TODO: Интеграция с Sentry или другим сервисом мониторинга
    // Пример:
    // Sentry.captureException(error, {
    //   contexts: {
    //     react: {
    //       componentStack: errorInfo.componentStack,
    //     },
    //   },
    // });
  }

  private handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Если передан custom fallback, используем его
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Дефолтный fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <svg
                className="w-12 h-12 text-red-500 mr-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Что-то пошло не так
                </h1>
                <p className="text-gray-600 mt-1">
                  Произошла непредвиденная ошибка
                </p>
              </div>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 mb-4">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
                  Детали ошибки (только в dev режиме)
                </summary>
                <div className="bg-gray-100 rounded p-3 text-xs overflow-auto max-h-60">
                  <p className="font-semibold text-red-600 mb-2">
                    {this.state.error.toString()}
                  </p>
                  <pre className="whitespace-pre-wrap text-gray-700">
                    {this.state.error.stack}
                  </pre>
                  {this.state.errorInfo && (
                    <pre className="mt-2 whitespace-pre-wrap text-gray-600">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              </details>
            )}

            <div className="flex gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
              >
                Попробовать снова
              </button>
              <button
                onClick={() => (window.location.href = '/')}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded transition-colors"
              >
                На главную
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-4 text-center">
              Если проблема повторяется, свяжитесь с поддержкой
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * HOC для оборачивания компонента в ErrorBoundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
): React.FC<P> {
  return (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );
}
