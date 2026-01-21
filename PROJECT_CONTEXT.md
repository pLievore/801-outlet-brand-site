# 801 Outlet — Contexto Completo do Projeto

## 📋 Visão Geral

**Nome do Projeto:** 801 Outlet Brand Site  
**Tipo:** Site institucional de marca (brand site) para loja de móveis  
**Objetivo:** Showcase de produtos premium com design clean tipo Apple. O site não tem checkout próprio - redireciona para Shopify com parâmetros UTM para rastreamento.

**Características principais:**
- Site de vitrine premium (Apple-like)
- Foco em visualização de produtos
- Entrega apenas no estado de Utah (EUA)
- Integração com Shopify para checkout
- CTA primário: WhatsApp/call com informações do produto

---

## 🛠 Stack Tecnológico

### Core
- **Framework:** Next.js 16.1.3 (App Router)
- **Linguagem:** TypeScript 5
- **React:** 19.2.3
- **Styling:** Tailwind CSS 4

### Dependências Principais
- **framer-motion:** ^12.27.1 (instalado mas não utilizado ainda)
- **lucide-react:** ^0.562.0 (instalado mas não utilizado ainda)
- **clsx:** ^2.1.1 (para gerenciamento de classes condicionais)
- **tailwind-merge:** ^3.4.0 (para merge de classes Tailwind)

### Dev Dependencies
- **ESLint** com config Next.js
- **Prettier** com plugin Tailwind
- **@tailwindcss/postcss:** ^4.1.18

---

## 📁 Estrutura do Projeto

```
801-outlet-brand-site/
├── app/                          # Next.js App Router
│   ├── components/
│   │   └── herovideo.tsx        # Componente de vídeo hero (client component)
│   ├── products/
│   │   ├── [slug]/
│   │   │   └── page.tsx         # Página de detalhe do produto (dinâmica)
│   │   └── page.tsx             # Lista de produtos com filtros
│   ├── globals.css              # Estilos globais e variáveis CSS
│   ├── layout.tsx               # Layout raiz (header + footer)
│   └── page.tsx                 # Homepage
├── src/
│   ├── config/
│   │   └── env.ts               # Configurações de ambiente (centralizado)
│   └── data/
│       └── products.ts          # Dados dos produtos (array estático)
├── public/
│   ├── brand/                   # Assets da marca (logo, favicon, hero video)
│   └── products/                # Imagens dos produtos (placeholder-*.jpg)
├── package.json
├── tsconfig.json
├── next.config.ts
├── PROJECT_SPEC.md              # Especificação original do projeto
└── ENV.md                       # Documentação de variáveis de ambiente
```

---

## 🎨 Design System & Branding

### Paleta de Cores (CSS Variables)
```css
--bg: 250 248 243;      /* off-white/cream */
--fg: 12 22 31;         /* navy-ish */
--muted: 90 102 112;    /* slate */
--border: 220 225 230;  /* soft border */
--accent: 198 108 48;   /* outlet orange */
```

### Características de Design
- Design minimalista e premium (inspirado em Apple)
- Tipografia: geometricPrecision
- Animações sutis (hover effects, translate-y)
- Responsive-first (mobile-first approach)
- Foco em acessibilidade (focus-visible, aria)

### Componentes de UI
- Botões: rounded-full com estados hover/active
- Cards: rounded-2xl com bordas suaves
- Badges: rounded-full para status (Fast delivery, In stock, etc.)
- Grid: sistema responsivo (1 col mobile → 2-3 cols desktop)

---

## 📄 Páginas e Funcionalidades

### 1. Homepage (`app/page.tsx`)
**Seções:**
- **Hero Section:** 
  - Título + descrição + CTAs
  - Vídeo hero ao lado (componente HeroVideo)
  - Card de informação sobre entrega
- **Categories Section:**
  - Grid de 4 categorias (Sofas, Beds, Recliners, Sectionals)
  - Links para filtro na página de produtos

**CTAs:**
- "Browse products" → `/products`
- "Shop online" → Shopify store (com UTM params)

### 2. Lista de Produtos (`app/products/page.tsx`)
**Funcionalidades:**
- Filtro por categoria (chips clicáveis)
- Grid responsivo de cards de produtos
- Hover effect: troca de imagem primária → secundária
- Badges: Save $X, Fast delivery, In stock, Limited, Utah only
- Preços com compareAtPrice (linha riscada)

**Query Params:**
- `?category=sofas` | `beds` | `recliners` | `sectionals` | `all`

**Componentes visuais:**
- Chip de categoria ativa (bg escuro)
- Cards com hover lift effect
- Imagens otimizadas com Next/Image

