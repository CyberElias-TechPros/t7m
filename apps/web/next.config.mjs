/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Compile the workspace package (shares the questionnaire schema).
  transpilePackages: ['@t7m/shared'],
  webpack: (config) => {
    // The shared package uses NodeNext ".js" specifiers for its TS sources;
    // resolve those to the actual .ts files when bundling for the browser.
    config.resolve.extensionAlias = {
      ...(config.resolve.extensionAlias ?? {}),
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    };
    return config;
  },
};

export default nextConfig;
