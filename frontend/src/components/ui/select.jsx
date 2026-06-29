import { forwardRef } from 'react';

const Select = forwardRef(({
    // ===== LABEL =====
    label = '',
    labelClassName = '',
    
    // ===== OPÇÕES =====
    options = [],
    placeholder = 'Selecione...',
    
    // ===== VALOR =====
    value = '',
    onChange = null,
    
    // ===== ESTADOS =====
    error = '',
    disabled = false,
    required = false,
    
    // ===== ID =====
    id = '',
    name = '',
    
    // ===== OUTROS =====
    className = '',
    selectClassName = '',
    ...props
}, ref) => {
    
    // ===== ID automático =====
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

    // ===== ESTILOS BASE =====
    const baseSelectStyles = `
        w-full px-4 py-2 pr-10
        border border-border
        rounded-btn
        text-body text-gray-800
        bg-white
        appearance-none
        focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
        transition-all duration-200
        disabled:opacity-60 disabled:cursor-not-allowed
        ${error ? 'border-danger-text focus:ring-danger-text' : ''}
        ${selectClassName}
    `;

    // ===== SETA PERSONALIZADA (SVG) =====
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
                    {placeholder && (
                        <option value="">{placeholder}</option>
                    )}

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
            {error && (
                <p className="mt-1 text-sm text-danger-text">
                    {error}
                </p>
            )}
        </div>
    );
});

Select.displayName = 'Select';

export default Select;