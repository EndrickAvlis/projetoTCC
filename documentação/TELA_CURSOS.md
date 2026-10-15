# Tela de Cursos

## 1. Objetivo e Escopo

A tela administrativa de Cursos gerencia o catálogo de cursos técnicos e integrados oferecidos pela instituição no SIGA Phila. Nela, os administradores configuram os cursos, seus períodos de oferta (turnos), a quantidade de vagas disponíveis e controlam a disponibilidade de novas matrículas.

Rota da tela:
```text
/admin/cursos
```

---

## 2. Acesso e Regras de Permissão

- **Perfil Administrador (`admin`)**: Acesso total a todas as operações (cadastro, alteração de nome, gestão de turnos/vagas e arquivamento).
- **Perfil Supervisor (`supervisor`) / Atendente (`atendente`)**: Não possuem permissão para gerenciar a estrutura de cursos e vagas. Tentativas de acesso via API retornam `403 Acesso Negado`.

---

## 3. Interface da Tela

A interface em [`CursosPage.jsx`](file:///c:/Users/endri/Desktop/TCC/frontend/src/features/admin/pages/CursosPage.jsx) é estruturada em:

1. **Cabeçalho**:
   - Título ("Cursos") e descrição de apoio.
   - Botão primário **+ Adicionar curso** (dispara o modal de cadastro).

2. **Barra de Filtros e Busca**:
   - Campo de busca textual por nome do curso (com sanitização e busca instantânea).
   - Alternador de situação: **Cursos Ativos** vs. **Cursos Arquivados**.

3. **Tabela de Dados (`DataTable`)**:
   - **Nome do Curso**: Título com formatação capitalizada.
   - **Períodos / Turnos**: Badges indicando os períodos cadastrados (`Manhã`, `Tarde`, `Noite`, `Integral`, `Online`), com status de matrícula ativa/pausada.
   - **Vagas**: Total de vagas somadas entre todos os períodos ativos.
   - **Situação**: Badge visual (Ativo / Arquivado).
   - **Menu de Ações (`TableMenuActions`)**:
     - *Editar Nome*: Abre modal para renomear o curso.
     - *Gerenciar Períodos*: Abre modal para incluir ou editar vagas e turnos.
     - *Arquivar / Desarquivar*: Abre modal de confirmação para alternar o status lógico do curso.

---

## 4. Modais e Componentes

### 4.1. Modal de Curso (`CursoModal.jsx`)
- Utilizado para cadastrar um novo curso ou atualizar o nome de um curso existente.
- Na criação inicial, exige ao menos um período configurado (turno, vagas totais e status da matrícula).

### 4.2. Modal de Períodos (`PeriodoModal.jsx`)
- Permite adicionar um novo turno a um curso existente ou atualizar as vagas e o status (`matriculaAtiva`) de um período já ofertado.
- Impede duplicidade de mesmo período no mesmo curso (validação combinada `codCurso` + `periodo`).

### 4.3. Modal de Confirmação (`ConfirmarModal.jsx`)
- Solicita confirmação explícita antes de arquivar ou desarquivar um curso, prevenindo cliques acidentais.

---

## 5. Endpoints da API (Backend)

Todos os endpoints operam sob o prefixo `/cursos` e exigem autenticação de perfil `admin`.

| Método | Endpoint | Finalidade |
| :--- | :--- | :--- |
| `GET` | `/cursos` | Lista cursos com filtros de busca textual (`busca`) e arquivamento (`arquivado`). |
| `POST` | `/cursos` | Cadastra novo curso contendo obrigatoriamente nome e ao menos 1 período. |
| `PATCH` | `/cursos/:cursoId` | Atualiza o nome oficial do curso. |
| `PATCH` | `/cursos/:cursoId/arquivamento` | Alterna o status lógico de arquivamento (`arquivado: boolean`). |
| `POST` | `/cursos/:cursoId/periodos` | Adiciona uma nova oferta de turno/período ao curso. |
| `PATCH` | `/cursos/:cursoId/periodos/:periodoId` | Atualiza a quantidade de vagas ou ativa/pausa a matrícula de um período. |

---

## 6. Regras de Negócio e Validações

1. **Formatação Padronizada de Nomes:**
   - O nome do curso passa por transformação automática que capitaliza substantivos e mantém preposições em minúsculas (ex: "Técnico em Desenvolvimento de Sistemas").
2. **Períodos Válidos:**
   - São aceitos estritamente os valores do enum `Periodo`: `manha`, `tarde`, `noite`, `integral` e `online`.
3. **Unicidade de Turnos por Curso:**
   - Um mesmo curso não pode possuir dois registros para o mesmo período (garantido por restrição única `@@unique([codCurso, periodo])` no banco e validação no schema Zod).
4. **Sem Exclusão Física (Soft Delete / Arquivamento):**
   - Cursos não são deletados fisicamente do banco de dados para preservar a integridade histórica de alunos cadastrados e matrículas já realizadas. Cursos descontinuados recebem `arquivado = true`.
