# Motor de Roteirização

O motor inicial está em `src/lib/fuel-routing.ts` e foi separado da tela para facilitar a migração posterior para API.

## Interface conceitual

- Entrada: veículos, pedidos geocodificados e data.
- Saída: plano de rotas com veículos, paradas, ETAs, distância, duração, avisos e auditoria.
- Regra absoluta: nenhuma rota pode ultrapassar `capacidadeLitros`.

## Implementação atual

Como não há chave do Google configurada neste milestone, o motor usa uma heurística local de desenvolvimento:

- remove veículos inativos;
- prioriza pedidos urgentes/altos;
- distribui por capacidade remanescente e proximidade;
- ordena paradas por vizinho mais próximo;
- valida novamente todos os totais antes de retornar/aprovar.

Essa heurística não substitui distância rodoviária real. Ela existe para manter o fluxo executável até conectar Google Route Optimization API e Routes API.

## Testes cobertos

`npm test` valida:

- caminhão inativo não recebe pedido;
- CAM-03 permanece fora da roteirização;
- rotas respeitam capacidade rígida;
- movimentação manual bloqueia estouro de capacidade;
- aprovação roda validação final.
