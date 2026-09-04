import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  Check,
  ClipboardCheck,
  Download,
  FileSpreadsheet,
  Fuel,
  MapPinned,
  Navigation,
  Plus,
  Route as RouteIcon,
  ShieldCheck,
  Truck,
  Upload,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  approveRoutePlan,
  buildRoutePlan,
  formatCurrency,
  formatDuration,
  formatLiters,
  geocodeOrdersMock,
  moveOrderBetweenRoutes,
  parseOrdersCsv,
  routingConfiguration,
  sampleCsv,
  seedOrders,
  seedVehicles,
  type DeliveryOrder,
  type ImportPreview,
  type PlannedRoute,
  type RoutePlan,
  type Vehicle,
} from "@/lib/fuel-routing";

export const Route = createFileRoute("/")({
  component: Index,
});

const routeColors = ["#2563eb", "#0f766e", "#b45309", "#7c3aed", "#be123c"];

function Index() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(seedVehicles);
  const [orders, setOrders] = useState<DeliveryOrder[]>(seedOrders);
  const [routePlan, setRoutePlan] = useState<RoutePlan>(() =>
    buildRoutePlan(seedVehicles, geocodeOrdersMock(seedOrders)),
  );
  const [selectedRouteId, setSelectedRouteId] = useState<string>("all");
  const [importPreview, setImportPreview] = useState<ImportPreview | null>(null);
  const [message, setMessage] = useState(
    "Milestone 1 ativo. GPS/Navigation SDK foi pulado neste commit conforme solicitado.",
  );
  const [newVehicle, setNewVehicle] = useState({
    codigo: "",
    placa: "",
    capacidadeLitros: "10000",
    motoristaPadrao: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const awaitingOrders = orders.filter(
    (order) => order.status === "IMPORTADO" || order.status === "AGUARDANDO_ROTEIRIZACAO",
  );
  const activeVehicles = vehicles.filter((vehicle) => vehicle.ativo);
  const totalLiters = awaitingOrders.reduce((total, order) => total + order.litros, 0);
  const totalValue = awaitingOrders.reduce((total, order) => total + order.valor, 0);
  const totalCapacity = activeVehicles.reduce(
    (total, vehicle) => total + vehicle.capacidadeLitros,
    0,
  );
  const visibleRoutes =
    selectedRouteId === "all"
      ? routePlan.routes
      : routePlan.routes.filter((route) => route.id === selectedRouteId);
  const geocodedCount = orders.filter((order) => order.geocodeStatus === "GEOCODIFICADO").length;

  const metrics = [
    { label: "Pedidos aguardando", value: awaitingOrders.length.toString(), icon: ClipboardCheck },
    { label: "Volume", value: formatLiters(totalLiters), icon: Fuel },
    { label: "Valor total", value: formatCurrency(totalValue), icon: FileSpreadsheet },
    { label: "Frota ativa", value: `${activeVehicles.length} veiculos`, icon: Truck },
    { label: "Capacidade", value: formatLiters(totalCapacity), icon: ShieldCheck },
  ];

  const routeTotals = useMemo(
    () => ({
      distance: routePlan.routes.reduce((total, route) => total + route.distanciaKm, 0),
      duration: routePlan.routes.reduce((total, route) => total + route.duracaoMin, 0),
    }),
    [routePlan],
  );

  function handleToggleVehicle(vehicleId: string) {
    const nextVehicles = vehicles.map((vehicle) =>
      vehicle.id === vehicleId ? { ...vehicle, ativo: !vehicle.ativo } : vehicle,
    );
    setVehicles(nextVehicles);
    setMessage(
      "Status do caminhao atualizado. Gere a roteirizacao novamente para recalcular a frota.",
    );
  }

  function handleAddVehicle() {
    const capacity = Number(newVehicle.capacidadeLitros);
    if (!newVehicle.codigo || !newVehicle.placa || !Number.isFinite(capacity) || capacity <= 0) {
      setMessage("Informe codigo, placa e capacidade valida para cadastrar o caminhao.");
      return;
    }

    setVehicles((current) => [
      ...current,
      {
        id: `veh-${newVehicle.codigo.toLowerCase().replace(/[^a-z0-9-]/g, "-")}`,
        codigo: newVehicle.codigo.toUpperCase(),
        placa: newVehicle.placa.toUpperCase(),
        descricao: "Caminhao cadastrado pelo operador",
        capacidadeLitros: capacity,
        ativo: true,
        baseSaida: "Base Sao Carlos/SP",
        baseRetorno: "Base Sao Carlos/SP",
        latitudeBase: -22.0167,
        longitudeBase: -47.8908,
        motoristaPadrao: newVehicle.motoristaPadrao || "A definir",
      },
    ]);
    setNewVehicle({ codigo: "", placa: "", capacidadeLitros: "10000", motoristaPadrao: "" });
    setMessage("Caminhao cadastrado e ativo para a proxima roteirizacao.");
  }

  function handleFile(file?: File) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const preview = parseOrdersCsv(String(reader.result ?? ""), orders);
      setImportPreview(preview);
      setMessage(
        `${preview.totalRows} linhas encontradas, ${preview.validRows} validas, ${preview.invalidRows} com problemas.`,
      );
    };
    reader.readAsText(file);
  }

  function handleConfirmImport() {
    if (!importPreview || importPreview.orders.length === 0) {
      setMessage("Nao ha pedidos validos para importar.");
      return;
    }

    setOrders((current) => [...current, ...importPreview.orders]);
    setImportPreview(null);
    setMessage("Pedidos importados. Execute a geocodificacao antes de gerar a rota.");
  }

  function handleGeocode() {
    const nextOrders = geocodeOrdersMock(orders);
    setOrders(nextOrders);
    setMessage(
      "Geocodificacao mock aplicada com cache por cidade. Conecte a chave do Google para usar o adapter real.",
    );
  }

  function handleGenerateRouting() {
    try {
      const geocodedOrders = geocodeOrdersMock(orders);
      const plan = buildRoutePlan(vehicles, geocodedOrders);
      setOrders(geocodedOrders);
      setRoutePlan(plan);
      setSelectedRouteId("all");
      setMessage(
        plan.unassigned.length > 0
          ? "Roteirizacao gerada com pedidos em revisao. Nenhuma capacidade foi violada."
          : "Roteirizacao gerada e validada. Caminhoes inativos ficaram fora do plano.",
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Falha ao gerar roteirizacao.");
    }
  }

  function handleMoveOrder(orderId: string, targetRouteId: string) {
    const result = moveOrderBetweenRoutes(routePlan, orderId, targetRouteId);
    if (result.error) {
      setMessage(result.error);
      return;
    }

    setRoutePlan(result.plan);
    setMessage("Pedido movido manualmente e capacidade revalidada.");
  }

  function handleApprove() {
    try {
      setRoutePlan((current) => approveRoutePlan(current));
      setMessage(
        "Rota aprovada. App do motorista fica para a proxima fase; GPS foi pulado neste commit.",
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Nao foi possivel aprovar a rota.");
    }
  }

  function downloadTemplate() {
    const blob = new Blob([sampleCsv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "modelo-importacao-pedidos.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-[#f6f7f2] text-[#17201c]">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 border-r border-[#d9ded2] bg-[#18241f] text-white lg:block">
          <div className="border-b border-white/10 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-md bg-[#f2c14e] text-[#18241f]">
                <Fuel className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide">Combustivel</p>
                <p className="text-xs text-white/60">Roteirizacao</p>
              </div>
            </div>
          </div>
          <nav className="space-y-6 px-4 py-5 text-sm">
            <MenuGroup
              title="Dashboard"
              items={["Resumo operacional"]}
              active="Resumo operacional"
            />
            <MenuGroup
              title="Operacao"
              items={["Pedidos", "Importar pedidos", "Planejamento de rotas", "Acompanhamento"]}
              active="Planejamento de rotas"
            />
            <MenuGroup
              title="Cadastros"
              items={["Clientes", "Veiculos", "Motoristas"]}
              active="Veiculos"
            />
            <MenuGroup title="Historico" items={["Rotas", "Entregas", "Importacoes"]} />
            <MenuGroup title="Configuracoes" items={["Roteirizacao", "Google Maps", "Usuarios"]} />
          </nav>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="sticky top-0 z-10 border-b border-[#d9ded2] bg-[#f6f7f2]/95 px-4 py-4 backdrop-blur md:px-8">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-[#66756b]">
                  Planejamento de rotas
                </p>
                <h1 className="text-2xl font-semibold tracking-normal text-[#17201c] md:text-3xl">
                  Distribuicao inteligente de entregas
                </h1>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-[#e9f2eb] text-[#23553a] hover:bg-[#e9f2eb]">
                  {geocodedCount}/{orders.length} geocodificados
                </Badge>
                <Badge variant={routePlan.status === "APROVADA" ? "default" : "secondary"}>
                  {routePlan.status}
                </Badge>
              </div>
            </div>
          </header>

          <div className="space-y-6 px-4 py-6 md:px-8">
            <div className="rounded-md border border-[#d9ded2] bg-white px-4 py-3 shadow-sm">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 size-5 shrink-0 text-[#b45309]" />
                <p className="text-sm text-[#334139]">{message}</p>
              </div>
            </div>

            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              {metrics.map((metric) => (
                <MetricTile key={metric.label} {...metric} />
              ))}
            </section>

            <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(480px,0.9fr)]">
              <div className="space-y-6">
                <Panel
                  title="Veiculos"
                  description="Caminhoes inativos nao entram na roteirizacao."
                  action={
                    <Button size="sm" onClick={handleAddVehicle}>
                      <Plus className="size-4" />
                      Cadastrar
                    </Button>
                  }
                >
                  <div className="grid gap-3 md:grid-cols-4">
                    <Input
                      placeholder="Codigo"
                      value={newVehicle.codigo}
                      onChange={(event) =>
                        setNewVehicle({ ...newVehicle, codigo: event.target.value })
                      }
                    />
                    <Input
                      placeholder="Placa"
                      value={newVehicle.placa}
                      onChange={(event) =>
                        setNewVehicle({ ...newVehicle, placa: event.target.value })
                      }
                    />
                    <Input
                      placeholder="Capacidade L"
                      type="number"
                      value={newVehicle.capacidadeLitros}
                      onChange={(event) =>
                        setNewVehicle({ ...newVehicle, capacidadeLitros: event.target.value })
                      }
                    />
                    <Input
                      placeholder="Motorista"
                      value={newVehicle.motoristaPadrao}
                      onChange={(event) =>
                        setNewVehicle({ ...newVehicle, motoristaPadrao: event.target.value })
                      }
                    />
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Codigo</TableHead>
                        <TableHead>Placa</TableHead>
                        <TableHead>Capacidade</TableHead>
                        <TableHead>Motorista</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vehicles.map((vehicle) => (
                        <TableRow key={vehicle.id}>
                          <TableCell className="font-medium">{vehicle.codigo}</TableCell>
                          <TableCell>{vehicle.placa}</TableCell>
                          <TableCell>{formatLiters(vehicle.capacidadeLitros)}</TableCell>
                          <TableCell>{vehicle.motoristaPadrao}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={vehicle.ativo}
                                onCheckedChange={() => handleToggleVehicle(vehicle.id)}
                              />
                              <span className={vehicle.ativo ? "text-[#23553a]" : "text-[#8a3428]"}>
                                {vehicle.ativo ? "Ativo" : "Inativo"}
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Panel>

                <Panel
                  title="Importar pedidos"
                  description="CSV com pre-validacao, linhas com erro e bloqueio de duplicidade."
                  action={
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={downloadTemplate}>
                        <Download className="size-4" />
                        Modelo
                      </Button>
                      <Button size="sm" onClick={() => fileInputRef.current?.click()}>
                        <Upload className="size-4" />
                        CSV
                      </Button>
                    </div>
                  }
                >
                  <input
                    ref={fileInputRef}
                    className="hidden"
                    type="file"
                    accept=".csv,text/csv"
                    onChange={(event) => handleFile(event.target.files?.[0])}
                  />
                  {importPreview ? (
                    <div className="space-y-3">
                      <div className="grid gap-3 sm:grid-cols-3">
                        <SmallStat label="Linhas" value={importPreview.totalRows.toString()} />
                        <SmallStat label="Validas" value={importPreview.validRows.toString()} />
                        <SmallStat label="Problemas" value={importPreview.invalidRows.toString()} />
                      </div>
                      {importPreview.issues.length > 0 && (
                        <div className="max-h-36 overflow-auto rounded-md border border-[#ead6c6] bg-[#fff8f0] p-3 text-sm text-[#7c2d12]">
                          {importPreview.issues.map((issue) => (
                            <p key={`${issue.row}-${issue.field}-${issue.message}`}>
                              Linha {issue.row}: {issue.field} - {issue.message}
                            </p>
                          ))}
                        </div>
                      )}
                      <Button
                        onClick={handleConfirmImport}
                        disabled={importPreview.validRows === 0}
                      >
                        <Check className="size-4" />
                        Confirmar importacao
                      </Button>
                    </div>
                  ) : (
                    <p className="rounded-md border border-dashed border-[#cbd5c6] p-5 text-sm text-[#66756b]">
                      Baixe o modelo, preencha os pedidos e envie o CSV para revisar antes de
                      salvar.
                    </p>
                  )}
                </Panel>

                <Panel
                  title="Pedidos"
                  description="Pedidos importados, geocodificados e prontos para roteirizacao."
                  action={
                    <Button variant="outline" size="sm" onClick={handleGeocode}>
                      <MapPinned className="size-4" />
                      Geocodificar
                    </Button>
                  }
                >
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Pedido</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Cidade</TableHead>
                        <TableHead>Litros</TableHead>
                        <TableHead>Prioridade</TableHead>
                        <TableHead>Geo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.numeroPedido}</TableCell>
                          <TableCell>{order.cliente}</TableCell>
                          <TableCell>
                            {order.cidade}/{order.uf}
                          </TableCell>
                          <TableCell>{formatLiters(order.litros)}</TableCell>
                          <TableCell>{order.prioridade}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                order.geocodeStatus === "GEOCODIFICADO" ? "default" : "secondary"
                              }
                              className={
                                order.geocodeStatus === "GEOCODIFICADO"
                                  ? "bg-[#e9f2eb] text-[#23553a] hover:bg-[#e9f2eb]"
                                  : ""
                              }
                            >
                              {order.geocodeStatus}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Panel>
              </div>

              <div className="space-y-6">
                <Panel
                  title="Gerar roteirizacao"
                  description="Uma viagem por caminhao, limite fisico de litros e validacao local dupla."
                  action={
                    <Button onClick={handleGenerateRouting}>
                      <RouteIcon className="size-4" />
                      Gerar
                    </Button>
                  }
                >
                  <div className="grid gap-3 sm:grid-cols-3">
                    <SmallStat
                      label="Distancia planejada"
                      value={`${routeTotals.distance.toFixed(1)} km`}
                    />
                    <SmallStat
                      label="Duracao prevista"
                      value={formatDuration(routeTotals.duration)}
                    />
                    <SmallStat
                      label="Nao atribuídos"
                      value={routePlan.unassigned.length.toString()}
                    />
                  </div>
                  {routePlan.warnings.length > 0 && (
                    <div className="rounded-md bg-[#fff8f0] p-3 text-sm text-[#7c2d12]">
                      {routePlan.warnings.map((warning) => (
                        <p key={warning}>{warning}</p>
                      ))}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant={selectedRouteId === "all" ? "default" : "outline"}
                      onClick={() => setSelectedRouteId("all")}
                    >
                      Todas
                    </Button>
                    {routePlan.routes.map((route) => (
                      <Button
                        key={route.id}
                        size="sm"
                        variant={selectedRouteId === route.id ? "default" : "outline"}
                        onClick={() => setSelectedRouteId(route.id)}
                      >
                        {route.vehicle.codigo}
                      </Button>
                    ))}
                  </div>
                </Panel>

                <MapPanel routes={visibleRoutes} />

                <Panel
                  title="Rotas por caminhao"
                  description="Sequencia, ETA, litros restantes e ajuste manual com bloqueio de capacidade."
                  action={
                    <Button
                      onClick={handleApprove}
                      variant={routePlan.status === "APROVADA" ? "secondary" : "default"}
                    >
                      <ShieldCheck className="size-4" />
                      Aprovar
                    </Button>
                  }
                >
                  <div className="space-y-4">
                    {routePlan.routes.map((route, routeIndex) => (
                      <div
                        key={route.id}
                        className="rounded-md border border-[#d9ded2] bg-[#fbfcf8] p-4"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span
                                className="size-3 rounded-full"
                                style={{
                                  backgroundColor: routeColors[routeIndex % routeColors.length],
                                }}
                              />
                              <h3 className="font-semibold">{route.vehicle.codigo}</h3>
                              <Badge variant="outline">{route.vehicle.placa}</Badge>
                            </div>
                            <p className="mt-1 text-sm text-[#66756b]">
                              Saida {route.saidaPrevista} · {route.stops.length} entregas ·{" "}
                              {formatDuration(route.duracaoMin)}
                            </p>
                          </div>
                          <div className="text-right text-sm">
                            <p className="font-semibold">
                              {formatLiters(route.litros)} /{" "}
                              {formatLiters(route.vehicle.capacidadeLitros)}
                            </p>
                            <p className="text-[#66756b]">
                              Ocupacao {(route.ocupacao * 100).toFixed(1)}%
                            </p>
                          </div>
                        </div>
                        <div className="mt-4 space-y-2">
                          {route.stops.map((stop) => (
                            <div
                              key={stop.order.id}
                              className="grid gap-2 rounded-md border border-[#e5e9df] bg-white p-3 text-sm md:grid-cols-[36px_minmax(0,1fr)_auto]"
                            >
                              <div className="flex size-8 items-center justify-center rounded-md bg-[#18241f] text-white">
                                {stop.sequencia}
                              </div>
                              <div>
                                <p className="font-medium">{stop.order.cliente}</p>
                                <p className="text-[#66756b]">
                                  {stop.order.cidade}/{stop.order.uf} · ETA {stop.eta} ·{" "}
                                  {formatLiters(stop.litrosRestantes)} restantes
                                </p>
                              </div>
                              <div className="flex flex-wrap items-center gap-2 md:justify-end">
                                <Badge variant="secondary">{formatLiters(stop.order.litros)}</Badge>
                                {routePlan.routes
                                  .filter((candidate) => candidate.id !== route.id)
                                  .map((candidate) => (
                                    <Button
                                      key={candidate.id}
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleMoveOrder(stop.order.id, candidate.id)}
                                    >
                                      Mover para {candidate.vehicle.codigo}
                                    </Button>
                                  ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </Panel>

                <Panel
                  title="Configuracoes"
                  description="Pesos centralizados para evoluir o otimizador."
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    {Object.entries(routingConfiguration).map(([key, value]) => (
                      <SmallStat
                        key={key}
                        label={key.replace(/([A-Z])/g, " $1").toLowerCase()}
                        value={typeof value === "boolean" ? (value ? "Sim" : "Nao") : String(value)}
                      />
                    ))}
                  </div>
                  <div className="rounded-md border border-[#d9ded2] bg-[#fbfcf8] p-3 text-sm text-[#66756b]">
                    Google Route Optimization API e Google Maps ficam preparados por adapter; sem
                    chave configurada, o sistema usa modo mock identificado para desenvolvimento.
                    GPS foi omitido nesta fase.
                  </div>
                </Panel>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

function MenuGroup({ title, items, active }: { title: string; items: string[]; active?: string }) {
  return (
    <div>
      <p className="mb-2 px-2 text-xs font-semibold uppercase text-white/45">{title}</p>
      <div className="space-y-1">
        {items.map((item) => (
          <div
            key={item}
            className={
              item === active
                ? "rounded-md bg-white/10 px-3 py-2 font-medium text-white"
                : "rounded-md px-3 py-2 text-white/65"
            }
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function MetricTile({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-md border border-[#d9ded2] bg-white p-4 shadow-sm">
      <div className="mb-3 flex size-9 items-center justify-center rounded-md bg-[#eef4ea] text-[#23553a]">
        <Icon className="size-4" />
      </div>
      <p className="text-sm text-[#66756b]">{label}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
    </div>
  );
}

function Panel({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-md border border-[#d9ded2] bg-white p-4 shadow-sm">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-base font-semibold">{title}</h2>
          <p className="text-sm text-[#66756b]">{description}</p>
        </div>
        {action}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function SmallStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-[#e5e9df] bg-[#fbfcf8] p-3">
      <p className="text-xs uppercase text-[#66756b]">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}

function MapPanel({ routes }: { routes: PlannedRoute[] }) {
  const bounds = routes.flatMap((route) => route.polyline);
  const minLat = Math.min(...bounds.map((point) => point.lat), -22.5);
  const maxLat = Math.max(...bounds.map((point) => point.lat), -21);
  const minLng = Math.min(...bounds.map((point) => point.lng), -48.5);
  const maxLng = Math.max(...bounds.map((point) => point.lng), -47.4);

  function project(point: { lat: number; lng: number }) {
    const x = ((point.lng - minLng) / Math.max(maxLng - minLng, 0.01)) * 82 + 9;
    const y = (1 - (point.lat - minLat) / Math.max(maxLat - minLat, 0.01)) * 72 + 14;
    return { x, y };
  }

  return (
    <Panel
      title="Mapa"
      description="Visual operacional das rotas. Google Maps real entra com chave VITE_GOOGLE_MAPS_BROWSER_KEY."
      action={
        <Badge className="bg-[#eef4ea] text-[#23553a] hover:bg-[#eef4ea]">
          <Navigation className="mr-1 size-3" />
          Modo mapa mock
        </Badge>
      }
    >
      <div className="relative h-[420px] overflow-hidden rounded-md border border-[#cbd5c6] bg-[#eef1e8]">
        <div className="absolute inset-0 opacity-70">
          <div className="h-full w-full bg-[linear-gradient(90deg,#dbe3d3_1px,transparent_1px),linear-gradient(0deg,#dbe3d3_1px,transparent_1px)] bg-[size:42px_42px]" />
        </div>
        <div className="absolute left-[8%] top-[62%] h-24 w-[78%] -rotate-6 rounded-full border-t-8 border-[#d7c7a2]" />
        <div className="absolute left-[12%] top-[28%] h-40 w-[74%] rotate-12 rounded-full border-t-8 border-[#c6d2bb]" />
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {routes.map((route, routeIndex) => {
            const points = route.polyline.map(project);
            const d = points
              .map(
                (point, index) =>
                  `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`,
              )
              .join(" ");
            return (
              <path
                key={route.id}
                d={d}
                fill="none"
                stroke={routeColors[routeIndex % routeColors.length]}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
                vectorEffect="non-scaling-stroke"
              />
            );
          })}
        </svg>
        {routes.map((route, routeIndex) => {
          const base = project({
            lat: route.vehicle.latitudeBase,
            lng: route.vehicle.longitudeBase,
          });
          return (
            <div key={route.id}>
              <div
                className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-md bg-[#18241f] px-2 py-1 text-xs font-medium text-white shadow"
                style={{ left: `${base.x}%`, top: `${base.y}%` }}
              >
                <Truck className="size-3" />
                Base
              </div>
              {route.stops.map((stop) => {
                const point = project({
                  lat: stop.order.latitude ?? route.vehicle.latitudeBase,
                  lng: stop.order.longitude ?? route.vehicle.longitudeBase,
                });
                return (
                  <div
                    key={stop.order.id}
                    className="absolute min-w-28 -translate-x-1/2 -translate-y-1/2 rounded-md border border-white bg-white px-2 py-1 text-xs shadow"
                    style={{ left: `${point.x}%`, top: `${point.y}%` }}
                    title={`${stop.order.cliente} - ${formatLiters(stop.order.litros)}`}
                  >
                    <div className="flex items-center gap-1">
                      <span
                        className="flex size-5 items-center justify-center rounded-full text-[11px] font-semibold text-white"
                        style={{ backgroundColor: routeColors[routeIndex % routeColors.length] }}
                      >
                        {stop.sequencia}
                      </span>
                      <span className="truncate font-medium">{stop.order.cidade}</span>
                    </div>
                    <p className="mt-0.5 truncate text-[#66756b]">
                      {formatLiters(stop.order.litros)}
                    </p>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
