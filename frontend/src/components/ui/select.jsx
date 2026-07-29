// Campo de seleção reutilizável com rótulo e mensagem de erro.
import { forwardRef, useId } from "react";

const Select = forwardRef(
  (
    {
      // LABEL
      label = "",
      labelClassName = "",

      // OPÇÕES
      options = [],
      placeholder = "Selecione...",

      // TAMANHO
      size = "md", // sm | md | lg

      // VALOR
      value = "",
      onChange = null,

      // ESTADOS
      error = "",
      disabled = false,
      required = false,

      // ID
      id = "",
      name = "",

      // OUTROS
      className = "",
      selectClassName = "",
      ...props
    },
    ref,
  ) => {
    // ID automático estável para ligar o rótulo ao campo.
    const idAutomatico = useId();
    const selectId = id || `select-${idAutomatico}`;
    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-base",
      lg: "px-6 py-3 text-lg",
    };
    // ESTILOS BASE
    const baseSelectStyles = `
        w-full ${sizes[size]} pr-10
        border border-border
        rounded-btn
        text-body text-gray-800
        bg-white
        appearance-none
        focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
        transition-all duration-200
        disabled:opacity-60 disabled:cursor-not-allowed
        ${error ? "border-danger-text focus:ring-danger-text" : ""}
        ${selectClassName}
    `;

    // SETA PERSONALIZADA
    const ArrowIcon = () => (
      <svg
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
      >
        <path
          d="M5 7.5L10 12.5L15 7.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );

    return (
      <div className={`w-full ${className}`}>
        {/* LABEL */}
        {label && (
          <label
            htmlFor={selectId}
            className={`block text-sm font-medium text-primary mb-1 ${labelClassName}`}
          >
            {label}
            {required && <span className="text-danger-text ml-1">*</span>}
          </label>
        )}

        {/* SELECT */}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            value={value}
            onChange={onChange}
            disabled={disabled}
            required={required}
            name={name}
            className={baseSelectStyles}
            {...props}
          >
            {/* PLACEHOLDER */}
            {placeholder && <option value="">{placeholder}</option>}

            {/* OPÇÕES */}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled || false}
              >
                {option.label}
              </option>
            ))}
          </select>

          {/* SETA PERSONALIZADA */}
          <ArrowIcon />
        </div>

        {/* MENSAGEM DE ERRO */}
        {error && <p className="mt-1 text-sm text-danger-text">{error}</p>}
      </div>
    );
  },
);

Select.displayName = "Select";

export default Select;
