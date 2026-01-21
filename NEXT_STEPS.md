# 🚀 Próximos Passos - Roadmap de Desenvolvimento

## 📋 Priorização

### 🔴 **ALTA PRIORIDADE** (Fazer Primeiro)
### 🟡 **MÉDIA PRIORIDADE** (Próxima Sprint)
### 🟢 **BAIXA PRIORIDADE** (Melhorias Futuras)

---

## 🔴 ALTA PRIORIDADE

### 1. **Criar Páginas Faltantes** ⚠️ Links Quebrados
**Status:** Links no header/footer apontam para páginas inexistentes

**Páginas a criar:**
- [ ] `/app/delivery/page.tsx` - Política de entrega (Utah only)
- [ ] `/app/about/page.tsx` - Sobre a empresa
- [ ] `/app/contact/page.tsx` - Formulário de contato ou informações
- [ ] `/app/privacy/page.tsx` - Política de privacidade
- [ ] `/app/terms/page.tsx` - Termos de uso

**Recomendações:**
- Manter design consistente (mesmo layout/padding)
- Reutilizar componentes do design system
- Conteúdo mínimo mas profissional

**Tempo estimado:** 2-3 horas

---

### 2. **Atualizar URLs do Shopify nos Produtos**
**Status:** URLs ainda usam placeholder `your-shopify-store.com`

**Ação:**
- [ ] Atualizar `shopifyUrl` em todos os produtos em `src/data/products.ts`
- [ ] Usar URLs reais do Shopify store
- [ ] Manter parâmetros UTM para tracking

**Exemplo:**
```typescript
shopifyUrl: env.getShopifyUrl('/products/harlow-sectional-cream', 'brand_site', 'product', 'shop_redirect')
// ou se já tem URL completa, usar diretamente
```

**Tempo estimado:** 30 minutos

---

### 3. **Adicionar Mais Produtos**
**Status:** Apenas 4 produtos cadastrados (capacidade para até 40)

**Ação:**
- [ ] Adicionar produtos nas categorias principais:
  - Sofas (3-5 produtos)
  - Sectionals (2-3 produtos)
  - Recliners (2-3 produtos)
  - Beds (2-3 produtos)
- [ ] Preparar imagens dos produtos
- [ ] Completar informações (specs, descriptions)

**Tempo estimado:** 4-6 horas (dependendo do número de produtos)

---

## 🟡 MÉDIA PRIORIDADE

### 4. **Implementar SEO Básico**
**Status:** SEO básico existe (metadata no layout), mas pode melhorar

**Tarefas:**
- [ ] Adicionar metadata dinâmica por página
- [ ] Criar `app/sitemap.ts` (sitemap.xml automático)
- [ ] Criar `app/robots.ts` (robots.txt)
- [ ] Adicionar Open Graph tags
- [ ] Adicionar metadata para páginas de produtos (title, description, images)

**Exemplo de metadata por produto:**
```typescript
export async function generateMetadata({ params }: PageProps) {
  const product = getProductBySlug(params.slug);
  if (!product) return {};
  
  return {
    title: `${product.title} — 801 Outlet`,
    description: product.shortDescription,
    openGraph: {
      images: [product.images[0]?.src],
    },
  };
}
```

**Tempo estimado:** 2-3 horas

---

### 5. **Implementar Animações com Framer Motion**
**Status:** Framer Motion instalado mas não utilizado

**Animações sugeridas:**
- [ ] Fade-in em cards de produtos ao scroll
- [ ] Animações sutis nos botões (scale on hover)
- [ ] Transições de página (page transitions)
- [ ] Animações de entrada nas seções da homepage
- [ ] Respeitar `prefers-reduced-motion`

**Exemplo:**
```typescript
'use client';
import { motion } from 'framer-motion';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};
```

**Tempo estimado:** 3-4 horas

---

### 6. **Melhorar Gestão de Imagens**
**Status:** Imagens placeholder sendo reutilizadas

**Tarefas:**
- [ ] Preparar imagens reais dos produtos
- [ ] Otimizar imagens (compressão, formatos)
- [ ] Adicionar imagem de poster para vídeo hero (`/brand/hero-poster.jpg`)
- [ ] Considerar usar múltiplas imagens por produto

**Tempo estimado:** 2-3 horas (dependendo do número de imagens)

---

### 7. **Refatorar Classes CSS Longas**
**Status:** Strings concatenadas muito longas (dificulta manutenção)

**Solução:**
- [ ] Criar arquivo `src/lib/cn.ts` (utilitário para className)
- [ ] Extrair estilos comuns para constantes
- [ ] Usar `clsx` e `tailwind-merge` (já instalado)

**Exemplo:**
```typescript
// src/lib/utils.ts
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Uso:
const btnBase = cn(
  'inline-flex items-center justify-center rounded-full px-4 py-2',
  'text-sm font-semibold transition'
);
```

**Tempo estimado:** 2 horas

---

### 8. **Adicionar Loading States**
**Status:** Sem feedback visual durante carregamento

**Tarefas:**
- [ ] Adicionar skeleton loaders para produtos
- [ ] Loading state para imagens
- [ ] Loading indicator para vídeo hero