### 3. Detalhe do Produto (`app/products/[slug]/page.tsx`)
**Funcionalidades:**
- Gallery: imagem principal + thumbnails (até 4)
- Informações: título, preço, descrição, badges
- Especificações: material, cor, dimensões, seating, condition
- CTAs: "Call Now" (tel:) e "Buy on Shopify"
- Breadcrumb: "← BACK TO CATALOG"

**Fallback:**
- Página 404 se produto não encontrado

### 4. Layout (`app/layout.tsx`)
**Componentes:**
- **SiteHeader:**
  - Logo + nome da marca
  - Navegação: Products, Delivery, About (links ainda sem páginas)
  - Botão "Shop" → Shopify
  - CTA primário: "Call Now" (sticky header)
- **SiteFooter:**
  - Informações da marca
  - Links: Privacy, Terms, Contact (ainda sem páginas)
  - Copyright dinâmico

---

## 🗄️ Estrutura de Dados

### Tipo Product (`src/data/products.ts`)
```typescript
type Product = {
  slug: string;                    // URL-friendly identifier
  title: string;                   // Nome do produto
  category: ProductCategory;       // 'sofas' | 'sectionals' | etc.
  price: number;                   // Preço em USD
  compareAtPrice?: number;         // Preço original (para desconto)
  shortDescription: string;        // Descrição curta
  images: {                        // Array de imagens
    src: string;                   // Path em /public/products/
    alt: string;
  }[];
  specs: {                         // Especificações técnicas
    material?: string;
    color?: string;
    dimensions?: string;
    seating?: string;
    condition?: 'New' | 'Like New' | 'Open Box';
  };
  inStock: boolean;                // Status de estoque
  fastDelivery: boolean;           // Entrega rápida disponível
  utahOnly: boolean;               // Apenas Utah
  shopifyUrl: string;              // Link para produto no Shopify
};
```

### Categorias Disponíveis
```typescript
type ProductCategory =
  | 'sofas'
  | 'sectionals'
  | 'recliners'
  | 'beds'
  | 'mattresses'
  | 'dining'
  | 'storage'
  | 'other';
```

### Estado Atual dos Dados
- **Produtos cadastrados:** 4 produtos (comentário indica capacidade para até 40)
- **Funções helpers:**
  - `getProductBySlug(slug: string)` → retorna Product | undefined

---

## ⚙️ Configurações de Ambiente

### Arquivo: `src/config/env.ts`
**Variáveis disponíveis:**

1. **NEXT_PUBLIC_SHOPIFY_STORE_URL**
   - Descrição: URL base da loja Shopify
   - Padrão: `https://801outlet.com`
   - Uso: Gerar links com UTM parameters

2. **NEXT_PUBLIC_PHONE_E164**
   - Descrição: Número de telefone em formato E.164
   - Padrão: `+1 385 201 6328`
   - Uso: Links `tel:` para chamadas diretas

**Funções utilitárias:**
- `env.getShopifyUrl(path?, utmSource?, utmMedium?, utmCampaign?)`
  - Gera URLs do Shopify com parâmetros UTM automáticos
- `env.getPhoneHref()`
  - Retorna link formatado para tel:

**Arquivo de exemplo:** `env.example` (template para `.env.local`)

---

## 🎬 Componentes Especiais

### HeroVideo (`app/components/herovideo.tsx`)
**Tipo:** Client Component ('use client')

**Funcionalidades:**
- Vídeo autoplay (muted, loop, playsInline)
- Tenta autoplay programaticamente via useEffect
- Fallback gracioso se browser bloquear
- Poster: `/brand/hero-poster.jpg` (arquivo pode não existir)

**Configurações:**
- Sem controles
- Sem picture-in-picture
- Preload: metadata
- Loop infinito

---

## 🔗 Integrações

### Shopify
- **Método:** Links diretos com parâmetros UTM
- **UTM Parameters padrão:**
  - `utm_source=brand_site`
  - `utm_medium=nav` (ou `hero`, `product`)
  - `utm_campaign=shop_redirect`

### Telefone
- **Formato:** E.164 (`+1 385 201 6328`)
- **Uso:** Links `tel:` para dispositivos móveis
- **Tratamento:** Remove caracteres não numéricos

---

## 📱 Responsividade

### Breakpoints (Tailwind)
- **Mobile:** < 640px (padrão)
- **SM:** ≥ 640px
- **MD:** ≥ 768px (tablets)
- **LG:** ≥ 1024px (desktop)

### Comportamentos Responsivos
- Header: navegação oculta em mobile, apenas logo + CTA
- Grid de produtos: 1 col → 2 cols → 3 cols
- Hero section: layout em coluna em mobile, 2 colunas em desktop
- Categories: 1 col → 2 cols → 4 cols

