# Sistema de Roteirização de Combustível

Projeto Lovable/TanStack Start para planejamento operacional de entregas de combustível com validação rígida de capacidade por caminhão.

## Status do milestone

Implementado neste commit:

- cadastro e ativação/desativação de caminhões;
- importação CSV com planilha modelo, prévia e validação;
- visualização de pedidos e status de geocodificação;
- geocodificação mock explícita;
- geração de roteirização com caminhões ativos;
- bloqueio de estouro de capacidade em litros;
- ordenação geográfica inicial;
- mapa operacional mock;
- aprovação com dupla validação local;
- documentação da arquitetura, Google Maps, banco e motor de rotas.

Pulado conforme solicitado:

- criação do app motorista;
- GPS;
- Google Navigation SDK.

## Lovable

Continue no editor:

[Lovable project](https://lovable.dev/projects/c157dbcb-fd1e-40dc-bf1b-f69630fd0094)

## Pré-requisitos

- Node.js 24 ou compatível com o projeto Lovable.
- npm.

## Instalação

```sh
npm install
```

## Variáveis de ambiente

Copie `.env.example` para `.env.local` quando for conectar integrações reais.

```sh
VITE_GOOGLE_MAPS_BROWSER_KEY=
GOOGLE_MAPS_SERVER_KEY=
GOOGLE_MAPS_MODE=mock
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/fuel_routes
```

## Desenvolvimento

```sh
npm run dev
```

## Build e testes

```sh
npm test
npm run typecheck
npm run build
```

## Google Cloud

APIs previstas para a próxima fase:

- Google Geocoding API
- Google Maps JavaScript API
- Google Routes API
- Google Route Optimization API
- Google Navigation SDK, somente quando retomarmos GPS

## Documentação

- `docs/architecture.md`
- `docs/google-maps.md`
- `docs/routing-engine.md`
- `docs/database.md`

## Observações

O mapa e a otimização estão em modo mock identificado porque ainda não há backend, banco ou chaves Google configuradas. A regra crítica de capacidade já está no motor local e coberta por teste.
