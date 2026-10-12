import * as React from "react";

const VARIANTS = {
  success: {
    badge: "bg-status-success-bg text-status-success border-status-success/30",
    dot: "bg-status-success",
  },
  warning: {
    badge: "bg-status-warning-bg text-status-warning border-status-warning/30",
    dot: "bg-status-warning",
  },
  danger: {
    badge: "bg-status-danger-bg text-status-danger border-status-danger/30",
    dot: "bg-status-danger",
  },
  info: {
    badge: "bg-status-info-bg text-status-info border-status-info/30",
    dot: "bg-status-info",
  },
  neutral: {
    badge: "bg-surface-muted text-text-secondary border-border",
    dot: "bg-text-secondary",
  },
  primary: {
    badge: "bg-primary/10 text-primary border-primary/20",
    dot: "bg-primary",
  },
};

const SIZES = {
  sm: "px-2 py-0.5 text-xs font-medium",
  md: "px-2.5 py-1 text-xs font-semibold",
};

const Badge = ({
  children,
  variant = "neutral",
  size = "sm",
  dot = false,
  icon = null,
  className = "",
}) => {
  const estilo = VARIANTS[variant] || VARIANTS.neutral;
  const estiloTamanho = SIZES[size] || SIZES.sm;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${estilo.badge} ${estiloTamanho} ${className}`}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${estilo.dot}`} />}
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
};

export default Badge;
