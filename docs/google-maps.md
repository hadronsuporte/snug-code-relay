# Google Maps

As integrações reais devem ficar atrás de serviços isolados. O frontend já diferencia modo mock de modo Google por variáveis de ambiente.

## Variáveis

- `VITE_GOOGLE_MAPS_BROWSER_KEY`: chave restrita por domínio para o mapa no frontend.
- `GOOGLE_MAPS_SERVER_KEY`: chave privada para backend.
- `GOOGLE_MAPS_MODE`: `mock` ou `google`.

## APIs previstas

- Geocoding API para converter endereço em latitude, longitude e `placeId`.
- Maps JavaScript API para desenhar rotas e paradas.
- Routes API para distância, duração, ETA e polyline.
- Route Optimization API para CVRP com `loadDemands` e `loadLimits`.

## Regras

- Chaves reais nunca entram no repositório.
- O backend deve cachear geocodificação e uso de APIs.
- A resposta do Google nunca substitui a validação local de capacidade.
- Rotas de combustível exigem revisão operacional; o sistema não deve afirmar autorização legal automática.

## GPS

GPS/Google Navigation SDK foi propositalmente pulado neste milestone conforme solicitado. A arquitetura futura deve adicionar o Navigation SDK oficial sem tentar criar motor próprio de navegação.
