import {
  Bank,
  Briefcase,
  Car,
  Coins,
  Confetti,
  Heartbeat,
  Lightning,
  PiggyBank,
  ShieldCheck,
  SquaresFour,
  Stethoscope,
  Student,
  Wallet,
  type IconProps,
} from "@phosphor-icons/react";

// Resolve os nomes de ícone usados em mockData.ts (strings, pra manter os dados livres de JSX)
// pro componente de ícone de verdade.
export const ICON_MAP: Record<string, React.ComponentType<IconProps>> = {
  Briefcase,
  PiggyBank,
  Wallet,
  Heartbeat,
  Lightning,
  Coins,
  Bank,
  SquaresFour,
  Stethoscope,
  Student,
  Car,
  ShieldCheck,
  Confetti,
};
