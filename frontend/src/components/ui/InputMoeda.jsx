import { useState, useEffect } from "react";
import Input from "./Input";
import * as Formatters from "../../utils/formatters";

const InputMoeda = ({ valor = 0, onChange, ...props }) => {
  const [focado, setFocado] = useState(false);
  const [texto, setTexto] = useState(() =>
    valor ? Formatters.formatarDecimalParaCampo(valor) : "",
  );

  useEffect(() => {
    const valorNumerico = Number(valor || 0);
    const valorTexto = Formatters.valorTextoParaDecimal(texto);
    if (!focado || valorTexto !== valorNumerico) {
      setTexto(valor ? Formatters.formatarDecimalParaCampo(valor) : "");
    }
  }, [valor, focado]);

  return (
    <Input
      {...props}
      type="text"
      inputMode="decimal"
      value={texto}
      onFocus={(e) => {
        setFocado(true);
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocado(false);
        setTexto(valor ? Formatters.formatarDecimalParaCampo(valor) : "");
        props.onBlur?.(e);
      }}
      onChange={(event) => {
        const proximoTexto = event.target.value;
        if (!Formatters.ehValorMonetarioEmDigitacao(proximoTexto)) return;
        const proximoValor = Formatters.valorTextoParaDecimal(proximoTexto);
        setTexto(proximoTexto);
        onChange?.(proximoValor);
      }}
    />
  );
};

export default InputMoeda;
