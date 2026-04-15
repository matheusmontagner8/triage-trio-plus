const TriageProtocol = () => (
  <div className="border border-border rounded-[10px] overflow-hidden">
    <div className="px-3.5 py-2.5 text-[10px] font-semibold tracking-wider uppercase text-muted-foreground border-b border-border bg-surface2">
      Classificação de risco
    </div>
    {[
      { color: 'bg-triage-red', label: 'Vermelho', desc: 'PA > 180/120 · Temp > 40°C', time: 'Imediato' },
      { color: 'bg-triage-orange', label: 'Laranja', desc: 'PA > 160/100 · Temp > 39°C', time: '10 min' },
      { color: 'bg-triage-yellow', label: 'Amarelo', desc: 'Temp 38–38.9°C · PA moderada', time: '60 min' },
      { color: 'bg-triage-green', label: 'Verde', desc: 'Sinais vitais estáveis', time: '120 min' },
    ].map((item) => (
      <div key={item.label} className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-border last:border-b-0 text-xs">
        <div className={`w-[9px] h-[9px] rounded-full ${item.color} shrink-0`} />
        <div className="flex-1">
          <div className="font-semibold text-[11px]">{item.label}</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">{item.desc}</div>
        </div>
        <div className="font-mono text-[10px] text-muted-foreground">{item.time}</div>
      </div>
    ))}
  </div>
);

export default TriageProtocol;
