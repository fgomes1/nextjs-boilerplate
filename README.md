# 🧠 Gerador de Planos de Aula com IA

Este projeto implementa um sistema web que gera **Planos de Aula estruturados e personalizados** utilizando a **Gemini API do Google**, com **persistência e autenticação gerenciadas pelo Supabase**.

---

## ⚙️ Stack Utilizada

- **Frontend:** React / Next.js (com Tailwind CSS)  
- **Backend:** Supabase Edge Function (Deno) para integração IA e DB  
- **Banco de Dados & Auth:** PostgreSQL via Supabase  
- **IA:** Gemini 2.5 Flash  

---

## 🚀 1. Primeiros Passos

O projeto utiliza **Next.js**. Para iniciar o desenvolvimento:

### 1.1. Instalação e Execução

Primeiro, instale as dependências e inicie o servidor de desenvolvimento:

```bash
npm install 
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador.  
A aplicação iniciará na **tela de Login**.

---

### 1.2. Configuração de Variáveis de Ambiente

As chaves de API e Service Role (para o Backend) devem ser configuradas em **dois locais**:

#### 🧩 A. Frontend (.env.local)

Necessário para inicializar o cliente Supabase no navegador (público):

```bash
# Variáveis de Ambiente Públicas
NEXT_PUBLIC_SUPABASE_URL="[SUA_URL_DO_PROJETO_AQUI]"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[SUA_CHAVE_ANON_PÚBLICA_AQUI]"
```

#### 🔒 B. Backend (Supabase Secrets)

As chaves secretas para a Edge Function devem ser definidas como **Secrets** no painel do Supabase  
(*Edge Functions > Secrets*):

| Secret Name | Propósito |
|--------------|------------|
| **SUPABASE_URL** | URL do seu projeto. |
| **SUPABASE_SERVICE_KEY** | Chave de Service Role (acesso Admin ao DB para inserção). |
| **GEMINI_API_KEY** | Chave de acesso ao modelo Google Gemini. |

---

## 🧱 2. Modelagem de Dados (Tarefa 2)

### 2.1. Diagrama de Classes

A estrutura utiliza um relacionamento **Um-para-Muitos (1:N)**,  
onde cada **Plano de Aula** é atrelado a um único `user_id` da tabela de autenticação (`auth.users`).

\`\`\`mermaid
classDiagram
    direction LR

    class auth_users {
        +UUID id
        TEXT email
        TIMESTAMP created_at
        --
        +PK
    }

    class planos_de_aula {
        +UUID id
        +UUID user_id
        TEXT titulo
        JSONB conteudo_completo
        TIMESTAMP data_geracao
        --
        +PK
        +FK(user_id)
    }

    auth_users "1" -- "*" planos_de_aula : possui
\`\`\`

---

### 2.2. Scripts SQL de Criação e RLS

Este script cria a tabela e aplica as políticas de segurança (RLS), garantindo que cada usuário só possa gerenciar seus próprios planos.

```sql
-- 1. CRIAÇÃO DA TABELA planos_de_aula
CREATE TABLE public.planos_de_aula (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- CHAVE ESTRANGEIRA: Atrelamento ao usuário
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL, 
  titulo text NOT NULL,
  -- Tipo JSONB armazena o Plano de Aula completo e estruturado da IA
  conteudo_completo jsonb NOT NULL,
  inputs_originais jsonb,
  data_geracao timestamp with time zone DEFAULT now() NOT NULL
);

-- 2. HABILITA RLS (Row Level Security)
ALTER TABLE public.planos_de_aula ENABLE ROW LEVEL SECURITY;

-- 3. POLÍTICA DE INSERÇÃO/SELEÇÃO (CRUD básico)
CREATE POLICY manage_own_plans ON public.planos_de_aula
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
```

---

## 💡 3. Decisões Técnicas e Desafios (Tarefa 3)

### 3.1. Escolha do Modelo

O modelo **Gemini 2.5 Flash** foi escolhido por ser rápido, eficiente em custos (plano gratuito) e excelente para tarefas de geração de texto estruturado em Português.

---

### 3.2. Integração IA Segura (Edge Function)

A principal decisão de arquitetura foi **isolar a lógica de geração de IA** em uma **Edge Function do Supabase** (`/gerar-plano`).  
Isso é fundamental para **proteger a chave secreta do Gemini**.

---

### 3.3. Desafios Encontrados e Soluções

| Desafio | Causa | Solução Implementada |
|----------|--------|----------------------|
| **Incompatibilidade de Tipagem** | Conflitos entre o React JavaScript e a tipagem estrita do TypeScript (Next.js) em parâmetros de evento (e) e variáveis de estado (err, userId). | Correção dos componentes frontend com tipagem explícita (`e: React.FormEvent<HTMLFormElement>`, `useState<string | null>`). |
| **Error: supabaseKey is required** | Variáveis de ambiente (`SUPABASE_URL`, `SUPABASE_SERVICE_KEY`) ausentes ou incorretas. | Verificação explícita na Edge Function (`Deno.env.get()`) e inicialização condicional do `supabaseAdmin`. |
| **Requisição 401 Unauthorized** | O Frontend não enviava o token JWT de sessão na requisição `fetch` para a Edge Function. | O código do `Gerador.jsx` foi corrigido para obter o `userToken` e incluí-lo no header `Authorization: Bearer [TOKEN]`. |
| **Geração de JSON Consistente** | A IA quebrava o formato do JSON se o prompt fosse muito genérico. | Uso do parâmetro `responseSchema` na chamada da Gemini API para forçar o retorno do JSON no formato exato esperado pelo Frontend. |
