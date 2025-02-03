import withNextra from "nextra";

export default withNextra({
  defaultShowCopyCode: true,
})({
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/",
        destination: "/docs/",
        permanent: true,
      },
    ];
  },
});
