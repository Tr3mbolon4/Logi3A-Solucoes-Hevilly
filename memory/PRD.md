# Logi3A Soluções - PRD (Product Requirements Document)

## Problema Original
Sistema educacional de simulação de leitura de QR Code e código de barras para aulas de logística, centros de distribuição, estoque, expedição e identificação de materiais.

## Arquitetura
- **Frontend**: React 19 + Tailwind CSS + Shadcn UI
- **Backend**: FastAPI + Motor (MongoDB async)
- **Database**: MongoDB
- **Scanner Libraries**: html5-qrcode, qrcode.react

## User Personas
1. **Alunos**: Aprender sobre leitura óptica em logística
2. **Professores**: Gerenciar materiais e acompanhar atividades

## Core Requirements
- [x] Leitura de QR Code via câmera
- [x] Leitura de Código de Barras via câmera
- [x] Histórico de leituras com filtros e busca
- [x] Exportação PDF e CSV
- [x] Dashboard com estatísticas e gráficos
- [x] CRUD de materiais (modo professor)
- [x] Gerador de QR Codes para impressão
- [x] Modo atividade prática com pontuação
- [x] Feedback visual e sonoro
- [x] Dados salvos em localStorage
- [x] 5 materiais de exemplo para demonstração
- [x] Tema azul (#0052CC) e preto (#0F172A)
- [x] Interface responsiva (mobile, tablet, desktop)
- [x] Versão standalone HTML única

## What's Been Implemented (Jan 2026)
1. **Backend APIs**:
   - GET/POST /api/materiais (CRUD completo)
   - GET/POST/DELETE /api/leituras
   - GET /api/estatisticas
   - POST /api/seed (dados demo)

2. **Frontend Pages**:
   - Home (menu principal)
   - Scanner QR Code
   - Scanner Código de Barras
   - Histórico (tabela com filtros)
   - Dashboard (gráficos recharts)
   - Materiais (CRUD com modal)
   - Gerador QR (com impressão)
   - Atividade Prática (pontuação)
   - Configurações

3. **Extra Features**:
   - Dark mode toggle
   - Ranking de pontuações
   - Arquivo standalone.html

## Prioritized Backlog
### P0 (MVP Done)
- [x] Todas funcionalidades core implementadas

### P1 (Melhorias)
- [ ] Relatórios por aluno/turma detalhados
- [ ] Integração com impressora de etiquetas
- [ ] QR Codes com logo personalizado

### P2 (Nice to Have)
- [ ] PWA (Progressive Web App)
- [ ] Modo offline completo
- [ ] Exportação de relatórios em Excel

## Next Tasks
1. Testar leitura de QR/Barcode em dispositivos móveis
2. Adicionar mais operações logísticas customizáveis
3. Implementar relatórios detalhados por turma

## URLs
- Frontend: https://logi3a-simulator.preview.emergentagent.com
- API: https://logi3a-simulator.preview.emergentagent.com/api/
- Standalone: /standalone.html
