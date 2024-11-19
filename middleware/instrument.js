const Sentry = require("@sentry/node");
const { nodeProfilingIntegration } = require("@sentry/profiling-node");

Sentry.init({
    dsn: "https://d5d2abf03f66a7cd54bb9f0b9f78f1c4@o4508279786307584.ingest.us.sentry.io/4508322943860736",
    integrations: [
    nodeProfilingIntegration(),
    ],
    // Tracing
    tracesSampleRate: 1.0, //  Capture 100% of the transactions
});