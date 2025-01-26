/** @type {import('next-sitemap').IConfig} */
const config = {
  siteUrl: 'https://www.measurely.dev',
  generateRobotsTxt: true,
  sitemapSize: 5000,
  generateIndexSitemap: true,
  changefreq: 'daily',
  priority: 0.7,
  autoLastmod: true,
};

module.exports = config;
