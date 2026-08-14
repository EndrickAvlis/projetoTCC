// Campo monetário que mantém a digitação amigável e entrega um número ao formulário.
import { useState } from "react";
import Input from "./Input";
import * as Formatters from "../../utils/formatters";

const InputMoeda = ({ valor = 0, onChange, ...props }) => {
  const [campo, setCampo] = useState(() => ({
    valorRecebido: valor,
    texto: valor ? Formatters.formatarDecimalParaCampo(valor) : "",
  }));

  // Sincroniza o texto quando o formulário limpa ou altera o valor externamente.
  if (campo.valorRecebido !== valor) {
    setCampo({
      valorRecebido: valor,
      texto: valor ? Formatters.formatarDecimalParaCampo(valor) : "",
    });
  }

  return (
    <Input
      {...props}
      type="text"
      inputMode="decimal"
      value={campo.texto}
      onBlur={() =>
        setCampo({
          valorRecebido: valor,
          texto: valor ? Formatters.formatarDecimalParaCampo(valor) : "",
        })
      }
      onChange={(event) => {
        const proximoTexto = event.target.value;
        if (!Formatters.ehValorMonetarioEmDigitacao(proximoTexto)) return;
        const proximoValor = Formatters.valorTextoParaDecimal(proximoTexto);
        setCampo({
          valorRecebido: proximoValor,
          texto: proximoTexto,
        });
        onChange(proximoValor);
      }}
    />
  );
};

export default InputMoeda;
