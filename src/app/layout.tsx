import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CX Assistant — Base de Conhecimento',
  description: 'Ferramenta interna de suporte para atendentes de Customer Experience',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-gray-50 text-gray-900 antialiased">{children}</body>
    </html>
  );
}
