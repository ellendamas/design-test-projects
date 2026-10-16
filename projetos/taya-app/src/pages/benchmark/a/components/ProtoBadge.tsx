// Guardrail 2 do briefing — selo discreto e constante em toda tela da Versão A, deixando
// claro que parceiros/ofertas aqui são 100% fictícios. Texto em 12px (não menor), nunca
// depende só de estar "pequeno" ou de cor pra passar a mensagem.
export function ProtoBadge() {
  return (
    <div className="flex items-center justify-center bg-muted px-3 py-1.5">
      <p className="text-xs font-medium text-muted-foreground">Protótipo interno · dados fictícios</p>
    </div>
  );
}
