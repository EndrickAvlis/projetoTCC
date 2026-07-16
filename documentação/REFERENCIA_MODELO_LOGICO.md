# Referência do modelo lógico — SIGAPhila

Fonte: `C:\Users\endri\Documents\TCC\modeloLogico\LogicoSIGAPhila.jpg` (fornecida em 15/07/2026).

Este documento registra o modelo lógico que deve orientar a implementação do backend e a integração do frontend.

## Entidades

| Entidade | Chave e campos principais | Finalidade |
|---|---|---|
| `Aluno` | `cpfAluno` (PK), `anoAluno`, `nomeAluno` | Identifica o estudante pelo CPF. |
| `Curso` | `idCurso` (PK), `periodoCurso`, `nomeCurso` | Catálogo de cursos. |
| `cursoAluno` | `idCurso`, `cpfAluno` | Associação entre aluno e curso. |
| `Senha` | `idSenha` (PK), `codAluno`, `senhaCodigo`, `dataHoraEmissaoSenha`, `dataHoraFinalizacaoSenha`, `etapaSenha`, `tipoSenha`, `statusSenha` | Senha e estado do atendimento. |
| `historicoSenha` | `idHistorico` (PK), `codSenha`, `codVoluntario`, `dataHoraInicioHistorico`, `dataHoraFimHistorico` | Registro do atendimento de uma senha por voluntário. |
| `Voluntario` | `idVoluntario` (PK), `nomeVoluntario`, `senhaVoluntario`, `tipoVoluntario`, `statusVoluntario` | Usuários que atendem e realizam vendas. |
| `Compra` | `idCompra` (PK), `codVoluntario`, `codAluno`,  `valorCompra`, `dataHoraCompra`, `codigoRetirada` | Venda associada a um voluntário e um aluno. |
| `ItemCompra` | `idProduto`, `idCompra`, `precoUnitario`, `quantidadeItem`, `quantidadeRetiradaItem`, `statusItem` | Itens de uma compra. |
| `Produto` | `idProduto` (PK), `nomeProduto`, `precoProduto`, `quantidadeProduto`, `tipoProduto`, `statusItem` | Estoque e catálogo de produtos. |
| `Pagamento` | `idPagamento` (PK), `codCompra`, `valorPagamento`, `tipoPagamento` | Pagamentos de uma compra. |
| `Contribuicao` | `idContribuicao` (PK), `codCompra`, `valorContribuicao`, `dataHora` | Contribuição vinculada a uma compra. |

## Relações que orientam o sistema

- Um aluno pode estar associado a cursos por `cursoAluno`; a tela de triagem deve buscar por CPF e listar essas associações.
- Uma senha pertence a um aluno e pode gerar vários registros em `historicoSenha`, um para cada atendimento/etapa.
- Cada histórico é atendido por um voluntário.
- Uma compra é realizada por um voluntário e associada a um aluno, possui itens, pagamentos e, opcionalmente, uma contribuição.
- Cada item de compra referencia um produto; a baixa de estoque deve ocorrer no backend, de forma transacional.

## Convenções para a implementação

- As colunas com prefixo `cod` devem ser chaves estrangeiras para a chave `id` ou `cpf` da entidade correspondente.
- `ItemCompra` deve usar chave primária composta por `idCompra` e `idProduto`, salvo decisão explícita de criar uma chave substituta.
- Valores monetários devem ser `DECIMAL`, nunca `float`.
- Senhas de voluntários não devem ser gravadas em texto puro: usar hash seguro.
- Os valores permitidos para `etapaSenha`, `tipoSenha` e os campos de status devem ser definidos como enums/validações no backend.
- `etapaSenha` = 'triagem', 'apm' e 'docs'. `tipoSenha` = 'normal' e 'prioritaria'.
-  `tipoVoluntario` = 'administrador', 'supervisor' e 'atendente'.
- `statusSenha` = 'aguardando', 'em_atendimento', 'finalizada' e 'cancelada'.
- `tipoProduto` = 'uniforme' e 'armario'
- `periodoCurso` = 'manha', 'tarde', 'noite', 'integral'
- `tipoPagamento` = 'dinheiro', 'pix', 'debito', 'credito', 'outro'

## Lacunas a decidir antes da implementação

O desenho não mostra uma entidade para documentos/matrícula, guichê ou painel de chamadas. A compra já possui vínculo com o aluno por `codAluno`; um vínculo direto com a senha permanece opcional, caso seja necessário rastrear a venda por atendimento. Caso essas regras façam parte do escopo, elas exigem novas colunas ou tabelas.

# Ideias adcionais

- O voluntario tem nomeVoluntario como username.
- Em relação ao função que o usuario coloca no login isso é definido como o tipo, mas no caso:
Administrador tem acesso a todas as funções e telas do sistema.
Supervisor tem acesso a todas as funções com restrições de não poder adicionar outros supervisores e adiminitradores.
Atendente só acessa as telas dos postos(triagem, apm, docs).
São esses 3 tipos de usuario e eles têm acesso as telas de acordo com o seu tipo.
- Em relação aos guiches eles são só de identificação, ou seja, o usuario que esta atendendo pode trocar toda vez que for fazer um novo login.
- A tela de docs somente mostra os dados do aluno, a parte de cadastro de matricula do aluno é feito por outro sistema da escola.
