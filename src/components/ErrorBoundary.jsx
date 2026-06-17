import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 max-w-sm w-full text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4 text-2xl">
              ⚠️
            </div>
            <h2 className="text-lg font-bold text-gray-900">문제가 발생했습니다</h2>
            <p className="mt-2 text-sm text-gray-500">
              일시적인 오류가 발생했습니다. 페이지를 새로고침해 주세요.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 btn-primary w-full py-3"
            >
              새로고침
            </button>
            <button
              onClick={() => { this.setState({ hasError: false }); window.location.href = "/home"; }}
              className="mt-3 text-sm text-gray-400 hover:text-gray-600 underline"
            >
              홈으로 이동
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
