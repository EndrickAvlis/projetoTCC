# Tela de Alunos

## Objetivo

A tela administrativa de Alunos deve importar a lista de classificação da ETEC,
cadastrar os candidatos e permitir a consulta dos registros importados.

Rota da tela: `/admin/alunos`.

## Interface

A tela deve conter:

- total de alunos ativos;
- botão **Importar lista de classificação**;
- pesquisa por nome;
- filtro por curso;
- filtro por situação do aluno: candidato, ativo ou arquivado;
- tabela com 10 registros por página;
- paginação, sem rolagem infinita.

O filtro inicial deve mostrar somente alunos ativos.

### Colunas da tabela

- nome do aluno;
- curso;
- classificação;
- cidade;
- situação do aluno;
- situação da matrícula.

A listagem, a pesquisa e os filtros devem ser processados pelo backend. A resposta
deve retornar somente os 10 registros da página solicitada e o total encontrado.

## Importação do CSV

Antes de importar, o administrador deve informar:

- ano do processo seletivo;
- semestre do processo seletivo.

Somente a primeira opção de curso será importada.

### Campos utilizados

| Campo do CSV | Destino |
|---|---|
| `NR_INSCRICAO` | `Aluno.numeroInscricao` |
| `NOME` | `Aluno.nomeAluno` |
| `ESCOLARIDADE` | `Aluno.escolaridadePublica` |
| `CIDADE` | `Aluno.cidadeAluno` |
| `SEXO` | `Aluno.sexoAluno` |
| `CLASSIFICACAO` | `CursoAluno.classificacao` |
| `COD_CURSO` | reconhecimento por `Curso.codigoCsv` |
| `HABILITACAO` | nome apresentado durante a associação do curso |
| `PERIODO` | `CursoAluno.periodo` |

`numeroInscricao` deve ser armazenado como texto. Espaços e apóstrofos adicionados
pelo CSV devem ser removidos sem eliminar zeros à esquerda.

`ESCOLARIDADE` deve converter `SIM` para `true` e `NÃO` para `false`.

`CLASSIFICACAO` pode ser nula.

Registros cuja habilitação seja `TREINEIRO` não devem ser importados.

CPF, RG, nascimento, endereço, telefone, e-mail e qualquer outra coluna não
listada nesta especificação devem ser ignorados e não podem ser armazenados.

O importador deve aceitar arquivo CSV separado por ponto e vírgula e tratar as
codificações UTF-8 e Windows-1252.

## Associação de cursos

Antes de confirmar a importação, o sistema deve agrupar os códigos de curso
encontrados no arquivo.

- Se `COD_CURSO` corresponder a `Curso.codigoCsv`, o curso será reconhecido.
- Se o código não for reconhecido, o administrador deverá associá-lo a um curso
  existente.
- A importação não pode ser confirmada enquanto houver curso sem associação.
- Depois da associação, o código deve ser salvo em `Curso.codigoCsv`.
- Se o código externo mudar, o administrador deverá fazer uma nova associação.

Um curso não deve ser criado automaticamente a partir do texto do CSV. Quando o
curso ainda não existir, ele deve ser cadastrado na tela de Cursos antes da
associação.

## Confirmação da importação

Ao confirmar a importação, para cada registro válido o sistema deve:

1. criar o aluno com `statusAluno = CANDIDATO`;
2. criar o vínculo `CursoAluno` com `statusMatricula = PENDENTE`;
3. salvar a classificação e o período no vínculo com o curso.

Todas as criações devem ocorrer em uma transação. Se houver erro não tratado,
nenhum registro do arquivo deve ser salvo.

Ao final, a tela deve informar:

- quantidade importada;
- quantidade ignorada por ser treineiro;
- quantidade ignorada por duplicidade;
- quantidade inválida.

## Prevenção de duplicidades

Uma mesma inscrição não pode ser importada mais de uma vez no mesmo processo
seletivo.

```prisma
@@unique([numeroInscricao, anoProcesso, semestreProcesso])
```

Registros que violem essa restrição devem ser ignorados e contabilizados como
duplicados, sem interromper os demais registros válidos.

## Situações e transições

```prisma
enum StatusAluno {
  CANDIDATO
  ATIVO
  ARQUIVADO
}

enum StatusMatricula {
  PENDENTE
  ATIVA
}
```

Fluxo principal:

```text
Importação do CSV
  -> Aluno CANDIDATO
  -> Matrícula PENDENTE
  -> Triagem seleciona o candidato
  -> Docs confirma a matrícula
  -> Aluno ATIVO
  -> Matrícula ATIVA
```

A confirmação em Docs deve atualizar o aluno e a matrícula na mesma transação.

## Alterações no banco de dados

### `Aluno`

- `idAluno`;
- `numeroInscricao`;
- `nomeAluno`;
- `escolaridadePublica`;
- `cidadeAluno`;
- `sexoAluno`;
- `statusAluno`;
- `anoProcesso`;
- `semestreProcesso`.

O campo de CPF não deve existir.

### `CursoAluno`

Acrescentar:

- `classificacao`, inteiro opcional;
- `statusMatricula`;
- `periodo`.

### `Curso`

Acrescentar:

- `codigoCsv`, texto opcional e único.

O enum utilizado por `periodo` deve aceitar `MANHA`, `TARDE`, `NOITE`, `INTEGRAL`
e `ONLINE`.

Nenhuma tabela nova será criada para esta funcionalidade.

## Critérios de conclusão

- O administrador consegue validar e importar um CSV.
- Cursos desconhecidos precisam ser associados antes da confirmação.
- Apenas os campos autorizados são armazenados.
- Candidatos e matrículas são criados com as situações corretas.
- Reimportar a mesma inscrição não cria duplicidade.
- A tabela mostra no máximo 10 registros por página.
- Pesquisa, filtros e paginação funcionam em conjunto.
- A confirmação em Docs ativa o aluno e a matrícula.
