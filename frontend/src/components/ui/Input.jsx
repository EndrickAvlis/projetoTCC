import * as React from "react";
import * as FiIcons from "react-icons/fi";

const Input = React.forwardRef(
  (
    {
      type = "text",
      label = "",
      labelClassName = "",
      size = "md",
      placeholder = "",
      value = "",
      onChange = null,
      error = "",
      disabled = false,
      required = false,
      icon = null,
      iconPosition = "left",
      id = "",
      name = "",
      className = "",
      inputClassName = "",
      ...props
    },
    ref,
  ) => {
    const idAutomatico = React.useId();
    const inputId = id || `input-${idAutomatico}`;
    const [senhaVisivel, setSenhaVisivel] = React.useState(false);
    const ehSenha = type === "password";

    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-base",
      lg: "px-6 py-3 text-lg",
    };

    const temIconeDireita = (icon && iconPosition === "right") || ehSenha;

    const baseInputStyles = `
  w-full ${sizes[size]}
  border border-border
  rounded-btn
  text-text-primary
  placeholder:text-text-secondary
  bg-surface
  focus:outline-none focus:ring-2 focus:ring-focus-ring focus:border-transparent
  transition-all duration-200
  disabled:opacity-60 disabled:cursor-not-allowed
  ${error ? "border-status-danger focus:ring-status-danger" : ""}
  ${icon && iconPosition === "left" ? "pl-10" : ""}
  ${temIconeDireita ? "pr-10" : ""}
  ${inputClassName}
`;

    const inputWithIcon = (
      <div className="relative">
        {icon && iconPosition === "left" && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">
            {icon}
          </span>
        )}

        <input
          ref={ref}
          id={inputId}
          type={ehSenha ? (senhaVisivel ? "text" : "password") : type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          name={name}
          className={baseInputStyles}
          {...props}
        />

        {ehSenha ? (
          <button
            type="button"
            onClick={() => setSenhaVisivel((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-text-secondary hover:text-text-primary focus:outline-none"
            title={senhaVisivel ? "Ocultar senha" : "Ver senha"}
            tabIndex={-1}
          >
            {senhaVisivel ? (
              <FiIcons.FiEyeOff size={18} />
            ) : (
              <FiIcons.FiEye size={18} />
            )}
          </button>
        ) : (
          icon &&
          iconPosition === "right" && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary">
              {icon}
            </span>
          )
        )}
      </div>
    );

    return (
      <div className={`w-full ${className}`}>
        {label && (
          <label
            htmlFor={inputId}
            className={`block text-sm font-medium text-primary mb-1 ${labelClassName}`}
          >
            {label}
            {required && <span className="text-status-danger ml-1">*</span>}
          </label>
        )}

        {inputWithIcon}

        {error && <p className="mt-1 text-sm text-status-danger">{error}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;
