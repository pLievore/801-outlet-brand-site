# Variáveis de Ambiente

Este projeto utiliza variáveis de ambiente para integrações (Supabase, Square, Resend) e configuração do site.

## Setup

1. Copie `env.example` para `.env.local`:
   ```bash
   cp env.example .env.local
   ```
2. Preencha cada chave com os valores do seu ambiente (sandbox para dev).

## Variáveis

### App

| Variável | Pública? | Descrição | Padrão |
|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | sim | URL canônica do site | `https://801outlet.com` |
| `NEXT_PUBLIC_PHONE_E164` | sim | Telefone em E.164 | `+13852016328` |

### Manutenção

| Variável | Pública? | Descrição | Padrão |
|---|---|---|---|
| `MAINTENANCE_MODE` | não | `1`/`true`/`on` bloqueia todas as rotas públicas com HTTP 503 e a página de manutenção. Qualquer outro valor (ou ausente) mantém o site no ar | desligado |
| `MAINTENANCE_BYPASS_TOKEN` | não | Segredo aleatório que libera o site normal via `?preview=<token>` enquanto o bloqueio está ligado. Sem ele, não há bypass | — |

O bloqueio é lido em build time e inlined no bundle do edge: **ligar ou desligar exige redeploy** (mudar a env no Vercel e redeploy, ~1 min). `/admin`, `/api/webhooks/*`, `/api/internal/*`, `robots.txt` e `sitemap.xml` continuam acessíveis durante a manutenção.

### Shopify Headless

| Variável | Pública? | Descrição |
|---|---|---|
| `SHOPIFY_STORE_DOMAIN` | não | Domínio canônico `myshopify.com` |
| `SHOPIFY_STOREFRONT_API_VERSION` | não | Versão fixada da Storefront API |
| `SHOPIFY_STOREFRONT_PRIVATE_ACCESS_TOKEN` | **não** | Token privado server-side do Headless channel |
| `SHOPIFY_REVALIDATION_SECRET` | **não** | Segredo aleatório de no mínimo 32 caracteres compartilhado somente entre o app Admin e o endpoint interno de revalidação |
| `SHOPIFY_HEADLESS_PUBLICATION_ID` | não | GID do canal de venda que serve a storefront (`gid://shopify/Publication/...`). Produto não publicado nesse canal é **invisível para o site mesmo estando ACTIVE**. Sem a variável, produtos criados pelo painel não são publicados automaticamente. Ver `npm run publish:channel` |
| `SHOPIFY_SHOP_ID` | não | ID numérico da loja, usado nos endpoints do Customer Account API |
| `SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID` | não | Client ID público (PKCE) do Customer Account API no canal Headless; sem client secret |

### Database / Auth legado (Supabase)

| Variável | Pública? | Descrição |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | sim | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | sim | Chave anônima (RLS aplicado) |
| `SUPABASE_SERVICE_ROLE_KEY` | **não** | Chave de service role — somente server-side |

### Pagamento (Square Hosted Checkout)

| Variável | Descrição |
|---|---|
| `SQUARE_ACCESS_TOKEN` | Token da API |
| `SQUARE_LOCATION_ID` | ID da localização da conta |
| `SQUARE_ENVIRONMENT` | `sandbox` ou `production` |
| `SQUARE_WEBHOOK_SIGNATURE_KEY` | Chave para validar assinatura do webhook |

### Email (Resend)

| Variável | Descrição |
|---|---|
| `RESEND_API_KEY` | Chave da API Resend |
| `EMAIL_FROM` | Endereço verificado de envio (ex: `orders@801outlet.com`) |

### Admin

| Variável | Descrição |
|---|---|
| `ADMIN_ALLOWED_EMAILS` | Lista separada por vírgula de e-mails autorizados ao painel admin |

### Google Drive — seletor de fotos do painel

| Variável | Pública? | Descrição |
|---|---|---|
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | sim | OAuth client ID (tipo *Web application*) do projeto Google Cloud |
| `NEXT_PUBLIC_GOOGLE_API_KEY` | sim | API key restrita à *Google Picker API* e às origens do site |
| `NEXT_PUBLIC_GOOGLE_PROJECT_NUMBER` | sim | **Número** do projeto (não o ID), exigido pelo `setAppId` do Picker |

As três valem em conjunto: faltando qualquer uma, o botão *Choose from Drive* simplesmente não aparece e o upload por arquivo segue funcionando. São públicas por natureza — vão para o JavaScript do painel; o sigilo do valor não protege nada.

> **A API key não pode ter restrição de sites.** Quem valida essa chave é o backend do `docs.google.com/picker`, não o browser — nessa checagem não existe o referer do nosso site, e uma chave restrita por origem é recusada com a mensagem enganosa *"The API developer key is invalid"*. Em **Restrições do aplicativo** ela precisa ficar em **Nenhum**.
>
> A proteção dela é outra: manter **Restrições da API** limitada à *Google Picker API*. A chave só autoriza abrir a interface do Picker e **não dá acesso a dado nenhum** — quem libera as fotos é o token OAuth do operador, com escopo `drive.file`, limitado ao que ele seleciona e vivo apenas na aba.

O client ID é diferente: as **Authorized JavaScript origins** dele funcionam normalmente e devem continuar restritas ao domínio do site.

O client ID e o número do projeto **precisam ser do mesmo projeto** no Google Cloud: é assim que o `drive.file` associa os arquivos escolhidos ao app. O escopo pedido é apenas `https://www.googleapis.com/auth/drive.file`, que dá acesso somente ao que o operador seleciona no Picker — nunca ao Drive inteiro. O token fica em memória no browser e **nunca chega ao servidor**.

Como toda `NEXT_PUBLIC_*`, são inlined em build time: configurar no Vercel **exige redeploy**.

## Notas

- Variáveis com prefixo `NEXT_PUBLIC_` são expostas ao browser. Não use esse prefixo em chaves secretas.
- `.env.local` está no `.gitignore`. Em produção, configure direto no Vercel.
- Em dev local, use o ambiente `sandbox` do Square. O webhook precisa ser exposto com ngrok ou similar.
