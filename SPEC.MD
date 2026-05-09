# SPEC.md — E-commerce Mayer

> Documento técnico para guiar o agente de IA (Claude Code / Cursor / similar) no desenvolvimento incremental do e-commerce. Versão 1.0.

---

## 0. Objetivo

Construir e-commerce completo **sobre a base existente** ([801-outlet-brand-site](https://801-outlet-brand-site.vercel.app/)), com checkout via Square Hosted, painel administrativo e dashboard de analytics. Entrega em **3 fases**.

**Critério de sucesso final:** loja em produção, até 300 SKUs ativos, processamento de pagamentos via Square, admin operacional com analytics em tempo real e controle de estoque com alertas de baixa.

---

## 1. Contexto e premissas

| Item | Valor |
|---|---|
| Cliente | Mayer (US, faturamento ~US$ 30–50k/mês) |
| Base existente | `801-outlet-brand-site` (Next.js + Vercel) |
| Idioma do site | Inglês (US) |
| Moeda | USD |
| Mercado | Estados Unidos |
| Volume esperado | ~300 SKUs, tráfego moderado |
| Deploy | Vercel |
| Orçamento | US$ 3.000 (3 fases) |
| Prazo | 8–12 semanas |

---

## 2. ANTES de escrever código — Discovery obrigatório

O agente **DEVE** fazer este checklist antes de qualquer implementação:

- [ ] Listar estrutura de pastas da base existente
- [ ] Identificar versão exata do Next.js (App Router ou Pages)
- [ ] Identificar TypeScript / JavaScript
- [ ] Listar dependências em `package.json`
- [ ] Identificar sistema de estilo (Tailwind? CSS Modules? styled-components?)
- [ ] Identificar componentes UI já existentes e seu padrão (shadcn/ui? Radix? custom?)
- [ ] Identificar se existe ORM/DB conectado
- [ ] Identificar padrão de fetching (RSC? Client-side? SWR/React Query?)
- [ ] Identificar gerenciamento de estado (Zustand? Context? Jotai?)
- [ ] Reportar achados em formato resumido **antes** de propor implementação

**Regra de ouro:** reaproveitar > recriar. Se algo já existe na base e funciona, mantenha.

---

## 3. Stack recomendada (default — confirmar/ajustar com o que já existe)

| Camada | Tecnologia | Justificativa |
|---|---|---|
| Framework | Next.js 14+ (App Router) | Já é a base |
| Linguagem | TypeScript (strict) | Reduz bugs em código gerado por agente |
| UI / CSS | Tailwind + shadcn/ui | Padrão moderno, fácil de manter |
| Database | Postgres via **Supabase** | Free tier generoso, auth incluso, hospedagem nos US |
| Auth (cliente) | Supabase Auth | Vem junto com o DB |
| Auth (admin) | Supabase Auth com role-based access | Mesma stack, sem complexidade extra |
| Imagens | Vercel Blob ou Supabase Storage | Próximo do deploy |
| E-mails | Resend | Melhor DX, free tier 3k e-mails/mês |
| Pagamento | Square Hosted Checkout | Definido em contrato |
| Analytics comportamental (opcional) | PostHog | Free self-hosted ou cloud |
| Validação | Zod | Type-safe schema validation |
| Forms | React Hook Form + Zod | Padrão de mercado |
| Tabelas no admin | TanStack Table | Sorting/filtering robusto |

---

## 4. Estrutura de pastas (App Router)

```
/app
  /(public)              # Loja pública
    /layout.tsx
    /page.tsx            # Home
    /products
      /page.tsx          # Catálogo
      /[slug]/page.tsx   # Página de produto
    /cart/page.tsx
    /checkout
      /page.tsx
      /success/page.tsx
      /cancel/page.tsx
    /account
      /page.tsx          # Dashboard cliente
      /orders/page.tsx
      /orders/[id]/page.tsx
    /(auth)
      /login/page.tsx
      /signup/page.tsx
  /admin                 # Painel administrativo
    /layout.tsx          # Auth guard + sidebar
    /page.tsx            # Dashboard analytics
    /products
      /page.tsx          # Listagem
      /new/page.tsx
      /[id]/page.tsx     # Editar
    /orders
      /page.tsx
      /[id]/page.tsx
    /inventory/page.tsx
    /customers/page.tsx
    /settings/page.tsx
  /api
    /webhooks
      /square/route.ts   # Webhook do Square
    /admin
      /...               # Endpoints internos do admin
/components
  /ui                    # shadcn/ui components
  /shop                  # Componentes da loja
  /admin                 # Componentes do admin
/lib
  /db.ts                 # Cliente Supabase
  /square.ts             # Cliente Square
  /email.ts              # Cliente Resend
  /auth.ts               # Helpers de auth
  /analytics.ts          # Queries de analytics
  /utils.ts
/types                   # Tipos compartilhados
/db
  /migrations            # SQL migrations
  /seed.ts               # Dados de teste
```

---

## 5. Modelo de dados (Postgres)

```sql
-- ============================================
-- PRODUTOS E CATÁLOGO
-- ============================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft', -- draft | active | archived
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL, -- ex: "Blue / Large"
  price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
  compare_at_price_cents INTEGER, -- preço "de"
  stock_qty INTEGER NOT NULL DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 5,
  weight_grams INTEGER,
  attributes JSONB DEFAULT '{}', -- { size: "L", color: "blue" }
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_variants_product ON product_variants(product_id);
CREATE INDEX idx_variants_low_stock ON product_variants(stock_qty)
  WHERE stock_qty <= low_stock_threshold;

CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt TEXT,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  parent_id UUID REFERENCES categories(id),
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE product_categories (
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, category_id)
);

-- ============================================
-- CLIENTES
-- ============================================
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE, -- FK para auth.users do Supabase
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'shipping', -- shipping | billing
  line1 TEXT NOT NULL,
  line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL, -- código de 2 letras (CA, NY...)
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'US',
  is_default BOOLEAN DEFAULT FALSE
);

-- ============================================
-- PEDIDOS
-- ============================================
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number SERIAL UNIQUE, -- número visível ao cliente
  customer_id UUID REFERENCES customers(id),
  email TEXT NOT NULL, -- também salvo aqui pra guest checkout
  status TEXT NOT NULL DEFAULT 'pending',
    -- pending | paid | shipped | delivered | cancelled | refunded
  square_checkout_id TEXT UNIQUE,
  square_payment_id TEXT,
  subtotal_cents INTEGER NOT NULL,
  tax_cents INTEGER DEFAULT 0,
  shipping_cents INTEGER DEFAULT 0,
  total_cents INTEGER NOT NULL,
  shipping_address JSONB,
  billing_address JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  shipped_at TIMESTAMPTZ
);

CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id),
  product_name TEXT NOT NULL, -- snapshot
  variant_name TEXT NOT NULL, -- snapshot
  sku TEXT NOT NULL,          -- snapshot
  unit_price_cents INTEGER NOT NULL, -- snapshot
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  line_total_cents INTEGER NOT NULL
);

-- ============================================
-- ADMIN
-- ============================================
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'admin', -- admin | viewer
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INVENTORY MOVEMENTS (auditoria de estoque)
-- ============================================
CREATE TABLE inventory_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id UUID NOT NULL REFERENCES product_variants(id),
  delta INTEGER NOT NULL, -- positivo = entrada, negativo = saída
  reason TEXT NOT NULL, -- order_paid | order_cancelled | manual_adjustment | restock
  reference_id UUID, -- order_id ou outro
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES admin_users(id)
);

CREATE INDEX idx_inv_mov_variant ON inventory_movements(variant_id, created_at DESC);
```

**Regra crítica:** todos os preços em **centavos (INTEGER)**, nunca em float. Conversões pra display em UI/UX.

---

## 6. Convenções de código

### Geral
- TypeScript `strict: true`
- Sem `any` — usar `unknown` quando necessário
- Validação de input com Zod em **todas** as boundaries (forms, API routes, server actions)
- Server Components por padrão, Client Components só quando necessário (`"use client"`)
- `async/await`, sem `.then()`

### Naming
- Componentes: `PascalCase` (`ProductCard.tsx`)
- Hooks: `camelCase` com prefixo `use` (`useCart.ts`)
- Utilitários: `camelCase` (`formatCents.ts`)
- Tipos: `PascalCase` em arquivos `.types.ts`
- Rotas API: `route.ts` dentro de pastas em `kebab-case`

### Server Actions vs API Routes
- **Server Actions** para mutations vindas de UI da própria app
- **API Routes** apenas para webhooks (Square) e endpoints externos

### Imagens
- Sempre via `next/image`
- Sempre com `alt` descritivo
- Lazy loading default; `priority` apenas em hero/above-the-fold

### Erros
- Não silenciar erros com `try/catch` vazio
- Logar erros estruturados (JSON) no servidor
- UI de erro amigável com fallback de retry

### Commits
Convencional Commits:
- `feat: add product detail page`
- `fix: correct cart total calculation`
- `chore: bump dependencies`
- `refactor: extract checkout flow into hook`

---

## 7. Variáveis de ambiente

```env
# Database / Auth
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY= # apenas server-side

# Square
SQUARE_ACCESS_TOKEN=
SQUARE_LOCATION_ID=
SQUARE_ENVIRONMENT=sandbox # sandbox | production
SQUARE_WEBHOOK_SIGNATURE_KEY=

# E-mail
RESEND_API_KEY=
EMAIL_FROM=orders@mayer-shop.com

# App
NEXT_PUBLIC_SITE_URL=https://...
ADMIN_ALLOWED_EMAILS=mayer@example.com,paulo@example.com
```

---

# FASE 1 — Catálogo + Frontend (US$ 1.200)

## Escopo
Setup do projeto, estrutura de DB, catálogo público, páginas de produto, listagem com busca/filtros e layout responsivo.

## Tarefas

### 1.1. Setup
- [ ] Confirmar/instalar dependências
- [ ] Configurar Supabase (projeto, env vars, cliente)
- [ ] Aplicar migrations do schema da seção 5
- [ ] Configurar Vercel Blob ou Supabase Storage para imagens
- [ ] Criar seed script com 5–10 produtos de exemplo
- [ ] Configurar ESLint + Prettier

### 1.2. Layout base da loja
- [ ] Header com logo, navegação, ícone de busca, ícone de carrinho (badge com qtd), ícone de conta
- [ ] Footer com links institucionais + newsletter signup (campo placeholder, sem integração ainda)
- [ ] Layout responsivo (mobile first, breakpoints sm/md/lg/xl)
- [ ] Tema consistente com base 801-outlet existente

### 1.3. Home
- [ ] Hero (banner principal — pode ser imagem com CTA)
- [ ] Seção "Featured Products" (4–8 produtos com flag `is_featured` ou query por `created_at`)
- [ ] Seção de categorias em destaque

### 1.4. Catálogo (`/products`)
- [ ] Grid responsivo (2 colunas mobile, 3–4 desktop)
- [ ] Filtros: categoria, faixa de preço, busca por texto
- [ ] Ordenação: relevância, preço asc/desc, mais recentes
- [ ] Paginação ou infinite scroll (preferência: paginação simples para SEO)
- [ ] Server-side rendering com cache apropriado
- [ ] Skeleton loading state

### 1.5. Página de produto (`/products/[slug]`)
- [ ] Galeria de imagens (carrossel + thumbnails)
- [ ] Nome, preço (com compare_at se houver), descrição
- [ ] Seletor de variante (tamanho/cor) — atualiza preço e estoque
- [ ] Indicador de estoque baixo ("Only 3 left!") quando `stock_qty <= 5`
- [ ] Botão "Add to Cart" (Fase 2 conecta de fato)
- [ ] Sessão "You may also like" (4 produtos da mesma categoria)
- [ ] SEO: meta tags, og:image, JSON-LD `Product`

### 1.6. Busca
- [ ] Endpoint de busca por nome/descrição (Postgres full-text ou ILIKE para começar)
- [ ] Página de resultados em `/products?q=...`

## Critérios de aceitação Fase 1
- ✅ Lighthouse Performance > 90 mobile
- ✅ Lighthouse Accessibility > 95
- ✅ SEO básico configurado (sitemap, robots.txt, meta tags)
- ✅ Todas as imagens com alt text
- ✅ 100% responsivo até 360px
- ✅ Sem console errors em produção
- ✅ Páginas de produto carregam em < 1.5s
- ✅ Build de produção passa sem warnings

---

# FASE 2 — Carrinho + Checkout + Conta (US$ 900)

## Escopo
Carrinho persistente, integração com Square Hosted Checkout, cadastro/login de cliente, área de conta com histórico, e-mails transacionais.

## Tarefas

### 2.1. Carrinho
- [ ] Estado do carrinho persistido em localStorage (guest) e sincronizado com DB ao logar
- [ ] Hook `useCart()` com: add, remove, updateQty, clear, totals
- [ ] Página `/cart`:
  - Lista de itens com thumbnail, nome, variante, preço, qtd (editável), subtotal
  - Resumo: subtotal, estimativa de shipping (placeholder), total
  - Botão "Proceed to Checkout"
  - Estado vazio com CTA pra catálogo
- [ ] Validação de estoque ao adicionar (não permitir qtd > stock_qty)
- [ ] Mini-cart no header (slide-over ou dropdown)

### 2.2. Auth de cliente
- [ ] Páginas de login e signup com Supabase Auth
- [ ] Auth via e-mail/senha + opção Google OAuth
- [ ] Confirmação de e-mail ativa
- [ ] Reset de senha via e-mail
- [ ] Trigger no DB que cria registro em `customers` ao registrar em `auth.users`
- [ ] Redirect inteligente após login (volta pra página de origem)

### 2.3. Checkout flow
- [ ] Página `/checkout`:
  - Resumo do pedido (itens + totais)
  - Formulário de endereço (validação Zod)
  - Opção "guest checkout" (sem criar conta)
  - Botão "Pay with Square" → cria checkout link e redireciona

- [ ] **Integração Square Hosted Checkout:**
  ```typescript
  // /lib/square.ts — fluxo:
  // 1. POST para Square /v2/online-checkout/payment-links
  //    com order items, prices, redirect URL
  // 2. Square retorna URL hospedada
  // 3. Redirecionar customer pra essa URL
  // 4. Square redireciona de volta pra /checkout/success?ref=...
  // 5. Webhook /api/webhooks/square confirma o pagamento
  ```

- [ ] **Webhook Square** (`/api/webhooks/square/route.ts`):
  - Validar assinatura HMAC do header `x-square-hmacsha256-signature`
  - Tratar evento `payment.created` / `payment.updated`
  - Atualizar `orders.status` para `paid`
  - Criar `inventory_movements` (saída) e decrementar `stock_qty`
  - Disparar e-mail de confirmação
  - Retornar 200 rapidamente; logar erros sem dar 500 (Square retenta)

- [ ] Página `/checkout/success` — confirmação com número do pedido
- [ ] Página `/checkout/cancel` — opção de retomar carrinho

### 2.4. E-mails transacionais (Resend)
- [ ] Template "Order Confirmation" — HTML responsivo, dados do pedido
- [ ] Template "Order Shipped" — quando admin marcar como shipped (Fase 3)
- [ ] From address verificado no Resend

### 2.5. Área da conta (`/account`)
- [ ] Dashboard: nome, e-mail, último pedido
- [ ] `/account/orders` — listagem de pedidos
- [ ] `/account/orders/[id]` — detalhes de um pedido
- [ ] `/account/addresses` — CRUD de endereços
- [ ] `/account/profile` — editar nome, telefone, senha

## Critérios de aceitação Fase 2
- ✅ Pagamento de teste em sandbox passa end-to-end
- ✅ Webhook recebido e processado em < 3s
- ✅ Estoque decrementado corretamente após pagamento confirmado
- ✅ E-mail de confirmação chega em < 30s após pagamento
- ✅ Carrinho persiste entre sessões (logado) e em localStorage (guest)
- ✅ Não permite checkout com item sem estoque
- ✅ Race condition de estoque tratada (transação SQL)

---

# FASE 3 — Admin + Analytics + Estoque (US$ 900)

## Escopo
Painel administrativo completo com gestão de produtos, pedidos, estoque, dashboard de vendas e go-live em produção.

## Tarefas

### 3.1. Auth e layout do admin
- [ ] Middleware verifica `auth_user_id` em `admin_users`
- [ ] Redirect pra `/admin/login` se não autenticado
- [ ] Layout com sidebar (Dashboard, Products, Orders, Inventory, Customers, Settings) e topbar (search, user menu)
- [ ] Tema visual diferenciado da loja pública

### 3.2. Dashboard de Analytics (`/admin`)
**Esta é a parte de maior valor — leverage da expertise de BI.**

KPIs no topo (cards):
- [ ] Revenue today / this week / this month / YTD
- [ ] Orders today / this week / this month
- [ ] Average Order Value (AOV)
- [ ] Conversion rate (se houver tracking; placeholder se não)
- [ ] Inventory value at cost

Gráficos:
- [ ] **Revenue over time** — line chart, com toggle período (7d/30d/90d/12m)
- [ ] **Orders over time** — bar chart no mesmo período
- [ ] **Top products** — tabela top 10 por receita no período
- [ ] **Sales by category** — pie/donut
- [ ] **Sales by hour of day** — heatmap simples (ajuda a entender padrão)

Tabela:
- [ ] **Recent orders** (últimos 10) com link pra detalhe

Implementação:
- Queries em SQL views materializadas se performance virar problema
- Recharts para gráficos
- Filtros de período em estado de URL pra ser shareable

### 3.3. Gestão de produtos
- [ ] Listagem com tabela (TanStack Table): nome, SKU, preço, estoque, status, ações
- [ ] Filtros: status, categoria, busca
- [ ] Bulk actions: ativar, arquivar, excluir
- [ ] Form de criar/editar:
  - Info básica (nome, slug auto, descrição com editor rich text simples)
  - Categorias (multi-select)
  - Imagens (upload múltiplo, ordenação drag-and-drop)
  - Variantes (tabela editável: SKU, nome, preço, estoque, atributos)
  - Status (draft/active/archived)
- [ ] Validação Zod robusta
- [ ] Slug gerado automaticamente, com check de unicidade

### 3.4. Gestão de pedidos
- [ ] Listagem com tabela: # do pedido, data, cliente, total, status
- [ ] Filtros: status, intervalo de data, busca por # ou e-mail
- [ ] Página de detalhe:
  - Dados do cliente
  - Endereço de entrega
  - Itens do pedido
  - Totais
  - Histórico de status com timestamps
  - Ações: marcar como "Shipped" (com tracking opcional), "Delivered", "Cancelled" (gera reversão de estoque)
  - Botão "Resend confirmation email"
- [ ] Export CSV de pedidos com filtros aplicados

### 3.5. Controle de estoque
- [ ] Listagem de variantes com estoque atual, threshold, status
- [ ] Filtro: "Low stock only" (mostra onde `stock_qty <= low_stock_threshold`)
- [ ] Edição inline de estoque (gera `inventory_movements` com reason `manual_adjustment`)
- [ ] Histórico de movimentações por variante
- [ ] **Alerta visual no topo do admin** quando há produtos com estoque baixo
- [ ] Página `/admin/inventory/alerts` com lista priorizada

### 3.6. Configurações
- [ ] Dados da loja (nome, e-mail de contato, endereço)
- [ ] Shipping rates (flat rate inicial — pode evoluir depois)
- [ ] Tax settings (placeholder — Mayer paga ferramenta separada)
- [ ] Lista de admins (adicionar/remover por e-mail)

### 3.7. Go-live
- [ ] Configurar domínio de produção
- [ ] Ambiente Square: trocar de sandbox pra production
- [ ] Verificar webhooks em produção
- [ ] Setup de monitoring (Vercel Analytics + logs)
- [ ] Backup de DB configurado (Supabase faz automático)
- [ ] Documentação básica em `/docs/admin-guide.md` (PT/EN)

## Critérios de aceitação Fase 3
- ✅ Admin protegido por role (não-admin recebe 403)
- ✅ Dashboard carrega em < 2s com 1 ano de dados simulados
- ✅ Edição de produto reflete na loja em < 5s (cache invalidation)
- ✅ Alerta de estoque visível e funcional
- ✅ Export CSV funcional
- ✅ Pagamento real testado em produção
- ✅ Documentação entregue

---

## 8. Notas críticas de implementação

### Square — pegadinhas
- Square trabalha em **centavos** também (USD em `amount`). Manter consistência.
- `redirect_url` precisa ser HTTPS — usar ngrok pra dev local de webhook
- Webhook precisa retornar 200 em < 10s ou Square retenta (idempotência por `event_id`!)
- Em sandbox, usar cartão de teste documentado pela Square (`4111 1111 1111 1111`)
- Salvar `square_checkout_id` no momento da criação pra reconciliação

### Inventário — race condition
Decremento de estoque no webhook deve ser transacional:
```sql
BEGIN;
UPDATE product_variants
   SET stock_qty = stock_qty - $qty
 WHERE id = $variant_id AND stock_qty >= $qty
RETURNING stock_qty;
-- Se RETURNING vazio, abortar e marcar pedido pra revisão manual
INSERT INTO inventory_movements ...;
COMMIT;
```

### Imagens
- Comprimir antes do upload (sharp ou next/image)
- Sempre WebP/AVIF quando possível
- Múltiplos tamanhos via `next/image` `sizes` prop

### SEO
- `sitemap.xml` dinâmico via Route Handler
- `robots.txt` permissivo em produção, restrito em preview
- Meta tags via `generateMetadata` em cada page
- `Product` JSON-LD em página de produto

### Performance
- ISR (Incremental Static Regeneration) em páginas de produto e catálogo
- Revalidate via tag invalidation em mutations do admin
- Server Components por padrão; Client apenas pra interatividade

### Acessibilidade
- Contraste WCAG AA mínimo
- Navegação por teclado funcional
- Focus visible em todos os interactivos
- Labels em todos os inputs
- `aria-live` em mensagens dinâmicas (cart updates)

---

## 9. Fora de escopo (NÃO implementar nesta versão)

- ❌ Pagamento parcelado/financiamento (Affirm, Klarna, Afterpay) — Fase futura
- ❌ Importação massiva CSV
- ❌ Cupons de desconto e programa de fidelidade
- ❌ Multi-idioma / multi-moeda
- ❌ Integração com marketplaces (Amazon, eBay)
- ❌ Blog / SEO de conteúdo
- ❌ Reviews de produto
- ❌ Wishlist
- ❌ Multi-warehouse
- ❌ Configuração avançada de impostos (Mayer paga ferramenta externa)
- ❌ Loyalty / referral programs
- ❌ Email marketing (apenas transacional)

Se o cliente pedir qualquer item acima, **abrir issue separada com escopo e estimativa**, não incluir no escopo atual.

---

## 10. Como o agente deve trabalhar

1. **Ler todo este documento antes de começar.**
2. **Discovery primeiro** (seção 2) — não pular.
3. **Implementar por fase, não tudo de uma vez.** Ao final de cada fase, validar contra os critérios de aceitação.
4. **Commits pequenos e atômicos.** Convencional Commits.
5. **Branch por feature.** PR para `main` com descrição clara.
6. **Tipar tudo.** Nada de `any`. Nada de `as any`.
7. **Validar inputs com Zod.** Sempre.
8. **Em caso de ambiguidade, perguntar antes de assumir.**
9. **Não inventar features fora do escopo.** Se identificar algo útil que não está aqui, sugerir como nota, não implementar.
10. **Performance e a11y são parte do critério de aceitação**, não opcional.

---

## 11. Checklist de entrega final

- [ ] Repositório com README completo (setup, env, deploy)
- [ ] Migrations versionadas em `/db/migrations`
- [ ] Seed script funcional
- [ ] Variáveis de ambiente documentadas em `.env.example`
- [ ] Deploy de produção funcional
- [ ] Webhooks Square configurados em produção
- [ ] Domínio configurado
- [ ] Backup automático configurado
- [ ] Documentação de admin entregue
- [ ] Pagamento real testado e validado
- [ ] Lighthouse > 90 em todas as páginas principais
- [ ] Acesso de admin entregue ao Mayer

---

**Documento mantido em sincronia com o repositório. Atualizar via PR ao surgirem mudanças de escopo.**