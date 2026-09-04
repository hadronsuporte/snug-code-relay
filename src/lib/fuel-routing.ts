export type GeocodeStatus = "PENDENTE" | "GEOCODIFICADO" | "ERRO" | "REVISAR";

export type OrderStatus =
  | "IMPORTADO"
  | "AGUARDANDO_ROTEIRIZACAO"
  | "ROTEIRIZADO"
  | "CARREGAMENTO"
  | "EM_ROTA"
  | "ENTREGUE"
  | "NAO_ENTREGUE"
  | "CANCELADO";

export type Priority = "BAIXA" | "NORMAL" | "ALTA" | "URGENTE";

export type RoutePlanStatus =
  "RASCUNHO" | "OTIMIZADA" | "EM_REVISAO" | "APROVADA" | "EM_EXECUCAO" | "FINALIZADA";

export type Vehicle = {
  id: string;
  codigo: string;
  placa: string;
  descricao: string;
  capacidadeLitros: number;
  ativo: boolean;
  baseSaida: string;
  baseRetorno: string;
  latitudeBase: number;
  longitudeBase: number;
  motoristaPadrao: string;
  observacoes?: string | undefined;
  pesoMaximo?: number | undefined;
  altura?: number | undefined;
  largura?: number | undefined;
  comprimento?: number | undefined;
  quantidadeCompartimentos?: number | undefined;
  custoPorKm?: number | undefined;
  custoFixoUso?: number | undefined;
  tempoMaximoRota?: number | undefined;
  distanciaMaximaDia?: number | undefined;
};

export type DeliveryOrder = {
  id: string;
  numeroPedido: string;
  cliente: string;
  documentoCliente?: string | undefined;
  endereco: string;
  numero: string;
  complemento?: string | undefined;
  bairro: string;
  cep: string;
  cidade: string;
  uf: string;
  latitude?: number | undefined;
  longitude?: number | undefined;
  placeId?: string | undefined;
  geocodeStatus: GeocodeStatus;
  litros: number;
  valor: number;
  produto: string;
  dataEntrega: string;
  prioridade: Priority;
  status: OrderStatus;
  observacao?: string | undefined;
  tempoEstimadoDescarga: number;
  rotaId?: string | undefined;
  veiculoId?: string | undefined;
};

export type RouteStop = {
  order: DeliveryOrder;
  sequencia: number;
  eta: string;
  litrosRestantes: number;
  distanciaDesdeAnteriorKm: number;
  duracaoDesdeAnteriorMin: number;
};

export type PlannedRoute = {
  id: string;
  vehicle: Vehicle;
  stops: RouteStop[];
  litros: number;
  ocupacao: number;
  distanciaKm: number;
  duracaoMin: number;
  saidaPrevista: string;
  polyline: Array<{ lat: number; lng: number }>;
};

export type RoutePlan = {
  id: string;
  status: RoutePlanStatus;
  data: string;
  routes: PlannedRoute[];
  unassigned: Array<{ order: DeliveryOrder; reason: string }>;
  warnings: string[];
  audit: string[];
};

export type ImportIssue = {
  row: number;
  field: string;
  message: string;
};

export type ImportPreview = {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  issues: ImportIssue[];
  orders: DeliveryOrder[];
};

export const routingConfiguration = {
  priorizarMenorDistancia: true,
  priorizarMenorTempo: true,
  priorizarMenosCaminhoes: true,
  priorizarMaiorOcupacao: true,
  ocupacaoMinimaDesejada: 0.8,
  retornoObrigatorioBase: true,
  horarioInicial: "07:30",
  tempoPadraoDescargaMin: 22,
};

