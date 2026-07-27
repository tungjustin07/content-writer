Giving an agent access to your tools is the easy part now. MCP server, an MD file in GitHub, point it at a GDrive folder, an hour of setup and it works. Operationalizing it is where it gets harder.

Concrete case: Clay enriching a company and mapping it into your industry taxonomy. Three ways to do it:

1. Clay holds the taxonomy in its own table. Fast, but now every rename or merge upstream is a change you have to manually propagate.
2. Pull it live from wherever it actually lives (GitHub, a warehouse table, a gdrive doc) via MCP, every time. Accurate, but you're paying a round trip, and a new failure mode, on every enrichment.
3. Skip the fixed table and let an AI column interpret the mapping in real time. No sync problem, but now "accuracy" means however that call felt today, not a value you can point to.

Same tradeoff wearing three costumes: latency vs. accuracy vs. how deterministic you actually need the answer to be.

Genuinely asking, what's the preferred approach right now?
