import type { MetaRecord } from "nextra";
import { Code } from "nextra/components";

const SETUP: MetaRecord = {
  quickstart: "",
};
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
const SDKS: MetaRecord = {
  "js-ts": <Code>JS/TS</Code>,
  python: <Code>Python</Code>,
  golang: <Code>Golang</Code>,
};
const API_REFERENCES: MetaRecord = {
  v1: "",
};
const metaConfig = {
  docs: {
    type: "page",
    title: "Documentation",
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
};

export default metaConfig;
