import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from 'vite-plugin-pwa';
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 3000,
  },
  plugins: [
    react(),
    VitePWA({
      // 개발 모드에서는 Service Worker 비활성화
      disable: mode === 'development',
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icon-192.png', 'icon-512.png', '320-logo.jpg'],
      manifest: {
        name: 'THIRD TWENTY - 320 Magazine',
        short_name: '320',
        description: '40-50대를 위한 프리미엄 라이프스타일 매거진',
        theme_color: '#9333ea',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        categories: ['lifestyle', 'magazine', 'news'],
        shortcuts: [
          {
            name: '홈',
            url: '/',
            description: '홈 페이지로 이동'
          },
          {
            name: '데일리 뉴스',
            url: '/?page=daily-news',
            description: '오늘의 뉴스 보기'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg}'],
        // Supabase API는 캐싱하지 않음 (항상 최신 콘텐츠)
        navigateFallback: null,
        runtimeCaching: [
          // 이미지만 캐싱 (성능 최적화)
          {
            urlPattern: /^https:\/\/.*\.(jpg|jpeg|png|gif|webp|svg)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days (30일 → 7일로 단축)
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom"],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React 관련 라이브러리
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],

          // Supabase 관련
          'vendor-supabase': ['@supabase/supabase-js'],

          // TanStack Query
          'vendor-query': ['@tanstack/react-query'],

          // UI 라이브러리 (Radix UI)
          'vendor-ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-slot'
          ],
        }
      }
    }
  }
}));
