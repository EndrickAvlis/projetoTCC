import { forwardRef } from 'react';

const Input = forwardRef(({
    // ===== TIPO =====
    type = 'text',          // text | password | email | number | etc
    
    // ===== LABEL =====
    label = '',
    labelClassName = '',
    
    // ===== PLACEHOLDER =====
    placeholder = '',
    
    // ===== VALOR =====
    value = '',
    onChange = null,
    
    // ===== ESTADOS =====
    error = '',
    disabled = false,
    required = false,
    
    // ===== ÍCONE =====
    icon = null,
    iconPosition = 'left',  // left | right
    
    // ===== ID =====
    id = '',
    name = '',
    
    // ===== OUTROS =====
    className = '',
    inputClassName = '',
    ...props
}, ref) => {
    
    // ===== ID automático se não for passado =====
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    // ===== ESTILOS BASE =====
    const baseInputStyles = `
        w-full px-4 py-2
        border border-border
        rounded-btn
        text-body text-gray-800
        placeholder-gray-400
        bg-white
        focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
        transition-all duration-200
        disabled:opacity-60 disabled:cursor-not-allowed
        ${error ? 'border-danger-text focus:ring-danger-text' : ''}
        ${icon && iconPosition === 'left' ? 'pl-10' : ''}
        ${icon && iconPosition === 'right' ? 'pr-10' : ''}
        ${inputClassName}
    `;

    // ===== CONTAINER COM ÍCONE =====
    const inputWithIcon = (
        <div className="relative">
            {icon && iconPosition === 'left' && (
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
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
            
            {icon && iconPosition === 'right' && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
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
                    {required && <span className="text-danger-text ml-1">*</span>}
                </label>
            )}

            {/* INPUT */}
            {inputWithIcon}

            {/* MENSAGEM DE ERRO */}
            {error && (
                <p className="mt-1 text-sm text-danger-text">
                    {error}
                </p>
            )}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;