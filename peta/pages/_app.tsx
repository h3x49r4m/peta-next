import type { AppProps } from 'next/app';
import Head from 'next/head';
import Layout from '../components/Layout';
import '../styles/globals.css';
import { useEffect } from 'react';

// Add type declarations for KaTeX
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
  }
}

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
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