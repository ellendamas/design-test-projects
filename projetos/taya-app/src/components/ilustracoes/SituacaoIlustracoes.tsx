// Ilustrações dos 4 cards de "A vida real não avisa." (slots A2 a A5), convertidas do SVG do
// protótipo de referência (docs/referencia-lp-artefato.html) pra componentes React — mesma arte,
// só sem o wrapper de tile escura que o protótipo usava. Cada uma preenche a área de imagem no
// topo do card, igual aos cards de "Benefícios a caminho" do hub de Assistências.
import type { ComponentType } from "react";

export function IlustracaoFebreNoturna({ className = "h-full w-full" }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 200" className={className} role="img" aria-label="Lua e termômetro">
      <defs>
        <linearGradient id="sit-gN" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#231E19" />
          <stop offset="1" stopColor="#3E3029" />
        </linearGradient>
        <mask id="sit-mM">
          <rect width="320" height="200" fill="#fff" />
          <circle cx="104" cy="60" r="30" fill="#000" />
        </mask>
      </defs>
      <rect width="320" height="200" fill="url(#sit-gN)" />
      <circle cx="86" cy="70" r="38" fill="#FFE9B8" mask="url(#sit-mM)" />
      <g fill="#FFE9B8">
        <circle cx="150" cy="38" r="2.5" />
        <circle cx="176" cy="74" r="2" />
        <circle cx="52" cy="140" r="2" />
        <circle cx="130" cy="150" r="3" />
        <circle cx="196" cy="30" r="2" />
      </g>
      <rect x="226" y="40" width="24" height="96" rx="12" fill="#fff" />
      <circle cx="238" cy="146" r="22" fill="#fff" />
      <rect x="233.5" y="66" width="9" height="78" rx="4.5" fill="#E03B2F" />
      <circle cx="238" cy="146" r="14" fill="#E03B2F" />
      <path d="M258 58h14M258 76h10M258 94h14M258 112h10" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0.55" />
    </svg>
  );
}

export function IlustracaoFarmacia({ className = "h-full w-full" }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 200" className={className} role="img" aria-label="Receita, cápsula e selo de desconto">
      <defs>
        <linearGradient id="sit-gF" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFE3D1" />
          <stop offset="1" stopColor="#FFC995" />
        </linearGradient>
      </defs>
      <rect width="320" height="200" fill="url(#sit-gF)" />
      <g transform="rotate(-6 110 104)">
        <rect x="56" y="30" width="112" height="144" rx="12" fill="#fff" />
        <text x="74" y="62" fontSize="24" fontWeight="800" fill="#BF3F0C">Rx</text>
        <rect x="74" y="78" width="76" height="7" rx="3.5" fill="#D9CFC2" />
        <rect x="74" y="94" width="60" height="7" rx="3.5" fill="#D9CFC2" />
        <rect x="74" y="110" width="70" height="7" rx="3.5" fill="#D9CFC2" />
        <rect x="74" y="126" width="44" height="7" rx="3.5" fill="#D9CFC2" />
      </g>
      <g transform="rotate(-28 214 120)">
        <rect x="164" y="98" width="100" height="44" rx="22" fill="#fff" />
        <path d="M214 98h28a22 22 0 0 1 0 44h-28z" fill="#FD5F31" />
      </g>
      <circle cx="256" cy="52" r="34" fill="#FFCC05" />
      <text x="256" y="48" textAnchor="middle" fontSize="12" fontWeight="800" fill="#231E19">até</text>
      <text x="256" y="70" textAnchor="middle" fontSize="24" fontWeight="800" fill="#231E19">80%</text>
    </svg>
  );
}

export function IlustracaoDorDeDente({ className = "h-full w-full" }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 200" className={className} role="img" aria-label="Dente e brilhos">
      <defs>
        <linearGradient id="sit-gD" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#D8EEF8" />
          <stop offset="1" stopColor="#A9D8EC" />
        </linearGradient>
      </defs>
      <rect width="320" height="200" fill="url(#sit-gD)" />
      <g transform="translate(118 36) scale(4.6)">
        <path
          d="M12 5.5c-1.2-1.2-3-1.8-4.8-1.3C5 4.7 4 6.6 4 8.8c0 1.8.7 3.2 1.1 4.8.5 2 .7 5.4 2.1 5.7 1.3.2 1.5-2.8 2.1-4 .3-.6.8-1 1.7-1s1.4.4 1.7 1c.6 1.2.8 4.2 2.1 4 1.4-.3 1.6-3.7 2.1-5.7.4-1.6 1.1-3 1.1-4.8 0-2.2-1-4.1-3.2-4.6-1.8-.5-3.6.1-4.8 1.3Z"
          fill="#fff"
          stroke="#0F5878"
          strokeWidth="0.7"
          strokeLinejoin="round"
        />
      </g>
      <g fill="#FFCC05">
        <path d="M66 58l4 10 10 4-10 4-4 10-4-10-10-4 10-4z" />
        <path d="M258 46l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" />
        <path d="M244 142l4 10 10 4-10 4-4 10-4-10-10-4 10-4z" />
      </g>
    </svg>
  );
}

export function IlustracaoFamilia({ className = "h-full w-full" }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 200" className={className} role="img" aria-label="Três gerações da mesma família">
      <defs>
        <linearGradient id="sit-gFam" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFF1CC" />
          <stop offset="1" stopColor="#FFDC7A" />
        </linearGradient>
      </defs>
      <rect width="320" height="200" fill="url(#sit-gFam)" />
      <path d="M160 52c-3-5-11-5-14 1-3 6 2 11 14 20 12-9 17-14 14-20-3-6-11-6-14-1z" fill="#E03B2F" transform="translate(0 -6)" />
      <path d="M76 168c0-34 10-44 22-44s22 10 22 44z" fill="#0F5878" />
      <circle cx="98" cy="106" r="15" fill="#EBC3A5" />
      <path d="M84 102c0-10 8-16 14-16s14 6 14 16c-4-5-9-7-14-7s-10 2-14 7z" fill="#C9C2BA" />
      <path d="M68 128v40" stroke="#231E19" strokeWidth="4" strokeLinecap="round" />
      <path d="M132 168c0-44 14-58 28-58s28 14 28 58z" fill="#FD5F31" />
      <circle cx="160" cy="90" r="17" fill="#E8B48E" />
      <path d="M143 86c0-12 9-19 17-19s17 7 17 19c-5-6-10-8-17-8s-12 2-17 8z" fill="#2A2320" />
      <path d="M206 168c0-26 8-34 18-34s18 8 18 34z" fill="#1F7BA3" />
      <circle cx="224" cy="118" r="13" fill="#D9936B" />
      <path d="M212 115c0-9 6-14 12-14s12 5 12 14c-4-4-8-6-12-6s-8 2-12 6z" fill="#2A2320" />
      <rect x="40" y="168" width="240" height="6" rx="3" fill="#231E19" opacity="0.1" />
    </svg>
  );
}

export const ILUSTRACAO_POR_SLOT: Record<string, ComponentType<{ className?: string }>> = {
  A2: IlustracaoFebreNoturna,
  A3: IlustracaoFarmacia,
  A4: IlustracaoDorDeDente,
  A5: IlustracaoFamilia,
};
