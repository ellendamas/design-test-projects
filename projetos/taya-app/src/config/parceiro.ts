// Único lugar do app que conhece o nome do parceiro de saúde — se o parceiro mudar, troca só
// aqui. Nenhum outro arquivo deve escrever "BeneMed" direto no texto (ver regra de copy em
// docs/saude-conteudo-fonte.md).
export const PARCEIRO_NOME = "BeneMed";

export const PARCEIRO_LOGO_SRC = "/images/logo-benemed.png";

// Links reais das lojas de aplicativo (Prompt 1e, 22/10) — único lugar que os guarda; os botões
// "App Store"/"Google Play" (AppStoreBadges.tsx) só os leem daqui.
export const PARCEIRO_APP_STORE_URL = "https://apps.apple.com/br/app/benemed-sa%C3%BAde/id6746201740";
export const PARCEIRO_GOOGLE_PLAY_URL = "https://play.google.com/store/apps/details?id=br.com.benemed_saude&hl=pt_BR";
