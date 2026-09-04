# Banco de Dados

O banco ainda não foi criado neste commit porque o repositório atual é apenas Lovable/TanStack Start. A modelagem abaixo deve orientar a próxima fase com PostgreSQL e Prisma.

## Entidades mínimas

- `User`
- `Driver`
- `Vehicle`
- `VehicleCompartment`
- `Customer`
- `Order`
- `RoutePlan`
- `Route`
- `RouteStop`
- `RouteAssignment`
- `VehicleLocation`
- `ImportBatch`
- `RoutingConfiguration`
- `RoutingAudit`

## Regras de modelagem

- Usar UUID como chave primária.
- Usar `createdAt` e `updatedAt` em todas as entidades.
- Indexar `Order.numeroPedido`, `Order.dataEntrega`, `Order.status`, `Vehicle.ativo`, `RoutePlan.data`.
- Persistir `latitude`, `longitude`, `placeId` e `geocodeStatus` nos pedidos.
- Guardar histórico de planos, resultados originais e alterações manuais.
- Registrar auditoria para importação, roteirização, alterações, aprovação e execução.

## Compartimentos

`VehicleCompartment` deve nascer independente do algoritmo:

- `id`
- `vehicleId`
- `numero`
- `capacidadeLitros`
- `produtoPermitido`
- `ativo`

A integração de compartimentos no otimizador fica para fase posterior.
