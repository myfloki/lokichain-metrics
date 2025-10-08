# Lokichain Metrics Worker

This Cloudflare Worker exposes a text endpoint that reports the current circulating supply of Lokichain (FLC) based on the latest block height and the chain's emission schedule.

## Endpoint

- `GET /circulating` &mdash; returns plain-text with the current block height and approximate circulating supply.

## Local Development

1. Install the Wrangler CLI if it is not already available: `npm install -g wrangler`.
2. Run the worker locally: `npm run dev`.
3. Open http://localhost:8787/circulating to view the current metrics.

## Deployment

Deploy to Cloudflare Workers with `npm run deploy`. Wrangler configuration lives in `wrangler.toml`.
