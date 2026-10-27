# Equipment contracts

`equipment-contracts.test.cjs` runs with the normal Node suite. Its explicit inventory at `fixtures/equipment-contract-types.json` is the reviewed list of catalog equipment. Adding or removing a type requires updating this inventory and satisfying the numeric, translation, and model-table checks.

Run the full browser contract suite against the real app after starting a local server:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
node tests/equipment-contracts.browser.cjs
```

The browser suite creates every inventory type using `createDevice`, checks its rendered dimensions and ports, requires routable ports on audio equipment (with explicit decorative/no-cable exceptions), confirms supported connector formats and node/direction metadata, toggles available power controls off and on, checks electrical specifications where the model publishes them, tests the connector-compatibility result contract, and verifies English labels. It also scans rendered text, `aria-label`, `title`, placeholders, alt text, tooltips, and all select options for Portuguese strings still visible in English mode, both in settings and while each device inspector is open. It deletes each created instance to exercise normal runtime cleanup.
