# Project decisions

- Public rate diagnostics use a dedicated unauthenticated Cloud Edge Function with validated query inputs and no-store responses; the existing browser conversion flow stays unchanged so diagnostics isolate upstream behavior.