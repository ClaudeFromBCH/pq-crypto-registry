import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { ThemeToggle } from '@/components/theme-toggle';
import Link from 'next/link';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap'
});

export const metadata: Metadata = {
  title: 'PQ Crypto Registry',
  description: 'A reference registry of post-quantum cryptographic algorithms.'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange
        >
          <div className='mx-auto max-w-3xl px-6 py-8'>
            <header className='mb-12 flex items-center justify-between'>
              <Link
                href='/'
                className='text-lg font-semibold tracking-tight text-foreground'
              >
                PQ Crypto Registry
              </Link>
              <nav className='flex items-center gap-6'>
                <Link
                  href='/methodology'
                  className='text-sm text-muted-foreground hover:text-foreground'
                >
                  Methodology
                </Link>
                <Link
                  href='/glossary'
                  className='text-sm text-muted-foreground hover:text-foreground'
                >
                  Glossary
                </Link>
                <ThemeToggle />
              </nav>
            </header>
            <main>{children}</main>
            <footer className='mt-16 border-t border-border pt-6 pb-8'>
              <p className='text-sm text-muted-foreground'>
                Maintained by{' '}
                <a
                  href='https://projecteleven.com'
                  className='underline hover:text-foreground'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  Project Eleven
                </a>
                . Open source.{' '}
                <a
                  href='https://github.com/p-11/pq-crypto-registry'
                  className='underline hover:text-foreground'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  PRs welcome.
                </a>
              </p>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
