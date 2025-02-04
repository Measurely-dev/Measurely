import type { MetaRecord } from "nextra";
import { Code } from "nextra/components";

// This is the metadata configuration for the documentation pages.
const SETUP: MetaRecord = {
  quickstart: "",
};

// This is the metadata configuration for the documentation pages.
const FEATURES: MetaRecord = {
  _: {
    type: "separator",
    title: "Metrics",
  },
  "basic-metric": "",
  "dual-metric": "",
  "average-metric": "",
  __: {
    type: "separator",
    title: "Core features",
  },
  filters: "",
  integrations: "",
  templates: "",
};
// This is the metadata configuration for the documentation pages.
const SDKS: MetaRecord = {
  "js-ts": <Code>JS/TS</Code>,
  python: <Code>Python</Code>,
  golang: <Code>Golang</Code>,
};
// This is the metadata configuration for the documentation pages.
const API_REFERENCES: MetaRecord = {
  v1: "",
};
// This is the metadata configuration for the documentation pages.
const metaConfig = {
  index: {
    display: "hidden",
  },
  pricing: {
    type: "page",
    theme: {
      typesetting: "article",
      layout: "full",
      timestamp: false,
    },
  },
  docs: {
    type: "page",
    title: "Docs",
    items: {
      setup: { items: SETUP },
      features: { items: FEATURES },
      sdks: {
        items: SDKS,
      },
      "api-references": { items: API_REFERENCES },
    },
  },
  about: {
    type: "page",
    theme: {
      typesetting: "article",
      layout: "full",
      timestamp: false,
    },
  },
  brand: {
    type: "page",
    display: "hidden",
    theme: {
      typesetting: "article",
      layout: "full",
      timestamp: false,
    },
  },
  help: {
    type: "page",
    theme: {
      typesetting: "article",
      layout: "full",
      timestamp: false,
    },
  },
  legal: {
    type: "menu",
    title: "Legal",
    items: {
      privacy: {
        href: "/legal/privacy",
      },
      terms: {
        href: "/legal/terms",
      },
    },
  },
};

export default metaConfig;
