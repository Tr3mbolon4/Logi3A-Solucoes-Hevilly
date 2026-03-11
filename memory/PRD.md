# Logi3A Soluções - PRD (Product Requirements Document)

## Problema Original
Sistema educacional de simulação de leitura de QR Code e código de barras para aulas de logística, com sistema de login, pontuação e acompanhamento pedagógico.

## Arquitetura
- **Frontend**: React 19 + Tailwind CSS + Shadcn UI + Recharts
- **Backend**: FastAPI + Motor (MongoDB async)
- **Database**: MongoDB
- **Scanner**: html5-qrcode (câmera traseira prioritária)
- **QR Generation**: qrcode.react
- **PDF/CSV**: jspdf + jspdf-autotable + custom CSV export

## User Personas
1. **Alunos**: Aprender sobre leitura óptica e logística
2. **Professores**: Gerenciar materiais e acompanhar desempenho

## Core Requirements - Implementado

### Sistema de Login
- [x] Login com nome, turma e senha
- [x] Perfis: Aluno e Professor
- [x] Modo demonstração (Aluno Demo, Professor Demo)

### Funcionalidades do Aluno
- [x] Leitura de QR Code (câmera traseira)
- [x] Leitura de Código de Barras
- [x] Gerador de QR Code Logístico (materiais)
- [x] Gerador de QR Code por Conteúdo (texto, mensagem, instrução, link, imagem)
- [x] Painel com pontuação, acertos, erros, tempo
- [x] Feedback pedagógico personalizado
- [x] Classificação (Excelente/Bom/Regular/Precisa melhorar)

### Funcionalidades do Professor
- [x] Dashboard com estatísticas
- [x] Ranking de alunos
- [x] Filtro por turma
- [x] Gráficos de operações e acertos/erros
- [x] Exportação PDF e CSV
- [x] Gerenciamento de materiais

### Gerador de QR Code por Conteúdo (NOVO - Mar 2026)
- [x] 5 tipos de conteúdo: Texto, Mensagem, Instrução, Link, Imagem
- [x] Upload de imagem com link interno
- [x] Download QR Code como PNG
- [x] Impressão de QR Code
- [x] Copiar conteúdo codificado
- [x] Seção educativa: "Como Funciona o QR Code"
- [x] Seção educativa: "O que você aprende com esta atividade"
- [x] Fluxo visual: Informação → Codificação → QR Code → Leitura → Interpretação

### Páginas Educativas
- [x] "O que o Aluno Aprende" - Conteúdo educacional
- [x] "Como Funciona" - Guia passo a passo

### Sistema de Pontuação
- Leitura correta: +10 pontos
- Operação correta: +15 pontos
- Atividade concluída: +20 pontos
- Tempo até 30s: +10 | 31-60s: +7 | 61-120s: +4 | >120s: +2
- 3 acertos seguidos: +10 bônus
- Erro de operação: -5

### Materiais de Demonstração
- 10 materiais pré-cadastrados (Parafuso, Caixa, Palete, etc.)

## APIs Backend
- POST /api/usuarios/registro - Cadastro
- POST /api/usuarios/login - Login
- GET /api/usuarios - Listar usuários
- GET /api/usuarios/{id} - Detalhes usuário
- POST /api/leituras - Registrar leitura (scan)
- GET /api/leituras - Listar leituras (com filtros)
- DELETE /api/leituras - Limpar leituras
- POST /api/atividades - Registrar atividade (com pontuação)
- GET /api/atividades - Listar atividades
- DELETE /api/atividades - Limpar atividades
- GET /api/materiais - CRUD materiais
- POST /api/materiais - Criar material
- PUT /api/materiais/{id} - Editar material
- DELETE /api/materiais/{id} - Deletar material
- GET /api/estatisticas - Estatísticas gerais
- GET /api/estatisticas/turma/{turma} - Por turma
- GET /api/feedback/{usuario_id} - Feedback pedagógico
- POST /api/seed - Dados demonstração
- POST /api/upload-image - Upload de imagem para QR Code
- GET /api/images/{filename} - Servir imagem

## URLs
- App: https://logi3a-supply-chain.preview.emergentagent.com
- Login: /login
- Painel Aluno: /aluno
- Painel Professor: /professor
- Gerador QR Conteúdo: /gerador-conteudo

## Credenciais Demo
- Professor: "Professor Demo" / senha: "123456"
- Aluno: Cadastrar ou usar botão "Aluno Demo"

## Bugs Corrigidos (Mar 2026)
- [x] Página Histórico crashava (variáveis leituras/fetchLeituras não existiam no contexto)
- [x] Scanner crashava (createLeitura/activityMode não existiam no contexto)

## Next Tasks (P1)
1. Conectar dashboards Professor/Aluno a endpoints reais com gráficos
2. Implementar lógica de desempenho detalhada no backend
3. Modo Atividade Prática funcional com pontuação

## Future Tasks (P2)
1. Impressão de etiquetas com QR Code
2. Relatórios por período
3. PWA para funcionamento offline
4. Áudio feedback em scans
