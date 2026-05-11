import { createContext, useContext, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";

interface CreditCardState {
  valorDesejado: number;
  numeroParcelas: number;
  tabelaSelecionada: string;
  rg: string;
  dataNascimento: string;
  renda: number;
  estadoCivil: string;
  sexo: string;
  enderecoConfirmado: boolean;
  bancoConfirmado: boolean;
  numeroCartao: string;
  nomeCartao: string;
  vencimento: string;
  cvv: string;
  termoAceito: boolean;
  selfieOwnershipOk: boolean;
  selfieIdentityOk: boolean;
}

const initialState: CreditCardState = {
  valorDesejado: 2000,
  numeroParcelas: 6,
  tabelaSelecionada: "padrao",
  rg: "",
  dataNascimento: "",
  renda: 0,
  estadoCivil: "",
  sexo: "",
  enderecoConfirmado: false,
  bancoConfirmado: false,
  numeroCartao: "",
  nomeCartao: "",
  vencimento: "",
  cvv: "",
  termoAceito: false,
  selfieOwnershipOk: false,
  selfieIdentityOk: false,
};

interface CreditCardContextType {
  state: CreditCardState;
  setState: Dispatch<SetStateAction<CreditCardState>>;
}

const CreditCardContext = createContext<CreditCardContextType>({
  state: initialState,
  setState: () => {},
});

export function CreditCardProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CreditCardState>(initialState);
  return <CreditCardContext.Provider value={{ state, setState }}>{children}</CreditCardContext.Provider>;
}

export const useCreditCard = () => useContext(CreditCardContext);
