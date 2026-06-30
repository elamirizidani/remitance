import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './globals.css';
import Navbar from '@/components/Navbar';
import TrustFooter from '@/components/TrustFooter';

export const metadata = {
  title: 'Fasta Fasta | Premium Money Transfer to Rwanda',
  description: 'Send money from the UK and Belgium to Rwanda. Zero hidden fees, real-time rates, and instant delivery.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={{ background: '#ffffff' }}>
      <body>
        <Navbar />
        <main className="app-shell animate-fade-in">
          {children}
        </main>
        <TrustFooter />
      </body>
    </html>
  );
}
