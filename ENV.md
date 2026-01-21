# Variáveis de Ambiente

Este projeto utiliza variáveis de ambiente para configurações que podem variar entre ambientes (desenvolvimento, produção, etc.).

## Configuração

1. Copie o arquivo `.env.example` para `.env.local` (ou crie manualmente):
   ```bash
   cp .env.example .env.local
   ```

2. Edite o arquivo `.env.local` com os valores corretos para seu ambiente.

## Variáveis Disponíveis

### `NEXT_PUBLIC_SHOPIFY_STORE_URL`

**Descrição:** URL base da loja Shopify (sem trailing slash)

**Exemplo:**
```
NEXT_PUBLIC_SHOPIFY_STORE_URL=https://801-outlet-furniture.myshopify.com
```

**Padrão:** `https://801-outlet-furniture.myshopify.com`

**Uso:** Utilizada para gerar links de redirecionamento para o Shopify com parâmetros UTM.

---

### `NEXT_PUBLIC_PHONE_E164`

**Descrição:** Número de telefone no formato E.164

**Exemplo:**
```
NEXT_PUBLIC_PHONE_E164=+1 385 201 6328
```

**Padrão:** `+1 385 201 6328`

**Formato:** Deve seguir o padrão E.164: `+[código do país][número]` (sem espaços ou caracteres especiais)

**Uso:** Utilizado para gerar links `tel:` para chamadas diretas.

---

## Como Funciona

As variáveis são lidas através do arquivo `src/config/env.ts`, que:

1. Valida se as variáveis estão definidas
2. Fornece valores padrão se não estiverem definidas
3. Exporta funções utilitárias para gerar URLs e links formatados

### Exemplo de Uso

```typescript
import { env } from '@/src/config/env';

// Obter URL do Shopify com parâmetros UTM
const shopifyUrl = env.getShopifyUrl('', 'brand_site', 'hero', 'shop_redirect');

// Obter link de telefone formatado
const phoneHref = env.getPhoneHref();
```

## Notas Importantes

- Variáveis que começam com `NEXT_PUBLIC_` são expostas ao cliente (browser)
- Nunca commite arquivos `.env.local` ou `.env` no repositório
- O arquivo `.env.local` já está no `.gitignore` por padrão
- Para produção, configure as variáveis diretamente na plataforma de hospedagem (Vercel, etc.)
