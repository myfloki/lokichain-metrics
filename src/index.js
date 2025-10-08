const BLOCK_HEIGHT_URL = 'https://flokichain.info/api/blocks/tip/height';
const HALVING_INTERVAL = 210000;
const HALVING_REWARDS = [1000, 500, 250, 125, 62.5, 31.25];
const TAIL_EMISSION_REWARD = 21;

async function fetchBlockHeight(fetchImpl) {
  const response = await fetchImpl(BLOCK_HEIGHT_URL, {
    headers: {
      'accept': 'text/plain',
      'user-agent': 'lokichain-metrics/1.0',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch block height: ${response.status}`);
  }

  const text = (await response.text()).trim();
  const height = Number.parseInt(text, 10);

  if (!Number.isFinite(height)) {
    throw new Error('Block height response is not a number');
  }

  return height;
}

function calculateSupply(height) {
  if (!Number.isFinite(height) || height < 0) {
    throw new Error('Invalid block height');
  }

  let supply = 0;
  let blocksRemaining = height;

  for (const reward of HALVING_REWARDS) {
    if (blocksRemaining <= 0) {
      return supply;
    }

    const blocksAtReward = Math.min(blocksRemaining, HALVING_INTERVAL);
    supply += blocksAtReward * reward;
    blocksRemaining -= blocksAtReward;
  }

  if (blocksRemaining > 0) {
    supply += blocksRemaining * TAIL_EMISSION_REWARD;
  }

  return supply;
}

function formatSupplyResponse(supply) {
  // Circulating supply endpoint must return a numeric string only.
  return String(supply);
}

function handleNotFound() {
  return new Response('Not Found', {
    status: 404,
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}

function handleError(error) {
  return new Response(`Unable to calculate circulating supply\n${error.message}`, {
    status: 502,
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}

export default {
  async fetch(request) {
    const { pathname } = new URL(request.url);

    if (pathname !== '/circulating') {
      return handleNotFound();
    }

    try {
      const height = await fetchBlockHeight(fetch);
      const supply = calculateSupply(height);
      const body = formatSupplyResponse(supply);

      return new Response(body, {
        headers: {
          'content-type': 'text/plain; charset=utf-8',
          'cache-control': 'max-age=30',
        },
      });
    } catch (error) {
      return handleError(error);
    }
  },
};

export { calculateSupply, fetchBlockHeight };
