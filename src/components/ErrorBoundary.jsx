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
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF7F2] px-6">
          <div className="bg-white rounded-apple-lg shadow-card border border-[#E5DED2]/40 p-8 max-w-sm w-full text-center">
            <div className="w-14 h-14 rounded-apple bg-[#FBEAE6] border border-[#C4402E]/20 flex items-center justify-center mx-auto mb-5">
              <svg className="w-7 h-7 text-[#C4402E]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <h2 className="font-display text-[20px] text-[#1E1B18]">잠시 문제가 생겼어요</h2>
            <p className="mt-2 text-[14px] text-[#8A837B] leading-relaxed">
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
              className="mt-3 text-[13px] text-[#8A837B] hover:text-[#1E1B18] underline transition-colors"
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
