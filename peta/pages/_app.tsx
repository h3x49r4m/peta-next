import type { AppProps } from 'next/app';
import Head from 'next/head';
import Layout from '../components/Layout';
import '../styles/globals.css';
import { useEffect } from 'react';

// Add type declarations for KaTeX and Prism
declare global {
  interface Window {
    renderMathInElement: (
      element: HTMLElement,
      options?: {
        delimiters?: Array<{ left: string; right: string; display: boolean }>;
        throwOnError?: boolean;
      }
    ) => void;
    katex?: any;
    Prism?: any;
    loadPrism?: () => Promise<void>;
  }
}

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Load Prism.js if not already loaded
    const loadPrism = async () => {
      if (typeof window !== 'undefined' && !window.Prism) {
        try {
          // Load Prism core
          const prismCore = await import('prismjs');
          const Prism = prismCore.default;
          window.Prism = Prism;
          
          // Load languages in a safe sequence
          const languageLoads = [
            () => import('prismjs/components/prism-clike'),
            () => import('prismjs/components/prism-javascript'),
            () => import('prismjs/components/prism-typescript'),
            () => import('prismjs/components/prism-jsx'),
            () => import('prismjs/components/prism-tsx'),
            () => import('prismjs/components/prism-python'),
            () => import('prismjs/components/prism-bash'),
            () => import('prismjs/components/prism-json'),
            () => import('prismjs/components/prism-css'),
            () => import('prismjs/components/prism-rust'),
            () => import('prismjs/components/prism-go'),
            () => import('prismjs/components/prism-sql'),
            () => import('prismjs/components/prism-cpp'),
            () => import('prismjs/components/prism-yaml'),
            () => import('prismjs/components/prism-docker'),
            () => import('prismjs/components/prism-nginx')
          ];
          
          // Load languages one by one with error handling
          for (const loadLanguage of languageLoads) {
            try {
              await loadLanguage();
            } catch (e) {
              console.warn('Failed to load Prism language:', e);
            }
          }
          
          // Store the load function for future use
          window.loadPrism = loadPrism;
        } catch (error) {
          console.error('Failed to load Prism.js:', error);
        }
      }
    };
    
    // Load Prism.js with a delay to avoid blocking the initial render
    setTimeout(loadPrism, 100);
    
    // Re-render math formulas after page navigation
    if (typeof window !== 'undefined' && window.renderMathInElement) {
      setTimeout(() => {
        window.renderMathInElement(document.body, {
          delimiters: [
            {left: '$$', right: '$$', display: true},
            {left: '$', right: '$', display: false},
            {left: '\\[', right: '\\]', display: true},
            {left: '\\(', right: '\\)', display: false}
          ],
          throwOnError: false
        });
      }, 100); // Small delay to ensure DOM is ready
    }
  }, [Component]);

  return (
    <>
      <Head>
        <title>Peta</title>
        <meta name="description" content="High-performance static articles with RST content, math support, and snippets" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </>
  );
}

export default MyApp;