export const seedVehicles: Vehicle[] = [
  {
    id: "veh-cam-01",
    codigo: "CAM-01",
    placa: "ABC1D23",
    descricao: "Truck 10 mil litros",
    capacidadeLitros: 10000,
    ativo: true,
    baseSaida: "Base Sao Carlos/SP",
    baseRetorno: "Base Sao Carlos/SP",
    latitudeBase: -22.0167,
    longitudeBase: -47.8908,
    motoristaPadrao: "Marcos Silva",
    quantidadeCompartimentos: 2,
  },
  {
    id: "veh-cam-02",
    codigo: "CAM-02",
    placa: "DEF4G56",
    descricao: "Truck 15 mil litros",
    capacidadeLitros: 15000,
    ativo: true,
    baseSaida: "Base Sao Carlos/SP",
    baseRetorno: "Base Sao Carlos/SP",
    latitudeBase: -22.0167,
    longitudeBase: -47.8908,
    motoristaPadrao: "Joao Pereira",
    quantidadeCompartimentos: 3,
  },
  {
    id: "veh-cam-03",
    codigo: "CAM-03",
    placa: "GHI7J89",
    descricao: "Carreta 30 mil litros",
    capacidadeLitros: 30000,
    ativo: false,
    baseSaida: "Base Sao Carlos/SP",
    baseRetorno: "Base Sao Carlos/SP",
    latitudeBase: -22.0167,
    longitudeBase: -47.8908,
    motoristaPadrao: "Ana Costa",
    observacoes: "Inativo para validar criterio de aceite",
    quantidadeCompartimentos: 5,
  },
];

export const cityCoordinates: Record<string, { lat: number; lng: number }> = {
  "SAO CARLOS": { lat: -22.0167, lng: -47.8908 },
  ARARAQUARA: { lat: -21.7845, lng: -48.178 },
  MATAO: { lat: -21.6025, lng: -48.365 },
  "RIBEIRAO PRETO": { lat: -21.1775, lng: -47.8103 },
  SERTAOZINHO: { lat: -21.1378, lng: -47.9903 },
  JABOTICABAL: { lat: -21.2547, lng: -48.3222 },
  "RIO CLARO": { lat: -22.4114, lng: -47.5614 },
};

export const seedOrders: DeliveryOrder[] = [
  makeOrder("PED-1001", "Posto Central Sao Carlos", "Sao Carlos", "SP", 3500, "NORMAL"),
  makeOrder("PED-1002", "Cliente Araraquara Norte", "Araraquara", "SP", 4000, "ALTA"),
  makeOrder("PED-1003", "Posto Matao Leste", "Matao", "SP", 3250, "NORMAL"),
  makeOrder("PED-1004", "Cliente Ribeirao", "Ribeirao Preto", "SP", 5000, "URGENTE"),
  makeOrder("PED-1005", "Posto Sertaozinho", "Sertaozinho", "SP", 3000, "ALTA"),
  makeOrder("PED-1006", "Cliente Jaboticabal", "Jaboticabal", "SP", 2750, "NORMAL"),
  makeOrder("PED-1007", "Posto Rio Claro", "Rio Claro", "SP", 2200, "BAIXA"),
];

export const sampleCsv = [
  "PEDIDO;CLIENTE;DOCUMENTO;ENDERECO;NUMERO;COMPLEMENTO;BAIRRO;CEP;CIDADE;UF;LITROS;VALOR;PRODUTO;DATA_ENTREGA;PRIORIDADE;OBSERVACAO",
  "PED-2001;Posto Modelo A;00.000.000/0001-01;Rua Teste;100;;Centro;13560-000;Sao Carlos;SP;3500;21500;Diesel S10;2026-09-04;NORMAL;Dados ficticios",
  "PED-2002;Cliente Modelo B;00.000.000/0001-02;Avenida Teste;250;;Industrial;14800-000;Araraquara;SP;4200;25800;Diesel S500;2026-09-04;ALTA;Dados ficticios",
  "PED-2003;Posto Modelo C;00.000.000/0001-03;Rua Exemplo;88;;Centro;15990-000;Matao;SP;2800;17100;Gasolina;2026-09-04;NORMAL;Dados ficticios",
].join("\n");

