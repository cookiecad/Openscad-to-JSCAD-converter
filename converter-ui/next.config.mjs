/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // if (isServer) {
    config.externals.push('tree-sitter', 'tree-sitter-openscad', 'prettier');
    // }

    return config
  }
}

export default nextConfig
