import * as React from "react";

const Toggle = ({
  checked = false,
  onChange,
  label = "",
  disabled = false,
  size = "md",
  className = "",
  id,
  ...props
}) => {
  const autoId = React.useId();
  const toggleId = id || autoId;

  const tamanhos = {
    sm: {
      trilho: "h-5 w-9",
      circulo: "h-3.5 w-3.5",
      transladar: "translate-x-4",
    },
    md: {
      trilho: "h-6 w-11",
      circulo: "h-4.5 w-4.5",
      transladar: "translate-x-5",
    },
    lg: {
      trilho: "h-7 w-14",
      circulo: "h-5.5 w-5.5",
      transladar: "translate-x-7",
    },
  };

  const config = tamanhos[size] || tamanhos.md;

  const handleClick = (e) => {
    e.stopPropagation();
    if (disabled || !onChange) return;
    onChange(!checked);
  };

  return (
    <label
      htmlFor={toggleId}
      className={`inline-flex items-center gap-3 select-none ${
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
      } ${className}`}
    >
      <button
        type="button"
        role="switch"
        id={toggleId}
        aria-checked={checked}
        disabled={disabled}
        onClick={handleClick}
        className={`relative inline-flex shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out focus-visible:outline-hidden ${
          disabled ? "cursor-not-allowed" : "cursor-pointer"
        } ${config.trilho} ${checked ? "bg-primary" : "bg-border-strong"}`}
        {...props}
      >
        <span
          className={`inline-block rounded-full bg-white shadow-xs transition-transform duration-200 ease-in-out ${
            config.circulo
          } ${checked ? config.transladar : "translate-x-1"}`}
        />
      </button>

      {label && (
        <span className="text-sm font-medium text-text-primary">{label}</span>
      )}
    </label>
  );
};

export default Toggle;