function makeOrder(
  numeroPedido: string,
  cliente: string,
  cidade: string,
  uf: string,
  litros: number,
  prioridade: Priority,
): DeliveryOrder {
  const key = normalizeCity(cidade);
  const base = cityCoordinates[key];
  return {
    id: `ord-${numeroPedido.toLowerCase()}`,
    numeroPedido,
    cliente,
    documentoCliente: "00.000.000/0001-00",
    endereco: "Endereco ficticio de desenvolvimento",
    numero: "100",
    bairro: "Centro",
    cep: "13560-000",
    cidade,
    uf,
    latitude: base?.lat,
    longitude: base?.lng,
    placeId: base ? `mock-place-${key.toLowerCase().replaceAll(" ", "-")}` : undefined,
    geocodeStatus: base ? "GEOCODIFICADO" : "PENDENTE",
    litros,
    valor: litros * 5.9,
    produto: "Diesel S10",
    dataEntrega: "2026-09-04",
    prioridade,
    status: "AGUARDANDO_ROTEIRIZACAO",
    observacao: "Pedido ficticio para desenvolvimento",
    tempoEstimadoDescarga: routingConfiguration.tempoPadraoDescargaMin,
  };
}

export function parseOrdersCsv(text: string, existingOrders: DeliveryOrder[] = []): ImportPreview {
  const lines = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return {
      totalRows: 0,
      validRows: 0,
      invalidRows: 0,
      issues: [{ row: 1, field: "arquivo", message: "Arquivo sem linhas de pedidos." }],
      orders: [],
    };
  }

  const delimiter = count(lines[0] ?? "", ";") >= count(lines[0] ?? "", ",") ? ";" : ",";
  const headers = splitCsvLine(lines[0] ?? "", delimiter).map(normalizeHeader);
  const knownOrders = new Set(existingOrders.map((order) => order.numeroPedido.toUpperCase()));
  const seenInFile = new Set<string>();
  const issues: ImportIssue[] = [];
  const orders: DeliveryOrder[] = [];

  lines.slice(1).forEach((line, index) => {
    const rowNumber = index + 2;
    const values = splitCsvLine(line, delimiter);
    const row = Object.fromEntries(
      headers.map((header, column) => [header, values[column]?.trim() ?? ""]),
    );
    const rowIssues = validateImportRow(row, rowNumber, knownOrders, seenInFile);

    if (rowIssues.length > 0) {
      issues.push(...rowIssues);
      return;
    }

    const priority = normalizePriority(valueOf(row, "PRIORIDADE"));
    const numeroPedido = valueOf(row, "PEDIDO");
    const order: DeliveryOrder = {
      id: `ord-${numeroPedido.toLowerCase().replace(/[^a-z0-9-]/g, "-")}`,
      numeroPedido,
      cliente: valueOf(row, "CLIENTE"),
      documentoCliente: valueOf(row, "DOCUMENTO"),
      endereco: valueOf(row, "ENDERECO"),
      numero: valueOf(row, "NUMERO"),
      complemento: valueOf(row, "COMPLEMENTO") || undefined,
      bairro: valueOf(row, "BAIRRO"),
      cep: valueOf(row, "CEP"),
      cidade: valueOf(row, "CIDADE"),
      uf: valueOf(row, "UF").toUpperCase(),
      geocodeStatus: "PENDENTE",
      litros: Number(valueOf(row, "LITROS").replace(",", ".")),
      valor: Number(valueOf(row, "VALOR").replace(",", ".")),
      produto: valueOf(row, "PRODUTO") || "Combustivel",
      dataEntrega: valueOf(row, "DATA_ENTREGA") || "2026-09-04",
      prioridade: priority,
      status: "IMPORTADO",
      observacao: valueOf(row, "OBSERVACAO"),
      tempoEstimadoDescarga: routingConfiguration.tempoPadraoDescargaMin,
    };

    seenInFile.add(order.numeroPedido.toUpperCase());
    orders.push(order);
  });

  return {
    totalRows: lines.length - 1,
    validRows: orders.length,
    invalidRows: issues.length === 0 ? 0 : new Set(issues.map((issue) => issue.row)).size,
    issues,
    orders,
  };
}

export function geocodeOrdersMock(orders: DeliveryOrder[]): DeliveryOrder[] {
  return orders.map((order, index) => {
    if (order.latitude && order.longitude && order.geocodeStatus === "GEOCODIFICADO") {
      return order;
    }

    const coordinates = cityCoordinates[normalizeCity(order.cidade)];
    if (!coordinates) {
      return { ...order, geocodeStatus: "REVISAR" };
    }

    const jitter = (index % 5) * 0.007;
    return {
      ...order,
      latitude: coordinates.lat + jitter,
      longitude: coordinates.lng - jitter,
      placeId: `mock-place-${normalizeCity(order.cidade).toLowerCase().replaceAll(" ", "-")}`,
      geocodeStatus: "GEOCODIFICADO",
      status: "AGUARDANDO_ROTEIRIZACAO",
    };
  });
}

