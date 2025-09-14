import type { AppProps } from 'next/app';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider, theme, App } from 'antd';
import '../shared/styles/globals.css';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AntdRegistry>
      <ConfigProvider
        theme={{
          algorithm: theme.darkAlgorithm,
          cssVar: true,
          hashed: false,
          token: {
            // 기타
            borderRadius: 8,
            wireframe: false,
          },
        }}
      >
        <App>
          <Component {...pageProps} />
        </App>
      </ConfigProvider>
    </AntdRegistry>
  );
}
