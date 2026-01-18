import { useEffect } from 'react';

export default function MathTest() {
  useEffect(() => {
    console.log('Window object:', window);
    console.log('KaTeX available:', !!window.katex);
    console.log('renderMathInElement available:', !!window.renderMathInElement);
    
    if (typeof window !== 'undefined' && window.renderMathInElement) {
      console.log('Rendering math...');
      window.renderMathInElement(document.body, {
        delimiters: [
          {left: '$$', right: '$$', display: true},
          {left: '$', right: '$', display: false},
          {left: '\[', right: '\]', display: true},
          {left: '\(', right: '\)', display: false}
        ],
        throwOnError: false
      });
    } else {
      console.log('KaTeX not loaded yet, retrying...');
      setTimeout(() => {
        console.log('Retrying - KaTeX available:', !!window.katex);
        console.log('Retrying - renderMathInElement available:', !!window.renderMathInElement);
        if (window.renderMathInElement) {
          window.renderMathInElement(document.body, {
            delimiters: [
              {left: '$$', right: '$$', display: true},
              {left: '$', right: '$', display: false},
              {left: '\[', right: '\]', display: true},
              {left: '\(', right: '\)', display: false}
            ],
            throwOnError: false
          });
        }
      }, 1000);
    }
  }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Math Test Page</h1>
      
      <h2>Inline Math</h2>
      <p>The derivative of a function $f(x)$ with respect to $x$ is defined as:</p>
      
      <h2>Display Math</h2>
      <p>$$f'(x) = \lim_{h \to 0} \frac{f(x+h) - f(x)}{h}$$</p>
      
      <h2>Another Example</h2>
      <p>The integral is the inverse operation of differentiation. The definite integral is defined as:</p>
      
      <p>$$\int_a^b f(x) dx = \lim_{n \to \infty} \sum_{i=1}^{n} f(x_i^*) \Delta x$$</p>
      
      <h2>LaTeX-style delimiters</h2>
      <p>This should also work: \[E = mc^2\]</p>
      
      <p>And inline: \(E = mc^2\)</p>
      
      <style jsx>{`
        h1, h2 {
          margin-top: 2rem;
          margin-bottom: 1rem;
        }
        p {
          margin-bottom: 1rem;
          line-height: 1.6;
        }
      `}</style>
    </div>
  );
}

// Add type declarations for KaTeX
declare global {
  interface Window {
    katex?: any;
    renderMathInElement?: (
      element: HTMLElement,
      options?: {
        delimiters?: Array<{ left: string; right: string; display: boolean }>;
        throwOnError?: boolean;
      }
    ) => void;
  }
}