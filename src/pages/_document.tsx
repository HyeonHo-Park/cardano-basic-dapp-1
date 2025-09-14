import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang='ko' className='dark'>
      <Head>
        <link rel='icon' href='/cardano-logo.svg' />
        <link rel='shortcut icon' href='/cardano-logo.svg' />
        <link rel='apple-touch-icon' href='/cardano-logo.svg' />
        <meta
          name='description'
          content='카르다노 블록체인 기반 탈중앙화 애플리케이션'
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
