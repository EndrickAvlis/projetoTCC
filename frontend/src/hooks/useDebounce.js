import * as React from "react";

export const useDebounce = (valor, delay = 300) => {
  const [valorDebounced, setValorDebounced] = React.useState(valor);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setValorDebounced(valor);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [valor, delay]);

  return valorDebounced;
};

export default useDebounce;
