# Arquitetura

Este repositório começou como um app Lovable/TanStack Start. Para manter o projeto executável no Lovable, o primeiro milestone foi implementado dentro do frontend existente, com a lógica de domínio isolada em `src/lib/fuel-routing.ts`.

## Milestone atual

- Cadastro e ativação/desativação de caminhões.
- Importação CSV com prévia e validação.
- Geocodificação em modo mock explícito.
- Roteirização local com limite rígido por capacidade em litros.
- Ordenação geográfica das paradas em modo de desenvolvimento.
- Visualização operacional em mapa mock.
- Aprovação com dupla validação de capacidade.

## Fora deste commit

- Criação do app motorista.
- GPS e Google Navigation SDK.
- Backend NestJS, PostgreSQL e Prisma.
- Integrações reais com APIs pagas do Google.

## Próxima evolução sugerida

1. Extrair `src/lib/fuel-routing.ts` para um pacote compartilhado.
2. Criar `apps/api` com NestJS, Prisma e PostgreSQL.
3. Criar migrations para as entidades documentadas em `docs/database.md`.
4. Substituir o mock por adapters reais de Google Geocoding, Routes e Route Optimization.
5. Só depois iniciar o app motorista sem navegação GPS, mantendo Navigation SDK para fase posterior.
