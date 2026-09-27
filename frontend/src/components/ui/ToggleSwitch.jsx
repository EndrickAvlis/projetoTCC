import { forwardRef } from "react";

const ToggleSwitch = forwardRef(
  (
    {
      checked = false,
      onChange,
      label,
      disabled = false,
      size = "md",
      id,
      name,
      className = "",
      ...props
    },
    ref,
  ) => {
    const handleToggle = () => {
      if (disabled || !onChange) return;
      onChange(!checked);
    };

    const handleKeyDown = (event) => {
      if (disabled) return;
      if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        onChange && onChange(!checked);
      }
    };

    const tamanhos = {
      sm: {
        trilho: "w-9 h-5",
        cursor: "w-4 h-4 translate-x-0.5",
        cursorAtivo: "translate-x-4",
      },
      md: {
        trilho: "w-11 h-6",
        cursor: "w-5 h-5 translate-x-0.5",
        cursorAtivo: "translate-x-5",
      },
      lg: {
        trilho: "w-14 h-7",
        cursor: "w-6 h-6 translate-x-0.5",
        cursorAtivo: "translate-x-7",
      },
    };

    const config = tamanhos[size] || tamanhos.md;

    return (
      <label
        htmlFor={id}
        className={`inline-flex items-center gap-3 select-none ${
          disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
        } ${className}`}
      >
        <button
          ref={ref}
          type="button"
          role="switch"
          id={id}
          name={name}
          aria-checked={checked}
          disabled={disabled}
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          className={`relative inline-flex shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
            config.trilho
          } ${checked ? "bg-primary" : "bg-border-strong"}`}
          {...props}
        >
          <span
            className={`pointer-events-none inline-block rounded-full bg-surface shadow-sm transition-transform duration-200 ease-in-out ${
              config.cursor
            } ${checked ? config.cursorAtivo : ""}`}
          />
        </button>

        {label && (
          <span className="text-sm font-medium text-text-primary">
            {label}
          </span>
        )}
      </label>
    );
  },
);

ToggleSwitch.displayName = "ToggleSwitch";

export default ToggleSwitch;
