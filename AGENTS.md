# Instruções da storefront 801 Outlet

## Fonte de verdade obrigatória

Antes de planejar, editar, executar comandos mutáveis ou responder sobre implementação, leia integralmente a documentação canônica em:

`C:\dev\801-outelet-shop\docs`

Comece por `docs/README.md` e siga a ordem de leitura registrada ali. Esses documentos prevalecem sobre os arquivos de especificação antigos deste repositório quando houver conflito sobre a nova arquitetura Shopify headless.

Se um pedido alterar escopo, arquitetura ou uma decisão aprovada, registre primeiro a mudança em `C:\dev\801-outelet-shop\docs\10-decisoes-e-premissas.md` e atualize os documentos afetados.

## Papel deste repositório

- Este projeto é a base da storefront headless Next.js.
- Shopify é a fonte única de catálogo, estoque, clientes, carrinho, checkout, pagamentos e pedidos.
- Supabase e Square são legado temporário: não expandir seu uso e não removê-los antes de validar a equivalência Shopify definida no plano.
- O app administrativo incorporado será um projeto separado.

## Segurança e operação

- Nunca expor tokens privados Storefront/Admin no bundle do navegador.
- Usar versão fixada das APIs Shopify, documentos GraphQL tipados e tratamento de erros.
- Não alterar DNS, tema publicado ou produção sem aprovação explícita.
- Desenvolver de forma incremental em preview, seguindo os gates de `docs/09-plano-de-desenvolvimento.md`.
- Para toda mudança, executar lint, TypeScript, testes e build proporcionais ao risco.
