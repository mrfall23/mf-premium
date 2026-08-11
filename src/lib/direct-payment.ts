// Coordonnées de paiement direct (mobile money) — l'argent arrive directement
// sur les comptes du vendeur, sans passer par un agrégateur.
export interface PaymentMethod {
  operator: string;
  number: string;
  name: string;
  color: string;
  ussd?: string;
}

export const DIRECT_PAYMENT_METHODS: PaymentMethod[] = [
  { operator: 'Orange Money', number: '697275048', name: 'Andre Mbarga', color: '#ff7900', ussd: '#150#' },
  { operator: 'MTN MoMo', number: '651536287', name: 'Andre Mbarga', color: '#ffcc00', ussd: '*126#' },
];
