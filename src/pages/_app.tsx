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
          token: {
            // 기본 색상 - 모던한 보라/핑크 톤
            colorPrimary: '#8b5cf6', // 보라색 (Violet)
            colorSuccess: '#10b981', // 에메랄드 그린
            colorWarning: '#f59e0b', // 앰버
            colorError: '#ef4444', // 레드
            colorInfo: '#8b5cf6', // 보라색

            // 배경 색상
            colorBgBase: '#0f0f0f', // 메인 배경
            colorBgContainer: '#1a1a1a', // 카드/컨테이너 배경
            colorBgElevated: '#262626', // 모달/드롭다운 배경
            colorBgLayout: '#0f0f0f', // 레이아웃 배경

            // 텍스트 색상
            colorText: '#ffffff', // 주요 텍스트 (흰색)
            colorTextSecondary: '#a6a6a6', // 보조 텍스트 (밝은 회색)
            colorTextTertiary: '#8c8c8c', // 3차 텍스트 (회색)
            colorTextQuaternary: '#666666', // 4차 텍스트 (어두운 회색)

            // 테두리
            colorBorder: '#404040', // 기본 테두리
            colorBorderSecondary: '#303030', // 보조 테두리

            // 기타
            borderRadius: 8,
            wireframe: false,
          },
          components: {
            Layout: {
              bodyBg: '#0f0f0f',
              headerBg: '#1a1a1a',
              siderBg: '#1a1a1a',
              triggerBg: '#262626',
              triggerColor: '#ffffff',
            },
            Card: {
              colorBgContainer: '#1a1a1a',
              colorBorderSecondary: '#404040',
              colorText: '#ffffff',
              colorTextHeading: '#ffffff',
              colorTextSecondary: '#a6a6a6',
            },
            Button: {
              colorText: '#ffffff',
              colorBgContainer: '#262626',
              colorBorder: '#404040',
              colorPrimary: '#8b5cf6', // 보라색
              colorPrimaryHover: '#8b5cf6', // 호버 시에도 같은 색상
              colorPrimaryActive: '#8b5cf6', // 활성 시에도 같은 색상
              boxShadow: 'none', // 기본 그림자 제거
              boxShadowSecondary: 'none', // 보조 그림자 제거
              // 추가로 그라데이션이나 다른 효과 제거
              primaryShadow: 'none',
              dangerShadow: 'none',
            },
            Input: {
              colorText: '#ffffff',
              colorTextPlaceholder: '#8c8c8c',
              colorBgContainer: '#262626',
              colorBorder: '#404040',
              // 호버/포커스 색상은 전역 colorPrimary를 사용하므로 제거
            },
            Select: {
              colorText: '#ffffff',
              colorTextPlaceholder: '#8c8c8c',
              colorBgContainer: '#262626',
              colorBgElevated: '#262626',
              colorBorder: '#404040',
            },
            Table: {
              colorBgContainer: '#1a1a1a',
              colorText: '#ffffff',
              colorTextHeading: '#ffffff',
              colorBorderSecondary: '#404040',
              colorFillAlter: '#262626',
            },
            Menu: {
              colorBgContainer: 'transparent',
              colorText: '#a6a6a6',
              itemSelectedColor: '#ffffff',
              itemSelectedBg: '#8b5cf6', // 보라색 선택
              itemHoverBg: '#262626',
            },
            Modal: {
              colorBgElevated: '#1a1a1a',
              colorText: '#ffffff',
              colorTextHeading: '#ffffff',
            },
            Alert: {
              colorText: '#ffffff',
              colorTextHeading: '#ffffff',
              colorInfoBg: '#1a1a1a',
              colorInfoBorder: '#8b5cf6',
              colorSuccessBg: '#1a2e1a',
              colorSuccessBorder: '#10b981',
              colorWarningBg: '#2e2a1a',
              colorWarningBorder: '#f59e0b',
              colorErrorBg: '#2e1a1a',
              colorErrorBorder: '#ef4444',
            },
            Typography: {
              colorText: '#ffffff',
              colorTextHeading: '#ffffff',
              colorTextSecondary: '#a6a6a6',
            },
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
