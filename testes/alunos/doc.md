enum StatusAluno {
  CANDIDATO
  ATIVO
  ARQUIVADO
}

enum StatusMatricula {
  PENDENTE
  ATIVA
}

enum Periodo {
  manha
  tarde
  noite
  integral
  online
}

model Curso {
  idCurso   Int     @id @default(autoincrement())
  nomeCurso String  @db.VarChar(100)
  codigoCsv String? @unique @db.VarChar(30)
  arquivado Boolean @default(false)

  periodos   PeriodoCurso[]
  cursosAluno CursoAluno[]
}