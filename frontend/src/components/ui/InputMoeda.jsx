import { useState, useEffect } from "react";
import Input from "./Input";
import * as Formatters from "../../utils/formatters";

const InputMoeda = ({ valor = 0, onChange, ...props }) => {
  const [texto, setTexto] = useState(() =>
    valor ? Formatters.formatarDecimalParaCampo(valor) : "",
  );

  useEffect(() => {
    setTexto(valor ? Formatters.formatarDecimalParaCampo(valor) : "");
  }, [valor]);

  return (
    <Input
      {...props}
      type="text"
      inputMode="decimal"
      value={texto}
      onBlur={() =>
        setTexto(valor ? Formatters.formatarDecimalParaCampo(valor) : "")
      }
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