import { useState, isValidElement } from "react";
import { FiChevronDown } from "react-icons/fi";
import Card from "./Card";

const CardRetratil = ({
  children,
  titulo,
  subtitulo,
  icone: iconeProp,
  resumo,
  badge,
  acoes,
  header,
  aberto: abertoProp,
  abertoInicialmente = false,
  onToggle,
  disabled = false,
  className = "",
  headerClassName = "",
  tituloClassName = "",
  bodyClassName = "p-5 border-t border-border",
  ...props
}) => {
  const [abertoInterno, setAbertoInterno] = useState(abertoInicialmente);

  const eControlado = abertoProp !== undefined;
  const estaAberto = eControlado ? abertoProp : abertoInterno;

  const handleToggle = () => {
    if (disabled) return;
    const novoEstado = !estaAberto;
    if (!eControlado) {
      setAbertoInterno(novoEstado);
    }
    if (onToggle) {
      onToggle(novoEstado);
    }
  };

  const renderIcone = () => {
    if (!iconeProp) return null;
    if (isValidElement(iconeProp)) return iconeProp;
    if (typeof iconeProp === "function") {
      const IconeComponent = iconeProp;
      return (
        <IconeComponent className="h-5 w-5 text-text-secondary shrink-0" />
      );
    }
    return null;
  };

  const temBgHeader = headerClassName.includes("bg-");

  return (
    <Card semPadding className={className} {...props}>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-expanded={estaAberto}
        onClick={handleToggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleToggle();
          }
        }}
        className={`w-full flex items-center justify-between gap-4 p-4 text-left select-none transition-colors ${
          disabled
            ? "opacity-60 cursor-not-allowed"
            : temBgHeader
              ? "cursor-pointer hover:brightness-98"
              : "cursor-pointer hover:bg-surface-muted/50"
        } ${headerClassName}`}
      >
        {header ? (
          typeof header === "function" ? (
            header({ estaAberto, toggle: handleToggle })
          ) : (
            header
          )
        ) : (
          <>
            <div
              className={`flex items-center gap-3 min-w-0 ${tituloClassName}`}
            >
              {renderIcone()}
              <div className="min-w-0">
                {titulo && (
                  <div className="font-semibold text-text-primary text-base truncate">
                    {titulo}
                  </div>
                )}
                {subtitulo && (
                  <p className="text-xs text-text-secondary mt-0.5">
                    {subtitulo}
                  </p>
                )}
              </div>
            </div>

            {resumo && (
              <div className="hidden md:flex items-center gap-4 text-xs text-text-secondary">
                {resumo}
              </div>
            )}

            <div className="flex items-center gap-3 shrink-0">
              {badge && <div>{badge}</div>}
              {acoes && <div onClick={(e) => e.stopPropagation()}>{acoes}</div>}
              <FiChevronDown
                className={`h-5 w-5 text-text-secondary transition-transform duration-200 ${
                  estaAberto ? "rotate-180" : ""
                }`}
              />
            </div>
          </>
        )}
      </div>

      {estaAberto && <div className={bodyClassName}>{children}</div>}
    </Card>
  );
};

export default CardRetratil;
