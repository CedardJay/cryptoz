export default async (request) => {
  const url = new URL(request.url);
  const base = url.searchParams.get("base");
  const target = url.searchParams.get("target");

  // Validate inputs
  if (!base || !target) {
    return new Response(
      JSON.stringify({ error: "Missing base or target currency" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // API key is read from environment variable
  const API_KEY = process.env.EXCHANGE_API_KEY;
  const apiUrl = `https://exchange-rates.abstractapi.com/v1/live/?api_key=${API_KEY}&base=${base}&target=${target}`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Failed to fetch exchange rate" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

export const config = {
  path: "/api/exchange-rate",  // the URL frontend will call
};