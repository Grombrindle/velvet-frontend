// import createNextIntlPlugin from "next-intl/plugin";

// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   output: "standalone",
//   images: {
//     remotePatterns: [
//       {
//         protocol: "https",
//         hostname: "vet.e-solutionsgroup.org",
//         port: "",
//         pathname: "/**",
//       },
//     ],
//   },
// };

// const withNextIntl = createNextIntlPlugin();

// export default withNextIntl(nextConfig);

import createNextIntlPlugin from "next-intl/plugin";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  poweredByHeader: false,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "app.velvet-leaf.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "velvet-web.e-solutionsgroup.org",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "velvet.e-solutionsgroup.org",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
