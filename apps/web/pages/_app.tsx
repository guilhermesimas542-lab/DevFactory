import type { AppProps } from 'next/app'
import type { NextPage } from 'next'
import { SessionProvider } from 'next-auth/react'
import { ModelProvider } from '@/contexts/ModelContext'
import '@/styles/globals.css'

type NextPageWithLayout = NextPage & {
  getLayout?: (page: React.ReactElement) => React.ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page: React.ReactElement) => page);

  return (
    <SessionProvider session={session}>
      <ModelProvider>
        {getLayout(<Component {...pageProps} />)}
      </ModelProvider>
    </SessionProvider>
  )
}
