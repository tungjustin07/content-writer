# The taxonomy problem nobody mentions in the agent-tools demo

Every "give your agent access to your tools" setup looks the same at first: point it at a
GDrive folder, or drop an MD file in a repo, or wire up an MCP server, and within an hour
you have something that looks alive. That's exactly why so many teams are doing it — the
initial setup is genuinely trivial now.

Operationalizing it is a different problem, and it's the one nobody puts in the demo.

Here's where it actually bites: not "can the agent reach the tool," but "does the tool
know the right answer at the moment it's asked." Take Clay. You ask an agent to enrich a
lead and drop it into the right pipeline stage. Fine — until the agent has to fill in a
field that only accepts values from *your* taxonomy. Not "Enterprise" in the abstract
sense, but the exact string your CRM has for it today, which might be different from what
it was three sprints ago when someone renamed a segment.

So where does that taxonomy live?

**Option one: the tool holds its own copy.** Fast, predictable, no round trip. Also
guaranteed to drift the moment someone edits the source schema and forgets — or doesn't
know — to push the update downstream. The agent will confidently fill in a value that was
correct last quarter.

**Option two: propagate it live from the source of truth every time.** Accurate by
construction — it's reading the same schema the humans are looking at. But now every
form-fill is gated on a live fetch, and you've added latency and a new failure mode (what
does the agent do when that fetch times out, or the source system is down?) to something
that used to be instant.

There's no clean third option, just a dial between those two. A few things that seem to
actually move the dial, rather than just splitting the difference:

- **How often does the taxonomy change, really?** If it's quarterly, a cached copy with a
  cheap version check (an ETag, a hash, a "last updated" timestamp) gets you 95% of the
  accuracy for 5% of the latency cost. If it's a live-edited field that product or sales
  ops touches weekly, caching is just scheduling the next bad write.
- **What does a wrong guess actually cost?** A miscategorized lead is a spreadsheet
  cleanup. A miscategorized transaction or a wrong compliance field is a different
  conversation. The tolerance for staleness should track the blast radius of being wrong,
  not the average case.
- **Where does validation actually happen?** If the source system rejects bad values at
  write time, a stale local guess just means a retry loop, not silent corruption — which
  makes caching much safer to reach for than it looks on paper.

None of this is a Clay problem specifically — it's the same shape whether the tool is a
CRM, a ticketing system, or an internal API with an enum that changes when nobody's
watching. The MCP-vs-MD-file choice is about how the agent *reaches* the tool. This one is
about whether the tool actually *knows what's true* when the agent hands it something to
write. That second question is the one that decides whether the thing works in a demo or
survives a quarter of real use.

Still working through where I land on this — curious how other people are drawing the
line.
