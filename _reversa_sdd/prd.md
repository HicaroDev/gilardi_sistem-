# PRD — Ponto

> Selo 🟡 PLANEJADO. Gerado por /reversa-new (modo expresso).

## Visão geral
Sistema de ponto eletrônico online, substituindo a planilha de Excel atual. Suporta home office (acesso remoto via link), com visão de gestor e visão de funcionário.

## Escopo (in) — MVP
- Login simples (e-mail/senha, via Supabase Auth).
- Tela do funcionário: botão único pro próximo evento esperado do dia (entrada → saída almoço → volta almoço → saída final), com data/hora registrada automaticamente pelo servidor (nunca digitada).
- Histórico do próprio funcionário (lista de dias e horários batidos).
- Tela do gestor: lista de funcionários com status do dia atual (quais eventos já bateram).
- Histórico por funcionário, visível pelo gestor.
- Campo de hora extra (registro simples: funcionário marca que ficou além do expediente, com horário).
- Campo de justificativa de falta (texto livre, funcionário ou gestor preenche quando falta um dia).
- Deploy: Vercel (frontend/API) + Supabase (banco + auth).

## Escopo (out) — explicitamente fora do MVP
- Folha de pagamento / cálculo de salário integrado.
- Integração com Google Agenda (fica para uma fase futura — ver Seed2.0 de referência de como o cofre trata ideias adiadas).
- Aprovação/edição manual de registros pelo gestor (avaliar depois do MVP rodando).
- Multi-empresa / múltiplos gestores com permissões diferentes (hoje só 1 gestor).

## Restrições de stack
Next.js (ou stack equivalente React/Vercel-friendly) + Supabase (Postgres + Auth) + deploy Vercel. Reaproveita padrões já usados no VertexDRE (mesmo ecossistema).

## Prazo / orçamento
🟡 [INDEFINIDO, validar com usuário] — não informado.

## Compliance
Dado de ponto é dado pessoal e trabalhista — LGPD se aplica. MVP deve, no mínimo: armazenar só o necessário (sem dado sensível além do estritamente ligado ao ponto), e ter controle de acesso (funcionário só vê o próprio histórico, gestor vê todos). Uma análise formal de LGPD fica para uma iteração posterior — marcado 🟡 pra revisão.

## Dependências externas
Nenhuma no MVP. Google Agenda fica fora por agora (ver Escopo out).

## Personas
Ver `personas.md` — Funcionário e Gestor.

## Métrica de sucesso
100% dos registros de ponto passam a vir do sistema (substituição total da planilha de Excel).
