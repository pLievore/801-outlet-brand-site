# 801 Outlet - Contexto para ChatGPT

## Projeto
Site institucional premium (tipo Apple) para loja de móveis 801 Outlet. Showcase de produtos que redireciona para Shopify. Entrega apenas em Utah, EUA.

## Stack
- Next.js 16.1.3 (App Router)
- React 19.2.3
- TypeScript 5
- Tailwind CSS 4
- Framer Motion (instalado, não usado ainda)

## Estrutura
```
app/
├── page.tsx              # Homepage (hero + categorias)
├── products/
│   ├── page.tsx          # Lista com filtros
│   └── [slug]/page.tsx   # Detalhe do produto
├── layout.tsx            # Header + Footer
└── components/
    └── herovideo.tsx     # Client component com vídeo

src/
├── config/env.ts         # Variáveis de ambiente centralizadas
└── data/products.ts      # Array estático de 4 produtos
```

## Funcionalidades Principais
1. **Homepage:** Hero com vídeo + grid de 4 categorias
2. **Lista de produtos:** Filtro por categoria, hover effect (troca imagem)
3. **Detalhe:** Gallery, specs, CTAs (Call Now + Buy on Shopify)
4. **Header:** Logo, nav, botão Shop, CTA Call Now
5. **Footer:** Links (Privacy, Terms, Contact - sem páginas ainda)

## Dados de Produtos
Tipo `Product` com: slug, title, category, price, compareAtPrice, images[], specs{}, inStock, fastDelivery, utahOnly, shopifyUrl.

4 produtos cadastrados: Harlow Sectional, Milo Sofa, Atlas Recliner, Nova Bed Frame.

## Variáveis de Ambiente
- `NEXT_PUBLIC_SHOPIFY_STORE_URL` (padrão: https://801outlet.com)
- `NEXT_PUBLIC_PHONE_E164` (padrão: +1 385 201 6328)

Funções: `env.getShopifyUrl()` (com UTM) e `env.getPhoneHref()`.

## Design System
- Cores: off-white bg, navy fg, orange accent
- Componentes: rounded-full buttons, rounded-2xl cards
- Animações sutis (hover translate-y)
- Responsivo: mobile-first

## Integrações
- Shopify: links com UTM parameters
- Telefone: links tel: formatados

## Status
- ✅ Next/Image implementado
- ✅ Variáveis de ambiente centralizadas
- ⚠️ Framer Motion instalado mas não usado
- ⚠️ 5 páginas linkadas mas não criadas (delivery, about, privacy, terms, contact)
- ⚠️ URLs Shopify em produtos ainda com placeholder

## Regras de Negócio
- Entrega: apenas Utah
- Checkout: não no site, redireciona para Shopify
- CTA primário: chamada telefônica
- Design: animações sutis, respeitar prefers-reduced-motion
