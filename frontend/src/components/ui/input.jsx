// Campo de entrada reutilizável com rótulo, ícone e mensagem de erro.
import { forwardRef, useId } from "react";

const Input = forwardRef(
  (
    {
      // TIPO
      type = "text", // text | password | email | number | etc

      // LABEL
      label = "",
      labelClassName = "",

      // TAMANHOS
      size = "md", // sm | md | lg

      // PLACEHOLDER
      placeholder = "",

      // VALOR
      value = "",
      onChange = null,

      // ESTADOS
      error = "",
      disabled = false,
      required = false,

      // ÍCONE
      icon = null,
      iconPosition = "left", // left | right

      // ID
      id = "",
      name = "",

      // OUTROS
      className = "",
      inputClassName = "",
      ...props
    },
    ref,
  ) => {
    // ID automático estável para ligar o rótulo ao campo.
    const idAutomatico = useId();
    const inputId = id || `input-${idAutomatico}`;

    // ESTILOS POR TAMANHO
    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-base",
      lg: "px-6 py-3 text-lg",
    };

    // ESTILOS BASE
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
  ${icon && iconPosition === "right" ? "pr-10" : ""}
  ${inputClassName}
`;

    // CONTAINER COM ÍCONE
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
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          name={name}
          className={baseInputStyles}
          {...props}
        />

        {icon && iconPosition === "right" && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary">
            {icon}
          </span>
        )}
      </div>
    );

    return (
      <div className={`w-full ${className}`}>
        {/* LABEL */}
        {label && (
          <label
            htmlFor={inputId}
            className={`block text-sm font-medium text-primary mb-1 ${labelClassName}`}
          >
            {label}
            {required && <span className="text-status-danger ml-1">*</span>}
          </label>
        )}

        {/* INPUT */}
        {inputWithIcon}

        {/* MENSAGEM DE ERRO */}
        {error && <p className="mt-1 text-sm text-status-danger">{error}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;
