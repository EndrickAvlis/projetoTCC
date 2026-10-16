import { isValidElement } from "react";

const BORDAS_LATERAIS = {
  success: "border-l-4 border-l-status-success",
  warning: "border-l-4 border-l-status-warning",
  danger: "border-l-4 border-l-status-danger",
  info: "border-l-4 border-l-status-info",
  primary: "border-l-4 border-l-primary",
};

const Card = ({
  children,
  titulo,
  subtitulo,
  icone: iconeProp,
  acoes,
  header,
  footer,
  divisor = false,
  bordaLateral,
  className = "",
  headerClassName = "",
  bodyClassName = "p-5",
  footerClassName = "",
  semPadding = false,
  ...props
}) => {
  const temHeader = Boolean(
    header || titulo || subtitulo || iconeProp || acoes,
  );
  const classeBordaLateral =
    BORDAS_LATERAIS[bordaLateral] || bordaLateral || "";

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

  const temBg = className.includes("bg-");
  const classeBg = temBg ? "" : "bg-surface";
  const temBordaCor =
    className.includes("border-") && !className.includes("border-border");
  const classeBorda = temBordaCor ? "border" : "border border-border";

  return (
    <div
      className={`${classeBg} rounded-lg ${classeBorda} shadow-xs overflow-hidden ${classeBordaLateral} ${className}`}
      {...props}
    >
      {temHeader && (
        <header
          className={`flex items-center justify-between px-5 py-4 ${
            divisor ? "border-b border-border" : "pb-0"
          } ${headerClassName}`}
        >
          {header ? (
            header
          ) : (
            <>
              <div className="flex items-center gap-3 min-w-0">
                {renderIcone()}
                <div className="min-w-0">
                  {titulo && (
                    <h3 className="font-semibold text-text-primary text-base truncate">
                      {titulo}
                    </h3>
                  )}
                  {subtitulo && (
                    <p className="text-xs text-text-secondary mt-0.5">
                      {subtitulo}
                    </p>
                  )}
                </div>
              </div>
              {acoes && (
                <div className="flex items-center gap-2 shrink-0">{acoes}</div>
              )}
            </>
          )}
        </header>
      )}

      {semPadding ? children : <div className={bodyClassName}>{children}</div>}

      {footer && (
        <footer
          className={`border-t border-border bg-surface px-5 py-3 ${footerClassName}`}
        >
          {footer}
        </footer>
      )}
    </div>
  );
};

export default Card;
