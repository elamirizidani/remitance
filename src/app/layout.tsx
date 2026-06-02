import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './globals.css';
import Navbar from '@/components/Navbar';
import TrustFooter from '@/components/TrustFooter';
import { TransferProvider } from '@/context/TransferContext';

export const metadata = { 
  title: 'Fasta fasta | Secure Global Money Transfer',
  description: 'Send money internationally with clear fees, competitive rates, fast delivery, and banking-grade security.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={{ background: '#020617' }}>
      <body>
        <TransferProvider>
          <Navbar />
          <main className="app-shell animate-fade-in">
            {children}
          </main>
          <TrustFooter />
        </TransferProvider>
      </body>
    </html>
  );
}
