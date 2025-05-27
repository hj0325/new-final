import { useEffect } from 'react';

export default function App({ Component, pageProps }) {
  useEffect(() => {
    // 기본 마진 제거만 적용
    const style = document.createElement('style');
    style.textContent = `
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      html, body {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        overflow-x: hidden;
      }
      
      #__next {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      if (style.parentNode) {
        document.head.removeChild(style);
      }
    };
  }, []);

  return <Component {...pageProps} />;
} 