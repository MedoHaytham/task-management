import { Inter } from 'next/font/google';
import './globals.css';

import StoreProvider from '../components/StoreProvider';
import { AlertProvider } from '../context/AlertContext';
import Alert from '../components/Alert';
import AuthGate from '../components/AuthGate';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata = {
  title: {
    template: 'Task Board | %s',
    default: 'Task Board — Team task management',
  },
  description: 'Team task management application',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-grey-50">
        <StoreProvider>
          <AlertProvider>
            <AuthGate>
              <Alert />
              {children}
            </AuthGate>
          </AlertProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