export function buildRoutePlan(
  vehicles: Vehicle[],
  orders: DeliveryOrder[],
  data = "2026-09-04",
): RoutePlan {
  const eligibleOrders = orders.filter(
    (order) =>
      order.status !== "CANCELADO" &&
      order.geocodeStatus === "GEOCODIFICADO" &&
      typeof order.latitude === "number" &&
      typeof order.longitude === "number",
  );
  const activeVehicles = vehicles
    .filter((vehicle) => vehicle.ativo)
    .sort((a, b) => b.capacidadeLitros - a.capacidadeLitros);
  const totalLiters = sum(eligibleOrders.map((order) => order.litros));
  const totalCapacity = sum(activeVehicles.map((vehicle) => vehicle.capacidadeLitros));
  const warnings: string[] = [];
  const audit = [
    "GPS/Navigation SDK fora do escopo deste commit por solicitacao do operador.",
    "Capacidade validada localmente antes e depois da distribuicao.",
  ];

  if (activeVehicles.length === 0) {
    return {
      id: `plan-${Date.now()}`,
      status: "RASCUNHO",
      data,
      routes: [],
      unassigned: eligibleOrders.map((order) => ({ order, reason: "Nenhum caminhao ativo." })),
      warnings: ["Nao existem caminhoes ativos para roteirizacao."],
      audit,
    };
  }

  if (totalCapacity < totalLiters) {
    warnings.push(
      "Capacidade disponivel insuficiente para transportar todos os pedidos em uma unica rodada.",
    );
  }

  const routeDrafts = activeVehicles.map((vehicle) => ({
    id: `route-${vehicle.id}`,
    vehicle,
    orders: [] as DeliveryOrder[],
    litros: 0,
  }));
  const sortedOrders = [...eligibleOrders].sort(compareByPriorityAndSweep(activeVehicles[0]!));
  const unassigned: RoutePlan["unassigned"] = [];

  sortedOrders.forEach((order) => {
    const candidates = routeDrafts
      .filter((route) => route.litros + order.litros <= route.vehicle.capacidadeLitros)
      .map((route) => ({
        route,
        score: routeAssignmentScore(
          route,
          order,
          remainingAssignableLiters(sortedOrders, order.id),
        ),
      }))
      .sort((a, b) => a.score - b.score);

    const selected = candidates[0]?.route;
    if (!selected) {
      unassigned.push({
        order,
        reason: `Pedido excede a capacidade disponivel dos caminhoes ativos em ${formatLiters(order.litros)}.`,
      });
      return;
    }

    selected.orders.push({
      ...order,
      veiculoId: selected.vehicle.id,
      rotaId: selected.id,
      status: "ROTEIRIZADO",
    });
    selected.litros += order.litros;
  });

  const routes = routeDrafts
    .filter((route) => route.orders.length > 0)
    .map((route) => buildPlannedRoute(route.id, route.vehicle, route.orders));

  validateRouteCapacities(routes);

  return {
    id: `plan-${Date.now()}`,
    status: unassigned.length > 0 ? "EM_REVISAO" : "OTIMIZADA",
    data,
    routes,
    unassigned,
    warnings,
    audit,
  };
}

