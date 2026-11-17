import { useState } from "react";
import Input from "./Input";
import * as Formatters from "../../utils/formatters";

const InputMoeda = ({ valor = 0, onChange, ...props }) => {
  const [focado, setFocado] = useState(false);
  const [texto, setTexto] = useState("");

  const valorExibido = focado
    ? texto
    : valor
      ? Formatters.formatarDecimalParaCampo(valor)
      : "";

  return (
    <Input
      {...props}
      type="text"
      inputMode="decimal"
      value={valorExibido}
      onFocus={(e) => {
        setTexto(valor ? Formatters.formatarDecimalParaCampo(valor) : "");
        setFocado(true);
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocado(false);
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
