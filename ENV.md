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

### Database / Auth (Supabase)

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

## Notas

- Variáveis com prefixo `NEXT_PUBLIC_` são expostas ao browser. Não use esse prefixo em chaves secretas.
- `.env.local` está no `.gitignore`. Em produção, configure direto no Vercel.
- Em dev local, use o ambiente `sandbox` do Square. O webhook precisa ser exposto com ngrok ou similar.
