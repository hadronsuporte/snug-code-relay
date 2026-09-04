import assert from "node:assert/strict";

import {
  approveRoutePlan,
  buildRoutePlan,
  geocodeOrdersMock,
  moveOrderBetweenRoutes,
  seedOrders,
  seedVehicles,
  validateRouteCapacities,
} from "./fuel-routing.ts";

const plan = buildRoutePlan(seedVehicles, geocodeOrdersMock(seedOrders));

assert.equal(plan.unassigned.length, 0, "all development orders should be assigned");
assert.ok(plan.routes.length > 0, "at least one active vehicle must be used");
assert.ok(
  plan.routes.every((route) => route.vehicle.ativo),
  "inactive vehicles must never receive orders",
);
assert.ok(
  plan.routes.every((route) => route.vehicle.codigo !== "CAM-03"),
  "CAM-03 is inactive and must not receive orders",
);
assert.ok(
  plan.routes.every((route) => route.litros <= route.vehicle.capacidadeLitros),
  "routes must respect hard fuel-liter capacity",
);

validateRouteCapacities(plan.routes);

const sourceRoute = plan.routes.find((route) => route.vehicle.codigo === "CAM-02");
const targetRoute = plan.routes.find((route) => route.vehicle.codigo === "CAM-01");
const heavyStop = sourceRoute?.stops.find((stop) => stop.order.litros >= 5000);

if (sourceRoute && targetRoute && heavyStop) {
  const result = moveOrderBetweenRoutes(plan, heavyStop.order.id, targetRoute.id);
  assert.ok(result.error, "manual movement must block capacity overflow");
}

const approved = approveRoutePlan(plan, "Teste automatizado");
assert.equal(approved.status, "APROVADA", "approval should mark the plan as approved");

console.log("fuel-routing checks passed");
