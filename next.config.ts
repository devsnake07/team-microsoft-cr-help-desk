import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  basePath: process.env.BASEPATH,
  typescript: {
    ignoreBuildErrors: true
  },
  redirects: async () => {
    return [
      {
        source: '/',
        destination: '/en/dashboards/quick',
        permanent: true,
        locale: false
      },
      {
        source: '/:lang(en|fr|ar)',
        destination: '/:lang/dashboards/quick',
        permanent: true,
        locale: false
      }
    ]
  }
}

export default nextConfig
