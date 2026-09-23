const STORAGE_KEY = "siga-phila-alunos-prototipo-v1";
const PAGE_SIZE = 10;
const REQUIRED_HEADERS = [
  "NR_INSCRICAO",
  "NOME",
  "ESCOLARIDADE",
  "CIDADE",
  "SEXO",
  "CLASSIFICACAO",
  "COD_CURSO",
  "HABILITACAO",
  "PERIODO",
];

const courseSeed = [
  { id: "curso-ds", name: "Desenvolvimento de Sistemas", codigoCsv: "4124" },
  { id: "curso-enf", name: "Enfermagem", codigoCsv: "4712" },
  { id: "curso-ele", name: "Eletrônica", codigoCsv: "4596" },
  { id: "curso-adm", name: "Administração", codigoCsv: null },
  { id: "curso-protese", name: "Prótese Dentária", codigoCsv: null },
  { id: "curso-eletro", name: "Eletromecânica", codigoCsv: null },
  { id: "curso-cont", name: "Contabilidade", codigoCsv: null },
  { id: "curso-tur", name: "Guia de Turismo", codigoCsv: null },
  { id: "curso-com", name: "Comércio", codigoCsv: null },
  { id: "curso-edi", name: "Edificações", codigoCsv: null },
  { id: "curso-ti", name: "Transações Imobiliárias", codigoCsv: null },
  { id: "curso-sec", name: "Secretariado", codigoCsv: null },
];

const firstNames = [
  "Ana", "Beatriz", "Caio", "Daniel", "Eduarda", "Felipe", "Gabriela", "Henrique",
  "Isabela", "João", "Larissa", "Mateus", "Natália", "Otávio", "Paula", "Rafael",
  "Sabrina", "Thiago", "Vitória", "Yasmin",
];
const lastNames = [
  "Almeida", "Barbosa", "Cardoso", "Dias", "Ferreira", "Gomes", "Lima", "Martins",
  "Nogueira", "Oliveira", "Pereira", "Ribeiro", "Santos", "Silva", "Souza",
];
const citySeed = ["São José do Rio Preto", "Bady Bassitt", "Mirassol", "Cedral", "Guapiaçu"];

function createSeedDatabase() {
  const students = Array.from({ length: 48 }, (_, index) => {
    const status = index < 24 ? "ATIVO" : index < 42 ? "CANDIDATO" : "ARQUIVADO";
    const course = courseSeed[index % 5];

    return {
      id: `demo-${index + 1}`,
      registration: `2026${String(index + 1).padStart(4, "0")}`,
      name: `${firstNames[index % firstNames.length]} ${lastNames[(index * 3) % lastNames.length]}`,
      publicSchool: index % 4 !== 0,
      city: citySeed[index % citySeed.length],
      sex: index % 2 === 0 ? "FEMININO" : "MASCULINO",
      status,
      processYear: 2026,
      processSemester: 2,
      enrollment: {
        courseId: course.id,
        classification: index % 9 === 0 ? null : index + 1,
        status: status === "CANDIDATO" ? "PENDENTE" : "ATIVA",
        period: index % 3 === 0 ? "ONLINE" : "NOITE",
      },
    };
  });

  return {
    courses: courseSeed.map((course) => ({ ...course })),
    students,
  };
}

function loadDatabase() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return createSeedDatabase();
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed.courses) || !Array.isArray(parsed.students)) {
      return createSeedDatabase();
    }
    return parsed;
  } catch {
    return createSeedDatabase();
  }
}

function saveDatabase() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(database));
}

let database = loadDatabase();

const state = {
  search: "",
  course: "",
  status: "ATIVO",
  page: 1,
  openMenuStudentId: null,
  detailsStudentId: null,
};

let importState = createImportState();

function createImportState() {
  return {
    step: 1,
    file: null,
    processYear: new Date().getFullYear(),
    processSemester: 2,
    analysis: null,
    mappings: {},
    result: null,
    error: "",
    loading: false,
  };
}