export function moveOrderBetweenRoutes(
  plan: RoutePlan,
  orderId: string,
  targetRouteId: string,
): { plan: RoutePlan; error?: string } {
  const sourceRoute = plan.routes.find((route) =>
    route.stops.some((stop) => stop.order.id === orderId),
  );
  const targetRoute = plan.routes.find((route) => route.id === targetRouteId);
  const movingStop = sourceRoute?.stops.find((stop) => stop.order.id === orderId);

  if (!sourceRoute || !targetRoute || !movingStop) {
    return { plan, error: "Pedido ou rota nao encontrado." };
  }

  const projectedLiters = targetRoute.litros + movingStop.order.litros;
  if (sourceRoute.id !== targetRoute.id && projectedLiters > targetRoute.vehicle.capacidadeLitros) {
    const excess = projectedLiters - targetRoute.vehicle.capacidadeLitros;
    return {
      plan,
      error: `Nao e possivel mover este pedido. A capacidade do veiculo seria excedida em ${formatLiters(excess)}.`,
    };
  }

  const rebuilt = plan.routes.map((route) => {
    if (route.id === sourceRoute.id) {
      const remaining = route.stops
        .filter((stop) => stop.order.id !== orderId)
        .map((stop) => stop.order);
      return buildPlannedRoute(route.id, route.vehicle, remaining);
    }

    if (route.id === targetRoute.id) {
      return buildPlannedRoute(route.id, route.vehicle, [
        ...route.stops.map((stop) => stop.order),
        movingStop.order,
      ]);
    }

    return route;
  });

  const cleaned = rebuilt.filter((route) => route.stops.length > 0);
  validateRouteCapacities(cleaned);

  return {
    plan: {
      ...plan,
      status: plan.status === "APROVADA" ? "EM_REVISAO" : plan.status,
      routes: cleaned,
      audit: [...plan.audit, `Pedido ${movingStop.order.numeroPedido} movido manualmente.`],
    },
  };
}

export function approveRoutePlan(plan: RoutePlan, user = "Operador"): RoutePlan {
  validateRouteCapacities(plan.routes);
  return {
    ...plan,
    status: "APROVADA",
    audit: [...plan.audit, `Rota aprovada por ${user} em ${new Date().toISOString()}.`],
  };
}

export function validateRouteCapacities(routes: PlannedRoute[]): void {
  routes.forEach((route) => {
    const litros = sum(route.stops.map((stop) => stop.order.litros));
    if (litros > route.vehicle.capacidadeLitros) {
      throw new Error(
        `${route.vehicle.codigo} excedeu capacidade: ${litros} > ${route.vehicle.capacidadeLitros}`,
      );
    }
  });
}

export function formatLiters(value: number): string {
  return `${new Intl.NumberFormat("pt-BR").format(Math.round(value))} L`;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remaining = Math.round(minutes % 60);
  return hours > 0 ? `${hours}h${String(remaining).padStart(2, "0")}` : `${remaining} min`;
}

function buildPlannedRoute(id: string, vehicle: Vehicle, orders: DeliveryOrder[]): PlannedRoute {
  const sorted = nearestNeighborSort(vehicle, orders);
  let remainingLiters = sum(sorted.map((order) => order.litros));
  let cursor = { lat: vehicle.latitudeBase, lng: vehicle.longitudeBase };
  let elapsed = 0;

  const stops = sorted.map((order, index) => {
    const next = {
      lat: order.latitude ?? vehicle.latitudeBase,
      lng: order.longitude ?? vehicle.longitudeBase,
    };
    const legDistance = roadDistanceEstimateKm(cursor, next);
    const legDuration = Math.round((legDistance / 54) * 60);
    elapsed += legDuration + order.tempoEstimadoDescarga;
    remainingLiters -= order.litros;
    cursor = next;

    return {
      order,
      sequencia: index + 1,
      eta: addMinutes(routingConfiguration.horarioInicial, elapsed),
      litrosRestantes: remainingLiters,
      distanciaDesdeAnteriorKm: legDistance,
      duracaoDesdeAnteriorMin: legDuration,
    };
  });

  const returnDistance = routingConfiguration.retornoObrigatorioBase
    ? roadDistanceEstimateKm(cursor, { lat: vehicle.latitudeBase, lng: vehicle.longitudeBase })
    : 0;
  const distance = sum(stops.map((stop) => stop.distanciaDesdeAnteriorKm)) + returnDistance;
  const duration =
    sum(stops.map((stop) => stop.duracaoDesdeAnteriorMin + stop.order.tempoEstimadoDescarga)) +
    Math.round((returnDistance / 54) * 60);
  const litros = sum(stops.map((stop) => stop.order.litros));

  return {
    id,
    vehicle,
    stops,
    litros,
    ocupacao: litros / vehicle.capacidadeLitros,
    distanciaKm: distance,
    duracaoMin: duration,
    saidaPrevista: routingConfiguration.horarioInicial,
    polyline: [
      { lat: vehicle.latitudeBase, lng: vehicle.longitudeBase },
      ...stops.map((stop) => ({
        lat: stop.order.latitude ?? vehicle.latitudeBase,
        lng: stop.order.longitude ?? vehicle.longitudeBase,
      })),
      ...(routingConfiguration.retornoObrigatorioBase
        ? [{ lat: vehicle.latitudeBase, lng: vehicle.longitudeBase }]
        : []),
    ],
  };
}

