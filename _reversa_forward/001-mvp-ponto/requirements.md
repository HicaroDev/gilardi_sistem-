# Requirements — 001-mvp-ponto

> Selo 🟡 PLANEJADO.

Baseado em `_reversa_sdd/prd.md` e `_reversa_sdd/sdd/ponto-app.md`.

## Requisitos funcionais
1. Usuário faz login (e-mail/senha via Supabase Auth) e é redirecionado conforme `role`.
2. Funcionário vê o próximo evento esperado do dia e registra com um clique (hora vem do servidor, nunca digitada).
3. Funcionário vê histórico dos próprios dias/eventos.
4. Funcionário pode registrar hora extra (início/fim) e justificativa de falta.
5. Gestor vê lista de funcionários com status do dia atual.
6. Gestor abre histórico detalhado de um funcionário específico.

## Requisitos não-funcionais
- RLS no Supabase garantindo isolamento de dados por usuário (ver `sdd/ponto-app.md`).
- Interface simples o bastante pra bater ponto em poucos segundos, em celular ou desktop.
- Deploy em Vercel, conectado ao Supabase.

## Fora de escopo
Ver `_reversa_sdd/prd.md`, seção "Escopo (out)".
