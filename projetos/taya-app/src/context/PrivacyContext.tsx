import { createContext, useContext, useState, type ReactNode } from "react";
import { toast } from "sonner";

interface PrivacyContextType {
  dataVisible: boolean;
  toggleVisibility: () => void;
}

const PrivacyContext = createContext<PrivacyContextType>({
  dataVisible: false,
  toggleVisibility: () => {},
});

export function PrivacyProvider({ children }: { children: ReactNode }) {
  const [dataVisible, setDataVisible] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const stored = localStorage.getItem("seutudo_data_visible");
    return stored === "true";
  });

  const toggleVisibility = () => {
    setDataVisible((prev) => {
      const next = !prev;
      localStorage.setItem("seutudo_data_visible", String(next));
      toast(next ? "Dados visíveis" : "Dados ocultados", {
        duration: 1500,
        position: "top-center",
        style: {
          fontSize: "13px",
          borderRadius: "10px",
          padding: "8px 14px",
          background: "white",
          border: "0.5px solid #E7E5E4",
        },
      });
      return next;
    });
  };

  return <PrivacyContext.Provider value={{ dataVisible, toggleVisibility }}>{children}</PrivacyContext.Provider>;
}

export const usePrivacy = () => useContext(PrivacyContext);
