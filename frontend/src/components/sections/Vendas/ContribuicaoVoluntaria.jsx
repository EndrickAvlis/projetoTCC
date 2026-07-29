// Campo opcional para registrar a contribuição voluntária do aluno.
import InputMoeda from "../../ui/InputMoeda";

const ContribuicaoVoluntaria = ({ valorContribuicao, onChange, disabled = false }) => (
  <section className="bg-white border border-border rounded-lg p-5 flex flex-col gap-4">
    <div>
      <h2 className="text-section font-semibold text-primary">Contribuição voluntária</h2>
      <p className="text-sm text-gray-500">Informe o valor que o aluno deseja contribuir.</p>
    </div>
    <div className="flex items-center gap-2 max-w-65">
      <span className="text-gray-600">R$</span>
      <InputMoeda aria-label="Valor da contribuição voluntária" placeholder="0,00" valor={valorContribuicao} onChange={onChange} disabled={disabled} size="md" />
    </div>
  </section>
);

export default ContribuicaoVoluntaria;