function routeAssignmentScore(
  route: { vehicle: Vehicle; orders: DeliveryOrder[]; litros: number },
  order: DeliveryOrder,
  remainingLitersAfterOrder: number,
): number {
  const point = {
    lat: order.latitude ?? route.vehicle.latitudeBase,
    lng: order.longitude ?? route.vehicle.longitudeBase,
  };
  const reference =
    route.orders.length > 0
      ? centroid(route.orders)
      : { lat: route.vehicle.latitudeBase, lng: route.vehicle.longitudeBase };
  const distanceScore = roadDistanceEstimateKm(reference, point);
  const remainingAfter = route.vehicle.capacidadeLitros - route.litros - order.litros;
  const emptyTruckPenalty = route.orders.length === 0 && route.litros === 0 ? 8 : 0;
  const reserveLargeVehicleBonus =
    route.orders.length === 0 && remainingLitersAfterOrder > 0
      ? route.vehicle.capacidadeLitros / -1200
      : 0;
  const capacityTrapPenalty =
    remainingLitersAfterOrder > 0 && remainingAfter < Math.min(2200, remainingLitersAfterOrder)
      ? 45
      : 0;
  const occupancyScore = Math.abs(remainingAfter / route.vehicle.capacidadeLitros - 0.18) * 16;

  return (
    distanceScore +
    emptyTruckPenalty +
    occupancyScore +
    capacityTrapPenalty +
    reserveLargeVehicleBonus
  );
}

function nearestNeighborSort(vehicle: Vehicle, orders: DeliveryOrder[]): DeliveryOrder[] {
  const pending = [...orders];
  const sorted: DeliveryOrder[] = [];
  let cursor = { lat: vehicle.latitudeBase, lng: vehicle.longitudeBase };

  while (pending.length > 0) {
    const next = pending
      .map((order, index) => ({
        order,
        index,
        score: roadDistanceEstimateKm(cursor, {
          lat: order.latitude ?? vehicle.latitudeBase,
          lng: order.longitude ?? vehicle.longitudeBase,
        }),
      }))
      .sort((a, b) => a.score - b.score)[0];

    if (!next) break;
    sorted.push(next.order);
    pending.splice(next.index, 1);
    cursor = {
      lat: next.order.latitude ?? vehicle.latitudeBase,
      lng: next.order.longitude ?? vehicle.longitudeBase,
    };
  }

  return sorted;
}

function compareByPriorityAndSweep(baseVehicle: Vehicle) {
  const priorityWeight: Record<Priority, number> = {
    URGENTE: 4,
    ALTA: 3,
    NORMAL: 2,
    BAIXA: 1,
  };

  return (a: DeliveryOrder, b: DeliveryOrder) => {
    const priorityDiff = priorityWeight[b.prioridade] - priorityWeight[a.prioridade];
    if (priorityDiff !== 0) return priorityDiff;

    const angleA = Math.atan2(
      (a.latitude ?? 0) - baseVehicle.latitudeBase,
      (a.longitude ?? 0) - baseVehicle.longitudeBase,
    );
    const angleB = Math.atan2(
      (b.latitude ?? 0) - baseVehicle.latitudeBase,
      (b.longitude ?? 0) - baseVehicle.longitudeBase,
    );
    return angleA - angleB;
  };
}

