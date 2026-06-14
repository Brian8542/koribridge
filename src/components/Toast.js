import React from "react";

export const ToastContext = React.createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = React.useState([]);

  const showToast = (message, type = "info", duration = 3000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 space-y-3 z-50 pointer-events-none">
        {toasts.map((toast) => (
          <Toast key={toast.id} message={toast.message} type={toast.type} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const Toast = ({ message, type }) => {
  const bgColor = {
    success: "bg-green-600",
    error: "bg-red-600",
    info: "bg-blue-600",
  }[type] || "bg-blue-600";

  const icon = {
    success: "✓",
    error: "✕",
    info: "ℹ",
  }[type] || "ℹ";

  return (
    <div
      className={`${bgColor} text-white rounded-2xl px-4 py-3 flex items-center gap-2 shadow-lg animate-in fade-in slide-in-from-right-4 pointer-events-auto`}
    >
      <span className="font-bold text-lg">{icon}</span>
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
};

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
};
