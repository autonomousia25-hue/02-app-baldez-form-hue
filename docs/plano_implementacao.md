# Plano de Implementação: Formulário Baldez V2 🏛️

**Status Atual:** 🟢 Implantado em Produção (Vercel)
**Link:** [https://02-app-baldez-form-hue.vercel.app/](https://02-app-baldez-form-hue.vercel.app/)

Este plano descreve a criação de um novo repositório para um formulário de coleta de dados, permitindo que o cliente (Baldez Advogados) envie informações estruturadas para atualizar o site principal.

## 📋 Lista de Tarefas (Checklist)

### Fase 1: Infraestrutura (CONCLUÍDO ✅)
- [x] Criar repositório `02-app-baldez-form-hue` no GitHub.
- [x] Provisionar tabela `conteudo_site_solicitacoes` no Supabase.
- [x] Configurar Row Level Security (RLS) para inserções públicas.

### Fase 2: Desenvolvimento V1 (CONCLUÍDO ✅)
- [x] UI Premium com Glassmorphism e paleta Baldez (#0B1A30, #C5A059).
- [x] Integração com Supabase via variáveis de ambiente.
- [x] Botão flutuante de WhatsApp e Voltar ao Topo.

### Fase 3: Refinamento V2 (CONCLUÍDO ✅)
- [x] **Múltiplos Especialistas:** Lógica de adição em fila antes do envio final.
- [x] **Máscara de Telefone:** Formatação dinâmica `(00) 00000-0000`.
- [x] **Heurísticas de Nielsen:** Implementação de dicas visuais (H2, H4, H6, H10).
- [x] **Resiliência:** Tratamento de erros para chaves ausentes.

### Fase 4: Sincronização Local (PENDENTE 🟡)
- [ ] Restaurar acesso ao HD externo do usuário.
- [ ] Sincronizar código local com as melhorias do GitHub (`git pull`).