**Tempo estimado:** 1-2 horas

---

## 🟢 BAIXA PRIORIDADE (Melhorias Futuras)

### 9. **Implementar Sistema de Filtros Avançado**
**Funcionalidades:**
- [ ] Filtro por preço (range slider)
- [ ] Filtro por disponibilidade (in stock)
- [ ] Filtro por entrega (fast delivery)
- [ ] Ordenação (price, name, popularity)

**Tempo estimado:** 4-5 horas

---

### 10. **Adicionar Página 404 Personalizada**
**Status:** Usa página 404 padrão do Next.js

**Ação:**
- [ ] Criar `app/not-found.tsx` com design consistente
- [ ] Adicionar link de volta para home/produtos

**Tempo estimado:** 30 minutos

---

### 11. **Implementar Analytics**
**Opções:**
- [ ] Google Analytics 4
- [ ] Vercel Analytics (se hospedado na Vercel)
- [ ] Eventos customizados (clicks em CTAs, visualizações de produto)

**Tempo estimado:** 2 horas

---

### 12. **Adicionar Testes**
**Status:** Nenhum teste configurado

**Tarefas:**
- [ ] Configurar Jest + React Testing Library
- [ ] Testes unitários para funções utilitárias
- [ ] Testes de integração para páginas principais
- [ ] Testes E2E com Playwright (opcional)

**Tempo estimado:** 6-8 horas (setup inicial)

---

### 13. **Melhorar Acessibilidade**
**Status:** Boas práticas básicas implementadas

**Melhorias:**
- [ ] Adicionar mais aria-labels onde necessário
- [ ] Melhorar contraste de cores (WCAG AA)
- [ ] Testar navegação apenas com teclado
- [ ] Adicionar skip links

**Tempo estimado:** 3-4 horas

---

### 14. **Implementar Busca de Produtos**
**Funcionalidades:**
- [ ] Barra de busca no header
- [ ] Busca por título, descrição, categoria
- [ ] Resultados em tempo real
- [ ] Página de resultados

**Tempo estimado:** 5-6 horas

---

### 15. **Adicionar Sistema de Favoritos/Wishlist**
**Funcionalidades:**
- [ ] Salvar favoritos no localStorage
- [ ] Indicador visual nos produtos
- [ ] Página de favoritos
- [ ] Compartilhar favoritos

**Tempo estimado:** 4-5 horas

---

### 16. **Integração com CMS**
**Status:** Dados hardcoded em `products.ts`

**Opções:**
- [ ] Sanity CMS
- [ ] Contentful
- [ ] Shopify Admin API (buscar produtos diretamente)
- [ ] Headless CMS customizado

**Tempo estimado:** 8-12 horas (dependendo da solução)

---

### 17. **Implementar Internacionalização (i18n)**
**Funcionalidades:**
- [ ] Suporte para múltiplos idiomas
- [ ] Troca de idioma
- [ ] Traduções de conteúdo

**Tempo estimado:** 6-8 horas

---

## 📊 Resumo por Prioridade

### Esta Semana (Alta Prioridade)
1. ✅ Criar páginas faltantes (delivery, about, contact, privacy, terms)
2. ✅ Atualizar URLs do Shopify
3. ✅ Adicionar mais produtos (pelo menos 10-15 produtos)

**Tempo total estimado:** 7-10 horas

### Próxima Sprint (Média Prioridade)
4. ✅ SEO avançado
5. ✅ Animações com Framer Motion
6. ✅ Melhorar gestão de imagens
7. ✅ Refatorar classes CSS

**Tempo total estimado:** 8-12 horas

### Backlog (Baixa Prioridade)
- Melhorias incrementais
- Funcionalidades avançadas
- Otimizações

---

## 🎯 Recomendação de Ordem de Execução

**Sprint 1 (Semana 1):**
1. Páginas faltantes (crítico - links quebrados)
2. Atualizar URLs Shopify
3. Adicionar mais produtos (conteúdo)

**Sprint 2 (Semana 2):**
4. SEO básico
5. Animações sutis
6. Refatoração de código

**Sprint 3 (Futuro):**
7. Funcionalidades avançadas
8. Otimizações
9. Testes

---

## 💡 Dicas Adicionais

### Para Começar Agora:
```bash
# 1. Criar estrutura de pastas para novas páginas
mkdir -p app/{delivery,about,contact,privacy,terms}

# 2. Começar pela página mais simples (About)
# 3. Depois Delivery (conteúdo mais estruturado)
# 4. Contact (pode ser apenas informações ou formulário simples)
# 5. Privacy e Terms (legais - podem precisar de review)
```

### Recursos Úteis:
- **Design System:** Reutilizar estilos de `app/layout.tsx`
- **Componentes:** Extrair componentes comuns se necessário
- **Conteúdo:** Preparar copy para cada página antes de implementar

### Perguntas a Responder:
- [ ] Qual o conteúdo exato para cada página?
- [ ] Precisa de formulário de contato ou apenas informações?
- [ ] Tem conteúdo legal pronto para Privacy/Terms?
- [ ] Quantos produtos adicionar inicialmente?

---

**Última atualização:** Agora  
**Próxima revisão:** Após completar Sprint 1
