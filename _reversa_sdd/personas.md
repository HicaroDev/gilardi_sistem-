# Personas — Ponto

> Selo 🟡 PLANEJADO. Gerado por /reversa-new (modo expresso).

## Persona 1 — Funcionário

**Contexto:** trabalha em horário fixo ou home office, precisa registrar entrada, saída pro almoço, volta do almoço e saída final todos os dias úteis.
**Nível técnico:** baixo a médio — precisa de interface extremamente simples, idealmente um botão por evento.
**Objetivo final:** bater o ponto em segundos, sem fricção, de qualquer lugar.

**Jornada:**
1. Abre o link do sistema (celular ou computador).
2. Faz login (sessão já deve durar o dia todo, sem pedir login de novo a cada clique).
3. Vê o próximo evento esperado (ex: "Bater entrada").
4. Toca o botão — sistema registra hora e data automaticamente.
5. Ao longo do dia, repete para almoço (saída/volta) e saída final.
6. Pode ver seu próprio histórico de dias batidos (opcional, mas útil pra conferência).

## Persona 2 — Gestor

**Contexto:** Hicaro, responsável por acompanhar quem bateu ponto e quando, começando por um funcionário e expandindo depois pra todos.
**Nível técnico:** alto (já lida com Supabase, Vercel, múltiplos projetos).
**Objetivo final:** ter visão rápida e confiável de quem trabalhou, quando, e detectar ausência ou atraso sem precisar abrir planilha.

**Jornada:**
1. Abre o painel do gestor.
2. Vê lista de funcionários com status do dia (bateu entrada? já saiu pro almoço? etc.).
3. Pode abrir o histórico de um funcionário específico (dias trabalhados, horários).
4. 🟡 [INDEFINIDO, validar com usuário] — se há ação de aprovação/edição manual de um registro incorreto pelo gestor no MVP, ou isso fica pra depois.
