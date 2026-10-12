import InputMoeda from "../../../../components/ui/InputMoeda";

const ContribuicaoVoluntaria = ({ contribuicao, onChange, disabled = false }) => (
  <div className="flex flex-1 flex-col justify-between gap-2 rounded-lg border border-border bg-page p-4">
    <div>
      <h3 className="font-semibold text-text-primary">Contribuição voluntária</h3>
    </div>

    <div className="flex items-center gap-2 max-w-50">
      <span className="text-sm font-semibold text-text-secondary">R$</span>
      <InputMoeda
        aria-label="Valor da contribuição voluntária"
        placeholder="0,00"
        valor={contribuicao}
        onChange={onChange}
        disabled={disabled}
        size="md"
      />
    </div>
  </div>
);

export default ContribuicaoVoluntaria;