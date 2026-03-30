'use client';

interface Props {
  rightSlot?: React.ReactNode;
}

export default function AppHeader({ rightSlot }: Props) {
  return (
    <header className="text-white shadow-md" style={{ backgroundColor: '#0b1e16' }}>
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src="/logo_dom-pagamentos.png"
            alt="Dom Pagamentos"
            className="h-9 w-auto object-contain"
          />
          <div>
            <h1 className="text-xl font-bold leading-none">CX Assistant</h1>
            <p className="text-white/50 text-xs mt-0.5">Base de Conhecimento Interna</p>
          </div>
        </div>
        {rightSlot && <div>{rightSlot}</div>}
      </div>
    </header>
  );
}