---

## 🚀 Scripts Disponíveis

```bash
npm run dev      # Servidor de desenvolvimento
npm run build    # Build para produção
npm run start    # Servidor de produção
npm run lint     # ESLint
```

---

## ⚠️ Pontos de Atenção / TODOs

### Páginas Faltantes
- `/delivery` - Link no header
- `/about` - Link no header
- `/privacy` - Link no footer
- `/terms` - Link no footer
- `/contact` - Link no footer

### Melhorias Pendentes
- **Framer Motion:** Instalado mas não utilizado (animações sutis planejadas)
- **Lucide React:** Instalado mas não utilizado (ícones)
- **Hero poster:** Arquivo `/brand/hero-poster.jpg` pode não existir
- **Produtos:** Apenas 4 cadastrados (comentário indica até 40)
- **Shopify URLs:** URLs de produtos ainda usam placeholder `your-shopify-store.com`

### Bugs Potenciais
- Acesso a `p.images[0]` pode falhar se array vazio (já tratado com optional chaining)

---

## 🎯 Regras de Negócio

1. **Entrega:** Disponível apenas no estado de Utah
2. **Checkout:** Não há checkout no site - redireciona para Shopify
3. **CTA Primário:** Chamada telefônica (tel:)
4. **Categorias:** Foco em Sofas, Beds, Recliners, Sectionals (mostradas na home)
5. **Design:** Animações sutis, respeitar `prefers-reduced-motion`

---

## 🔒 Segurança e Boas Práticas

### Implementado
- ✅ Variáveis de ambiente para configurações sensíveis
- ✅ TypeScript strict mode
- ✅ Validação de dados de produtos
- ✅ Tratamento de produtos não encontrados
- ✅ Links externos com `rel="noreferrer"`

### Recomendações Futuras
- Implementar validação de schema de produtos (Zod)
- Adicionar error boundaries
- Implementar analytics
- Adicionar sitemap.xml e robots.txt

---

## 📊 Performance

### Otimizações Implementadas
- ✅ Next/Image para otimização de imagens
- ✅ Lazy loading de imagens secundárias
- ✅ Priority na imagem principal do hero
- ✅ Video com preload="metadata"

### Métricas Esperadas
- First Contentful Paint: < 1.8s
- Largest Contentful Paint: < 2.5s
- Time to Interactive: < 3.5s

---

## 🧪 Testing (Não Implementado)

- Nenhum teste configurado atualmente
- Sugestões: Jest + React Testing Library

---

## 📚 Recursos Adicionais

### Documentação
- `PROJECT_SPEC.md` - Especificação original
- `ENV.md` - Guia de variáveis de ambiente
- `README.md` - Instruções básicas

### Assets
- Logo: `/brand/icon-512x512.png` (múltiplos tamanhos disponíveis)
- Hero Video: `/brand/hero.mp4`
- Produtos: `/products/placeholder-*.jpg` (5 imagens placeholder)

---

## 🔄 Fluxo do Usuário

1. **Homepage** → Visualiza hero e categorias
2. **Click "Browse products"** → Vai para `/products`
3. **Filtra por categoria** → URL atualiza com query param
4. **Click em produto** → Vai para `/products/[slug]`
5. **Visualiza detalhes** → Pode clicar "Buy on Shopify" ou "Call Now"

---

## 💡 Notas Importantes para Desenvolvimento

1. **Client vs Server Components:**
   - A maioria dos componentes são Server Components (padrão Next.js 13+)
   - Apenas HeroVideo é Client Component (necessita interatividade)

2. **Imagens:**
   - Sempre usar `next/image` para otimização
   - Imagens devem estar em `/public/`
   - Usar `fill` para containers absolutos, `width/height` para outros casos

3. **Links:**
   - Links internos: usar `Link` do Next.js
   - Links externos: usar `<a>` com `target="_blank"` e `rel="noreferrer"`

4. **Estilos:**
   - Classes Tailwind podem ser longas (strings concatenadas)
   - Considerar extrair para constantes reutilizáveis no futuro

5. **TypeScript:**
   - Tipos bem definidos em `products.ts`
   - Type safety em todas as funções
   - Cuidado com optional chaining em arrays

---

## 🎨 Design Philosophy

- **Minimalismo:** Menos é mais
- **Clareza:** Informações importantes destacadas
- **Premium:** Sensação de qualidade (espaçamento, tipografia)
- **Funcionalidade:** Design serve ao propósito (showcase + conversão)

---

**Última atualização:** Baseado no estado atual do repositório  
**Versão:** 0.1.0 (MVP)
