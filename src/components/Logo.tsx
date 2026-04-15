interface LogoProps {
  subtitle?: string;
}

const Logo = ({ subtitle = 'Protocolo Manchester' }: LogoProps) => (
  <div className="flex items-center gap-3">
    <div className="w-9 h-9 bg-accent rounded-[10px] flex items-center justify-center">
      <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5">
        <path d="M10 3v14M3 10h14" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    </div>
    <div>
      <div className="font-heading font-bold text-[15px]">TriageEngine</div>
      <div className="text-[11px] text-muted-foreground">{subtitle}</div>
    </div>
  </div>
);

export default Logo;
