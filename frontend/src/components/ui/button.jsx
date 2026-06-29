import { forwardRef } from 'react';

const Button = forwardRef(({
    // ===== VARIAÇÕES =====
    variant = 'primary',     // primary | secondary | danger | success | outline
    
    // ===== TAMANHOS =====
    size = 'md',            // sm | md | lg
    
    // ===== ESTADOS =====
    disabled = false,
    loading = false,
    
    // ===== TIPO =====
    type = 'button',        // button | submit | reset
    
    // ===== ÍCONES =====
    leftIcon = null,
    rightIcon = null,
    
    // ===== FUNÇÕES =====
    onClick = null,
    
    // ===== OUTROS =====
    className = '',
    children,
    ...props
}, ref) => {
    
    // ===== ESTILOS POR VARIANTE =====
    const variants = {
        primary: 'bg-primary text-white hover:bg-primary-light active:bg-[#081E3A] focus-visible:outline-primary',
        secondary: 'bg-[#E0E0E0] text-[#1A1A1A] hover:bg-[#D0D0D0] active:bg-[#C0C0C0] focus-visible:outline-[#999999]',
        danger: 'bg-white text-danger-text border border-danger-text hover:bg-danger-bg active:bg-[#FFB0B0] focus-visible:outline-danger-text',
        success: 'bg-success-text text-white hover:bg-[#23801A] active:bg-[#1A6B13] focus-visible:outline-success-text',
        outline: 'bg-transparent text-primary border border-primary hover:bg-primary hover:text-white active:bg-primary-light focus-visible:outline-primary',
    };

    // ===== ESTILOS POR TAMANHO =====
    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
    };

    // ===== BASE (estilos comuns a todos) =====
    const baseStyles = `
        inline-flex items-center justify-center
        font-medium rounded-btn
        transition-all duration-200
        focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${className}
    `;

    // ===== FUNÇÃO DE CLIQUE =====
    const handleClick = (e) => {
        if (disabled || loading) return;
        if (onClick) onClick(e);
    };

    // ===== RENDER =====
    return (
        <button
            ref={ref}
            type={type}
            disabled={disabled || loading}
            onClick={handleClick}
            className={baseStyles}
            {...props}
        >
            {leftIcon && !loading && (
                <span className="mr-2">{leftIcon}</span>
            )}

            {loading && (
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
            )}

            <span>{children}</span>

            {rightIcon && !loading && (
                <span className="ml-2">{rightIcon}</span>
            )}
        </button>
    );
});

Button.displayName = 'Button';

export default Button;