function validateImportRow(
  row: Record<string, string>,
  rowNumber: number,
  knownOrders: Set<string>,
  seenInFile: Set<string>,
): ImportIssue[] {
  const issues: ImportIssue[] = [];
  const required = [
    "PEDIDO",
    "CLIENTE",
    "ENDERECO",
    "NUMERO",
    "BAIRRO",
    "CEP",
    "CIDADE",
    "UF",
    "LITROS",
  ];

  required.forEach((field) => {
    if (!valueOf(row, field)) {
      issues.push({ row: rowNumber, field, message: "Campo obrigatorio." });
    }
  });

  const pedido = valueOf(row, "PEDIDO");
  if (pedido && (knownOrders.has(pedido.toUpperCase()) || seenInFile.has(pedido.toUpperCase()))) {
    issues.push({ row: rowNumber, field: "PEDIDO", message: "Pedido duplicado." });
  }

  const cep = valueOf(row, "CEP");
  if (cep && !/^\d{5}-?\d{3}$/.test(cep)) {
    issues.push({ row: rowNumber, field: "CEP", message: "CEP invalido." });
  }

  const uf = valueOf(row, "UF");
  if (uf && !/^[A-Za-z]{2}$/.test(uf)) {
    issues.push({ row: rowNumber, field: "UF", message: "UF deve possuir 2 letras." });
  }

  const liters = Number(valueOf(row, "LITROS").replace(",", "."));
  if (!Number.isFinite(liters) || liters <= 0) {
    issues.push({ row: rowNumber, field: "LITROS", message: "Quantidade de litros invalida." });
  }

  const prioridade = valueOf(row, "PRIORIDADE");
  if (prioridade && !["BAIXA", "NORMAL", "ALTA", "URGENTE"].includes(prioridade.toUpperCase())) {
    issues.push({ row: rowNumber, field: "PRIORIDADE", message: "Prioridade invalida." });
  }

  return issues;
}

function remainingAssignableLiters(orders: DeliveryOrder[], currentOrderId: string): number {
  const currentIndex = orders.findIndex((order) => order.id === currentOrderId);
  if (currentIndex < 0) return 0;

  return sum(orders.slice(currentIndex + 1).map((order) => order.litros));
}

function valueOf(row: Record<string, string>, key: string): string {
  return row[key]?.trim() ?? "";
}

function splitCsvLine(line: string, delimiter: string): string[] {
  const values: string[] = [];
  let current = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"' && next === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      quoted = !quoted;
      continue;
    }

    if (char === delimiter && !quoted) {
      values.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current);
  return values;
}

function normalizeHeader(header: string): string {
  return header
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
}

function normalizeCity(city: string): string {
  return city
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
}

function normalizePriority(priority: string | undefined): Priority {
  const normalized = (priority ?? "NORMAL").toUpperCase();
  if (normalized === "BAIXA" || normalized === "ALTA" || normalized === "URGENTE") {
    return normalized;
  }

  return "NORMAL";
}

function roadDistanceEstimateKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const straight = haversineKm(a, b);
  return Number((straight * 1.28).toFixed(1));
}

function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const earthRadiusKm = 6371;
  const dLat = degreesToRadians(b.lat - a.lat);
  const dLng = degreesToRadians(b.lng - a.lng);
  const lat1 = degreesToRadians(a.lat);
  const lat2 = degreesToRadians(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * earthRadiusKm * Math.asin(Math.sqrt(h));
}

function degreesToRadians(value: number): number {
  return (value * Math.PI) / 180;
}

function centroid(orders: DeliveryOrder[]): { lat: number; lng: number } {
  return {
    lat: sum(orders.map((order) => order.latitude ?? 0)) / orders.length,
    lng: sum(orders.map((order) => order.longitude ?? 0)) / orders.length,
  };
}

function addMinutes(time: string, minutes: number): string {
  const [hoursRaw, minsRaw] = time.split(":");
  const hours = Number(hoursRaw ?? "0");
  const mins = Number(minsRaw ?? "0");
  const total = hours * 60 + mins + minutes;
  const finalHours = Math.floor(total / 60) % 24;
  const finalMins = total % 60;
  return `${String(finalHours).padStart(2, "0")}:${String(finalMins).padStart(2, "0")}`;
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

function count(value: string, needle: string): number {
  return value.split(needle).length - 1;
}