const elements = {
  sidebar: document.querySelector("#sidebar"),
  sidebarToggle: document.querySelector("#sidebarToggle"),
  search: document.querySelector("#searchInput"),
  course: document.querySelector("#courseFilter"),
  status: document.querySelector("#statusFilter"),
  tableBody: document.querySelector("#studentsTableBody"),
  tableShell: document.querySelector(".table-shell"),
  empty: document.querySelector("#emptyState"),
  pagination: document.querySelector("#pagination"),
  paginationSummary: document.querySelector("#paginationSummary"),
  resultsSummary: document.querySelector("#resultsSummary"),
  activeCount: document.querySelector("#activeCount"),
  candidateCount: document.querySelector("#candidateCount"),
  importModal: document.querySelector("#importModal"),
  importContent: document.querySelector("#importModalContent"),
  detailsModal: document.querySelector("#detailsModal"),
  detailsContent: document.querySelector("#detailsModalContent"),
  actionMenu: document.querySelector("#rowActionMenu"),
  toastRegion: document.querySelector("#toastRegion"),
};

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizeText(value) {
  return String(value ?? "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/\s+/g, " ");
}

function normalizeCourseName(value) {
  return normalizeText(value)
    .replace(/\s*-\s*EAD\b/g, "")
    .replace(/\s*-\s*\d+%\s*ON\s*-?\s*LINE\b/g, "")
    .replace(/\s*-\s*\d+%\s*ONLINE\b/g, "")
    .trim();
}

function normalizeRegistration(value) {
  return String(value ?? "").trim().replace(/^'+/, "").trim();
}

function normalizeCode(value) {
  return String(value ?? "").trim().replace(/^'+/, "").trim();
}

function normalizePeriod(value) {
  const normalized = normalizeText(value).replaceAll("-", "").replaceAll(" ", "");
  const periods = {
    MANHA: "MANHA",
    TARDE: "TARDE",
    NOITE: "NOITE",
    INTEGRAL: "INTEGRAL",
    ONLINE: "ONLINE",
  };
  return periods[normalized] ?? null;
}

function formatPeriod(period) {
  const labels = { MANHA: "Manhã", TARDE: "Tarde", NOITE: "Noite", INTEGRAL: "Integral", ONLINE: "On-line" };
  return labels[period] ?? period ?? "—";
}

function formatStatus(status) {
  const labels = {
    ATIVO: "Ativo",
    CANDIDATO: "Candidato",
    ARQUIVADO: "Arquivado",
    PENDENTE: "Pendente",
    ATIVA: "Ativa",
  };
  return labels[status] ?? status;
}

function statusBadge(status) {
  const styles = {
    ATIVO: "success",
    CANDIDATO: "info",
    ARQUIVADO: "neutral",
    PENDENTE: "warning",
    ATIVA: "success",
  };
  return `<span class="badge badge-${styles[status] ?? "neutral"}">${escapeHtml(formatStatus(status))}</span>`;
}

function getCourse(courseId) {
  return database.courses.find((course) => course.id === courseId) ?? null;
}

function getStudent(studentId) {
  return database.students.find((student) => student.id === studentId) ?? null;
}

function createId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `local-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function filteredStudents() {
  const term = state.search.trim().toLocaleLowerCase("pt-BR");

  return database.students
    .filter((student) => {
      const matchesName = !term || student.name.toLocaleLowerCase("pt-BR").includes(term);
      const matchesCourse = !state.course || student.enrollment.courseId === state.course;
      const matchesStatus = !state.status || student.status === state.status;
      return matchesName && matchesCourse && matchesStatus;
    })
    .sort((left, right) => left.name.localeCompare(right.name, "pt-BR"));
}

function renderCourseFilter() {
  const currentValue = state.course;
  const options = [...database.courses].sort((left, right) => left.name.localeCompare(right.name, "pt-BR"));
  elements.course.innerHTML = '<option value="">Todos os cursos</option>' + options
    .map((course) => `<option value="${escapeHtml(course.id)}">${escapeHtml(course.name)}</option>`)
    .join("");
  elements.course.value = currentValue;
}

function getPageTokens(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
  const pages = new Set([1, total, current - 1, current, current + 1]);
  const sorted = [...pages].filter((page) => page >= 1 && page <= total).sort((a, b) => a - b);
  const tokens = [];
  sorted.forEach((page, index) => {
    if (index > 0 && page - sorted[index - 1] > 1) tokens.push("…");
    tokens.push(page);
  });
  return tokens;
}

function renderPagination(totalPages) {
  const tokens = getPageTokens(state.page, totalPages);
  elements.pagination.innerHTML = `
    <button class="page-button" data-page="${state.page - 1}" ${state.page === 1 ? "disabled" : ""} aria-label="Página anterior">‹</button>
    ${tokens.map((token) => token === "…"
      ? '<span class="pagination-ellipsis">…</span>'
      : `<button class="page-button ${token === state.page ? "current" : ""}" data-page="${token}" aria-label="Página ${token}" ${token === state.page ? 'aria-current="page"' : ""}>${token}</button>`
    ).join("")}
    <button class="page-button" data-page="${state.page + 1}" ${state.page === totalPages ? "disabled" : ""} aria-label="Próxima página">›</button>
  `;
}

function renderStudents() {
  const filtered = filteredStudents();
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  state.page = Math.min(state.page, totalPages);
  const start = (state.page - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(start, start + PAGE_SIZE);

  const activeCount = database.students.filter((student) => student.status === "ATIVO").length;
  const candidateCount = database.students.filter((student) => student.status === "CANDIDATO").length;
  elements.activeCount.textContent = activeCount.toLocaleString("pt-BR");
  elements.candidateCount.textContent = candidateCount.toLocaleString("pt-BR");
  elements.resultsSummary.textContent = `${filtered.length.toLocaleString("pt-BR")} registro${filtered.length === 1 ? "" : "s"} encontrado${filtered.length === 1 ? "" : "s"}.`;

  elements.tableBody.innerHTML = pageItems.map((student) => {
    const course = getCourse(student.enrollment.courseId);
    const classification = student.enrollment.classification;
    return `
      <tr>
        <td>
          <span class="student-name">${escapeHtml(student.name)}</span>
          <span class="student-meta">Inscrição ${escapeHtml(student.registration)}</span>
        </td>
        <td>${escapeHtml(course?.name ?? "Curso não encontrado")}<span class="student-meta">${escapeHtml(formatPeriod(student.enrollment.period))}</span></td>
        <td><span class="classification ${classification ? "" : "muted"}">${classification ? `${classification}º` : "—"}</span></td>
        <td>${escapeHtml(student.city)}</td>
        <td>${statusBadge(student.status)}</td>
        <td>${statusBadge(student.enrollment.status)}</td>
        <td class="align-right">
          <button class="row-action" data-student-menu="${escapeHtml(student.id)}" aria-label="Abrir ações de ${escapeHtml(student.name)}" aria-expanded="false">⋮</button>
        </td>
      </tr>
    `;
  }).join("");

  const hasItems = pageItems.length > 0;
  elements.tableShell.classList.toggle("hidden", !hasItems);
  elements.empty.classList.toggle("hidden", hasItems);
  elements.paginationSummary.textContent = hasItems
    ? `Mostrando ${start + 1}–${start + pageItems.length} de ${filtered.length.toLocaleString("pt-BR")} alunos`
    : "Nenhum aluno para exibir";
  renderPagination(totalPages);
}

function toast(message, type = "success") {
  const toastElement = document.createElement("div");
  toastElement.className = `toast toast-${type}`;
  toastElement.textContent = message;
  elements.toastRegion.append(toastElement);
  setTimeout(() => toastElement.remove(), 4200);
}

function openModal(modal) {
  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeModal(modal, returnFocusSelector) {
  modal.classList.add("hidden");
  if (elements.importModal.classList.contains("hidden") && elements.detailsModal.classList.contains("hidden")) {
    document.body.style.overflow = "";
  }
  document.querySelector(returnFocusSelector)?.focus();
}

function openImportModal() {
  importState = createImportState();
  renderImportStep();
  openModal(elements.importModal);
  setTimeout(() => elements.importModal.querySelector("[data-close-import]")?.focus(), 0);
}

function closeImportModal() {
  closeModal(elements.importModal, "#openImportButton");
}

function importStepsMarkup() {
  const steps = ["Arquivo", "Cursos", "Resultado"];
  return `
    <ol class="stepper" aria-label="Etapas da importação">
      ${steps.map((label, index) => {
        const number = index + 1;
        const stateClass = number < importState.step ? "complete" : number === importState.step ? "active" : "";
        return `<li class="step ${stateClass}"><span>${number < importState.step ? "✓" : number}</span><strong>${label}</strong></li>`;
      }).join("")}
    </ol>
  `;
}

function renderImportStep() {
  if (importState.step === 1) renderImportUpload();
  if (importState.step === 2) renderImportMappings();
  if (importState.step === 3) renderImportResult();
}

function fileSizeLabel(size) {
  if (size < 1024) return `${size} bytes`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function renderImportUpload() {
  elements.importContent.innerHTML = `
    ${importStepsMarkup()}
    <form class="import-form" id="importUploadForm">
      ${importState.error ? `<div class="alert alert-danger"><strong>Não foi possível analisar o arquivo.</strong><span>${escapeHtml(importState.error)}</span></div>` : ""}
      <div class="form-grid">
        <label class="form-field">
          <span>Ano do processo</span>
          <input id="processYearInput" type="number" min="2020" max="2100" value="${importState.processYear}" required />
        </label>
        <label class="form-field">
          <span>Semestre</span>
          <select id="processSemesterInput" required>
            <option value="1" ${importState.processSemester === 1 ? "selected" : ""}>1º semestre</option>
            <option value="2" ${importState.processSemester === 2 ? "selected" : ""}>2º semestre</option>
          </select>
        </label>
      </div>

      <label class="drop-zone ${importState.file ? "has-file" : ""}" id="csvDropZone">
        <input id="csvFileInput" type="file" accept=".csv,text/csv" />
        <span class="drop-icon" aria-hidden="true">⇧</span>
        ${importState.file ? `
          <strong>${escapeHtml(importState.file.name)}</strong>
          <span>${fileSizeLabel(importState.file.size)} · pronto para análise</span>
          <small>Clique ou arraste outro arquivo para substituir.</small>
        ` : `
          <strong>Selecione a lista de classificação</strong>
          <span>Arraste o arquivo aqui ou clique para procurar.</span>
          <small>Arquivo CSV separado por ponto e vírgula, com até 10 MB.</small>
        `}
      </label>

      <div class="privacy-note">
        <span aria-hidden="true">i</span>
        <p>Somente nome, inscrição, escolaridade pública, cidade, sexo, classificação, curso e período serão salvos. Os demais campos serão descartados.</p>
      </div>

      <footer class="modal-footer">
        <button class="button button-quiet" type="button" data-cancel-import>Cancelar</button>
        <button class="button button-primary" type="submit" ${!importState.file || importState.loading ? "disabled" : ""}>
          ${importState.loading ? '<span class="spinner" aria-hidden="true"></span>Analisando...' : "Analisar arquivo"}
        </button>
      </footer>
    </form>
  `;

  const form = elements.importContent.querySelector("#importUploadForm");
  const fileInput = elements.importContent.querySelector("#csvFileInput");
  const dropZone = elements.importContent.querySelector("#csvDropZone");

  fileInput.addEventListener("change", (event) => selectCsvFile(event.target.files[0]));
  dropZone.addEventListener("dragover", (event) => {
    event.preventDefault();
    dropZone.classList.add("dragging");
  });
  dropZone.addEventListener("dragleave", () => dropZone.classList.remove("dragging"));
  dropZone.addEventListener("drop", (event) => {
    event.preventDefault();
    dropZone.classList.remove("dragging");
    selectCsvFile(event.dataTransfer.files[0]);
  });
  elements.importContent.querySelector("[data-cancel-import]").addEventListener("click", closeImportModal);
  form.addEventListener("submit", analyzeSelectedFile);
}

function selectCsvFile(file) {
  if (!file) return;
  const isCsv = file.name.toLocaleLowerCase("pt-BR").endsWith(".csv");
  if (!isCsv) {
    importState.error = "Selecione um arquivo com extensão .csv.";
    importState.file = null;
  } else if (file.size > 10 * 1024 * 1024) {
    importState.error = "O arquivo ultrapassa o limite de 10 MB.";
    importState.file = null;
  } else {
    importState.file = file;
    importState.error = "";
  }
  renderImportUpload();
}

function decodeCsv(arrayBuffer) {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(arrayBuffer);
  } catch {
    return new TextDecoder("windows-1252").decode(arrayBuffer);
  }
}

function parseCsv(text, delimiter = ";") {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];

    if (quoted) {
      if (character === '"') {
        if (text[index + 1] === '"') {
          cell += '"';
          index += 1;
        } else {
          quoted = false;
        }
      } else {
        cell += character;
      }
      continue;
    }

    if (character === '"') {
      quoted = true;
    } else if (character === delimiter) {
      row.push(cell);
      cell = "";
    } else if (character === "\n") {
      row.push(cell.replace(/\r$/, ""));
      if (row.some((value) => value.trim() !== "")) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += character;
    }
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell.replace(/\r$/, ""));
    if (row.some((value) => value.trim() !== "")) rows.push(row);
  }

  if (rows.length === 0) throw new Error("O arquivo está vazio.");
  const headers = rows.shift().map((header) => header.replace(/^\uFEFF/, "").trim());
  return {
    headers,
    records: rows.map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index]?.trim() ?? ""]))),
  };
}

function buildImportAnalysis(records) {
  const existingKeys = new Set(database.students.map((student) =>
    `${normalizeRegistration(student.registration)}|${student.processYear}|${student.processSemester}`
  ));
  const fileKeys = new Set();
  const validRows = [];
  const invalidRows = [];
  const duplicateRows = [];
  const traineeRows = [];
  const courseGroups = new Map();

  records.forEach((record, index) => {
    const registration = normalizeRegistration(record.NR_INSCRICAO);
    const name = record.NOME.trim();
    const publicSchoolValue = normalizeText(record.ESCOLARIDADE);
    const city = record.CIDADE.trim();
    const sex = normalizeText(record.SEXO);
    const courseCode = normalizeCode(record.COD_CURSO);
    const courseName = record.HABILITACAO.trim();
    const period = normalizePeriod(record.PERIODO);
    const classificationText = record.CLASSIFICACAO.trim();
    const classification = classificationText === "" ? null : Number(classificationText);

    if (normalizeText(courseName) === "TREINEIRO") {
      traineeRows.push({ line: index + 2 });
      return;
    }

    const publicSchoolIsValid = publicSchoolValue === "SIM" || publicSchoolValue === "NAO";
    const classificationIsValid = classification === null || Number.isInteger(classification);
    const requiredValuesExist = registration && name && city && sex && courseCode && courseName && period;

    if (!requiredValuesExist || !publicSchoolIsValid || !classificationIsValid) {
      invalidRows.push({ line: index + 2 });
      return;
    }

    const uniqueKey = `${registration}|${importState.processYear}|${importState.processSemester}`;
    if (existingKeys.has(uniqueKey) || fileKeys.has(uniqueKey)) {
      duplicateRows.push({ line: index + 2 });
      return;
    }
    fileKeys.add(uniqueKey);

    const prepared = {
      registration,
      name,
      publicSchool: publicSchoolValue === "SIM",
      city,
      sex,
      courseCode,
      courseName,
      classification,
      period,
    };
    validRows.push(prepared);

    if (!courseGroups.has(courseCode)) {
      courseGroups.set(courseCode, { code: courseCode, name: courseName, period, count: 0 });
    }
    courseGroups.get(courseCode).count += 1;
  });

  return {
    totalRows: records.length,
    validRows,
    invalidRows,
    duplicateRows,
    traineeRows,
    courseGroups: [...courseGroups.values()].sort((left, right) => left.name.localeCompare(right.name, "pt-BR")),
  };
}

function suggestCourse(group) {
  const codeMatch = database.courses.find((course) => course.codigoCsv && normalizeCode(course.codigoCsv) === group.code);
  if (codeMatch) return { courseId: codeMatch.id, matchType: "code" };

  const nameMatch = database.courses.find((course) => normalizeCourseName(course.name) === normalizeCourseName(group.name));
  if (nameMatch) return { courseId: nameMatch.id, matchType: "name" };
  return { courseId: "", matchType: "none" };
}

async function analyzeSelectedFile(event) {
  event.preventDefault();
  if (!importState.file || importState.loading) return;

  importState.processYear = Number(elements.importContent.querySelector("#processYearInput").value);
  importState.processSemester = Number(elements.importContent.querySelector("#processSemesterInput").value);
  importState.loading = true;
  importState.error = "";
  renderImportUpload();

  try {
    const arrayBuffer = await importState.file.arrayBuffer();
    const decoded = decodeCsv(arrayBuffer);
    const parsed = parseCsv(decoded);
    const missingHeaders = REQUIRED_HEADERS.filter((header) => !parsed.headers.includes(header));
    if (missingHeaders.length > 0) {
      throw new Error(`Colunas obrigatórias ausentes: ${missingHeaders.join(", ")}.`);
    }

    importState.analysis = buildImportAnalysis(parsed.records);
    importState.mappings = Object.fromEntries(importState.analysis.courseGroups.map((group) => {
      const suggestion = suggestCourse(group);
      return [group.code, suggestion];
    }));
    importState.step = 2;
  } catch (error) {
    importState.error = error instanceof Error ? error.message : "O arquivo não pôde ser lido.";
  } finally {
    importState.loading = false;
    renderImportStep();
  }
}

function mappingLabel(mapping) {
  if (!mapping?.courseId) return '<span class="mapping-state required">Associação necessária</span>';
  if (mapping.matchType === "code") return '<span class="mapping-state recognized">Reconhecido pelo código</span>';
  if (mapping.matchType === "name") return '<span class="mapping-state suggested">Sugestão pelo nome</span>';
  return '<span class="mapping-state selected">Associado pelo administrador</span>';
}

function allMappingsResolved() {
  const groups = importState.analysis?.courseGroups ?? [];
  return (importState.analysis?.validRows.length ?? 0) > 0 && groups.every((group) => importState.mappings[group.code]?.courseId);
}

function renderImportMappings() {
  const analysis = importState.analysis;
  const courseOptions = [...database.courses]
    .sort((left, right) => left.name.localeCompare(right.name, "pt-BR"))
    .map((course) => `<option value="${escapeHtml(course.id)}">${escapeHtml(course.name)}</option>`)
    .join("");

  elements.importContent.innerHTML = `
    ${importStepsMarkup()}
    <div class="analysis-content">
      <div class="analysis-summary">
        <article><strong>${analysis.validRows.length.toLocaleString("pt-BR")}</strong><span>prontos para importar</span></article>
        <article><strong>${analysis.courseGroups.length}</strong><span>cursos encontrados</span></article>
        <article><strong>${analysis.duplicateRows.length}</strong><span>duplicados</span></article>
        <article><strong>${analysis.traineeRows.length + analysis.invalidRows.length}</strong><span>ignorados ou inválidos</span></article>
      </div>

      <div class="section-heading">
        <div>
          <h3>Associe os cursos encontrados</h3>
          <p>Confira as sugestões antes de confirmar. Nenhum curso será criado automaticamente.</p>
        </div>
        <span class="association-counter" id="associationCounter"></span>
      </div>

      ${analysis.courseGroups.length ? `
        <div class="mapping-list">
          ${analysis.courseGroups.map((group) => {
            const mapping = importState.mappings[group.code];
            return `
              <div class="mapping-row" data-mapping-row="${escapeHtml(group.code)}">
                <div class="source-course">
                  <div><span class="code-pill">${escapeHtml(group.code)}</span>${mappingLabel(mapping)}</div>
                  <strong>${escapeHtml(group.name)}</strong>
                  <small>${group.count} candidato${group.count === 1 ? "" : "s"} · ${escapeHtml(formatPeriod(group.period))}</small>
                </div>
                <div class="mapping-arrow" aria-hidden="true">→</div>
                <label class="form-field compact">
                  <span>Curso no sistema</span>
                  <select data-course-mapping="${escapeHtml(group.code)}">
                    <option value="">Selecione um curso</option>
                    ${courseOptions}
                  </select>
                </label>
              </div>
            `;
          }).join("")}
        </div>
      ` : '<div class="alert alert-warning"><strong>Nenhum candidato válido encontrado.</strong><span>Volte e escolha outro arquivo.</span></div>'}

      <footer class="modal-footer sticky-footer">
        <button class="button button-quiet" type="button" data-back-import>Voltar</button>
        <button class="button button-primary" type="button" data-confirm-import ${allMappingsResolved() ? "" : "disabled"}>Confirmar importação</button>
      </footer>
    </div>
  `;

  elements.importContent.querySelectorAll("[data-course-mapping]").forEach((select) => {
    const code = select.dataset.courseMapping;
    select.value = importState.mappings[code]?.courseId ?? "";
    select.addEventListener("change", () => {
      importState.mappings[code] = {
        courseId: select.value,
        matchType: select.value ? "manual" : "none",
      };
      refreshMappingState();
    });
  });

  elements.importContent.querySelector("[data-back-import]").addEventListener("click", () => {
    importState.step = 1;
    importState.error = "";
    renderImportStep();
  });
  elements.importContent.querySelector("[data-confirm-import]").addEventListener("click", confirmImport);
  refreshMappingState();
}

function refreshMappingState() {
  const groups = importState.analysis.courseGroups;
  let resolved = 0;
  groups.forEach((group) => {
    const mapping = importState.mappings[group.code];
    if (mapping?.courseId) resolved += 1;
    const row = elements.importContent.querySelector(`[data-mapping-row="${CSS.escape(group.code)}"]`);
    const oldState = row?.querySelector(".mapping-state");
    if (oldState) oldState.outerHTML = mappingLabel(mapping);
  });
  const counter = elements.importContent.querySelector("#associationCounter");
  if (counter) counter.textContent = `${resolved} de ${groups.length} associados`;
  const confirmButton = elements.importContent.querySelector("[data-confirm-import]");
  if (confirmButton) confirmButton.disabled = !allMappingsResolved();
}

function confirmImport() {
  if (!allMappingsResolved()) return;
  const analysis = importState.analysis;

  try {
    const nextCourses = database.courses.map((course) => ({ ...course }));
    analysis.courseGroups.forEach((group) => {
      const selectedId = importState.mappings[group.code].courseId;
      const selectedCourse = nextCourses.find((course) => course.id === selectedId);
      if (!selectedCourse) throw new Error(`O curso ${group.name} não está mais disponível.`);
      selectedCourse.codigoCsv = group.code;
    });

    const nextStudents = [...database.students];
    analysis.validRows.forEach((row) => {
      const courseId = importState.mappings[row.courseCode].courseId;
      nextStudents.push({
        id: createId(),
        registration: row.registration,
        name: row.name,
        publicSchool: row.publicSchool,
        city: row.city,
        sex: row.sex,
        status: "CANDIDATO",
        processYear: importState.processYear,
        processSemester: importState.processSemester,
        enrollment: {
          courseId,
          classification: row.classification,
          status: "PENDENTE",
          period: row.period,
        },
      });
    });

    database = { courses: nextCourses, students: nextStudents };
    saveDatabase();
    importState.result = {
      imported: analysis.validRows.length,
      duplicates: analysis.duplicateRows.length,
      trainees: analysis.traineeRows.length,
      invalid: analysis.invalidRows.length,
    };
    importState.step = 3;
    renderCourseFilter();
    renderStudents();
    renderImportStep();
  } catch (error) {
    toast(error instanceof Error ? error.message : "A importação não pôde ser concluída.", "danger");
  }
}

function renderImportResult() {
  const result = importState.result;
  elements.importContent.innerHTML = `
    ${importStepsMarkup()}
    <div class="success-result">
      <div class="success-mark" aria-hidden="true">✓</div>
      <h3>Importação concluída</h3>
      <p>Os candidatos foram salvos neste navegador e já podem ser encontrados na listagem.</p>
      <div class="result-grid">
        <div><strong>${result.imported.toLocaleString("pt-BR")}</strong><span>importados</span></div>
        <div><strong>${result.duplicates.toLocaleString("pt-BR")}</strong><span>duplicados</span></div>
        <div><strong>${result.trainees.toLocaleString("pt-BR")}</strong><span>treineiros ignorados</span></div>
        <div><strong>${result.invalid.toLocaleString("pt-BR")}</strong><span>inválidos</span></div>
      </div>
      <footer class="modal-footer result-actions">
        <button class="button button-quiet" type="button" data-finish-import>Fechar</button>
        <button class="button button-primary" type="button" data-view-candidates>Ver candidatos importados</button>
      </footer>
    </div>
  `;

  elements.importContent.querySelector("[data-finish-import]").addEventListener("click", closeImportModal);
  elements.importContent.querySelector("[data-view-candidates]").addEventListener("click", () => {
    state.status = "CANDIDATO";
    state.course = "";
    state.search = "";
    state.page = 1;
    elements.status.value = "CANDIDATO";
    elements.course.value = "";
    elements.search.value = "";
    renderStudents();
    closeImportModal();
    toast(`${result.imported.toLocaleString("pt-BR")} candidatos importados com sucesso.`);
  });
}

function openStudentMenu(button, studentId) {
  const student = getStudent(studentId);
  if (!student) return;
  closeStudentMenu();
  state.openMenuStudentId = studentId;
  button.setAttribute("aria-expanded", "true");
  const rect = button.getBoundingClientRect();
  const roomBelow = window.innerHeight - rect.bottom;
  const openAbove = roomBelow < 180;

  const workflowAction = student.status === "CANDIDATO"
    ? '<button role="menuitem" data-menu-action="activate"><span>✓</span>Confirmar matrícula</button>'
    : student.status === "ATIVO"
      ? '<button role="menuitem" class="danger-action" data-menu-action="archive"><span>▣</span>Arquivar aluno</button>'
      : '<button role="menuitem" data-menu-action="reactivate"><span>↻</span>Reativar aluno</button>';

  elements.actionMenu.innerHTML = `
    <button role="menuitem" data-menu-action="details"><span>◎</span>Ver detalhes</button>
    ${workflowAction}
  `;
  elements.actionMenu.style.top = `${openAbove ? rect.top - 8 : rect.bottom + 8}px`;
  elements.actionMenu.style.right = `${window.innerWidth - rect.right}px`;
  elements.actionMenu.style.transform = openAbove ? "translateY(-100%)" : "none";
  elements.actionMenu.classList.remove("hidden");
}

function closeStudentMenu() {
  if (state.openMenuStudentId) {
    document.querySelector(`[data-student-menu="${CSS.escape(state.openMenuStudentId)}"]`)?.setAttribute("aria-expanded", "false");
  }
  state.openMenuStudentId = null;
  elements.actionMenu.classList.add("hidden");
}

function updateStudentWorkflow(studentId, action) {
  const student = getStudent(studentId);
  if (!student) return;

  if (action === "activate") {
    student.status = "ATIVO";
    student.enrollment.status = "ATIVA";
    toast(`${student.name} foi ativado e a matrícula foi confirmada.`);
  } else if (action === "archive") {
    student.status = "ARQUIVADO";
    toast(`${student.name} foi arquivado.`);
  } else if (action === "reactivate") {
    student.status = "ATIVO";
    student.enrollment.status = "ATIVA";
    toast(`${student.name} foi reativado.`);
  }

  saveDatabase();
  renderStudents();
  if (state.detailsStudentId === studentId && !elements.detailsModal.classList.contains("hidden")) {
    renderStudentDetails(studentId);
  }
}

function renderStudentDetails(studentId) {
  const student = getStudent(studentId);
  if (!student) return;
  const course = getCourse(student.enrollment.courseId);
  const nextAction = student.status === "CANDIDATO"
    ? '<button class="button button-primary" data-detail-workflow="activate">Simular confirmação em Docs</button>'
    : student.status === "ATIVO"
      ? '<button class="button button-danger-outline" data-detail-workflow="archive">Arquivar aluno</button>'
      : '<button class="button button-primary" data-detail-workflow="reactivate">Reativar aluno</button>';

  elements.detailsContent.innerHTML = `
    <div class="details-content">
      <section class="details-hero">
        <div>
          <h3>${escapeHtml(student.name)}</h3>
          <p>Inscrição ${escapeHtml(student.registration)} · ${student.processSemester}º semestre de ${student.processYear}</p>
          <div class="details-badges">${statusBadge(student.status)} ${statusBadge(student.enrollment.status)}</div>
        </div>
      </section>

      <section>
        <h4 class="details-title">Dados importados</h4>
        <div class="details-grid">
          <div><span>Escolaridade pública</span><strong>${student.publicSchool ? "Sim" : "Não"}</strong></div>
          <div><span>Cidade</span><strong>${escapeHtml(student.city)}</strong></div>
          <div><span>Sexo</span><strong>${escapeHtml(student.sex.charAt(0) + student.sex.slice(1).toLocaleLowerCase("pt-BR"))}</strong></div>
          <div><span>Classificação</span><strong>${student.enrollment.classification ? `${student.enrollment.classification}º` : "Não classificado"}</strong></div>
        </div>
      </section>

      <section>
        <h4 class="details-title">Matrícula</h4>
        <div class="enrollment-card">
          <div>
            <span>Curso</span>
            <strong>${escapeHtml(course?.name ?? "Curso não encontrado")}</strong>
          </div>
          <div><span>Período</span><strong>${escapeHtml(formatPeriod(student.enrollment.period))}</strong></div>
          <div><span>Situação</span>${statusBadge(student.enrollment.status)}</div>
        </div>
      </section>

      <footer class="modal-footer">
        <button class="button button-quiet" data-close-details-footer>Fechar</button>
        ${nextAction}
      </footer>
    </div>
  `;

  elements.detailsContent.querySelector("[data-close-details-footer]").addEventListener("click", closeDetailsModal);
  elements.detailsContent.querySelector("[data-detail-workflow]").addEventListener("click", (event) => {
    updateStudentWorkflow(studentId, event.currentTarget.dataset.detailWorkflow);
  });
}

function openDetailsModal(studentId) {
  state.detailsStudentId = studentId;
  renderStudentDetails(studentId);
  openModal(elements.detailsModal);
  setTimeout(() => elements.detailsModal.querySelector("[data-close-details]")?.focus(), 0);
}

function closeDetailsModal() {
  state.detailsStudentId = null;
  closeModal(elements.detailsModal, "#searchInput");
}

elements.sidebarToggle.addEventListener("click", () => {
  elements.sidebar.classList.toggle("collapsed");
  elements.sidebarToggle.setAttribute("aria-label", elements.sidebar.classList.contains("collapsed") ? "Expandir menu" : "Recolher menu");
});

elements.search.addEventListener("input", (event) => {
  state.search = event.target.value;
  state.page = 1;
  renderStudents();
});

elements.course.addEventListener("change", (event) => {
  state.course = event.target.value;
  state.page = 1;
  renderStudents();
});

elements.status.addEventListener("change", (event) => {
  state.status = event.target.value;
  state.page = 1;
  renderStudents();
});

elements.pagination.addEventListener("click", (event) => {
  const button = event.target.closest("[data-page]");
  if (!button || button.disabled) return;
  state.page = Number(button.dataset.page);
  renderStudents();
});

elements.tableBody.addEventListener("click", (event) => {
  const button = event.target.closest("[data-student-menu]");
  if (!button) return;
  const studentId = button.dataset.studentMenu;
  if (state.openMenuStudentId === studentId) closeStudentMenu();
  else openStudentMenu(button, studentId);
});

elements.actionMenu.addEventListener("click", (event) => {
  const actionButton = event.target.closest("[data-menu-action]");
  if (!actionButton || !state.openMenuStudentId) return;
  const studentId = state.openMenuStudentId;
  const action = actionButton.dataset.menuAction;
  closeStudentMenu();
  if (action === "details") openDetailsModal(studentId);
  else updateStudentWorkflow(studentId, action);
});

document.querySelector("#openImportButton").addEventListener("click", openImportModal);
document.querySelector("[data-close-import]").addEventListener("click", closeImportModal);
document.querySelector("[data-close-details]").addEventListener("click", closeDetailsModal);

elements.importModal.addEventListener("click", (event) => {
  if (event.target === elements.importModal) closeImportModal();
});
elements.detailsModal.addEventListener("click", (event) => {
  if (event.target === elements.detailsModal) closeDetailsModal();
});

document.addEventListener("click", (event) => {
  if (!elements.actionMenu.contains(event.target) && !event.target.closest("[data-student-menu]")) closeStudentMenu();
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (!elements.detailsModal.classList.contains("hidden")) closeDetailsModal();
  else if (!elements.importModal.classList.contains("hidden")) closeImportModal();
  else closeStudentMenu();
});

window.addEventListener("resize", closeStudentMenu);
window.addEventListener("scroll", closeStudentMenu, true);

document.querySelector("#resetDataButton").addEventListener("click", () => {
  const confirmed = window.confirm("Restaurar os dados fictícios e apagar as importações salvas neste navegador?");
  if (!confirmed) return;
  database = createSeedDatabase();
  saveDatabase();
  state.search = "";
  state.course = "";
  state.status = "ATIVO";
  state.page = 1;
  elements.search.value = "";
  elements.status.value = "ATIVO";
  renderCourseFilter();
  renderStudents();
  toast("Dados de demonstração restaurados.");
});

renderCourseFilter();
elements.status.value = state.status;
renderStudents();
