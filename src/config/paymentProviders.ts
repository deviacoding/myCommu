// Prestataires de paiement qu'une communauté peut connecter pour recevoir les dons.
// Maquette : la connexion est simulée, mais les informations (frais, pays, moyens) sont celles des vrais services.

export type PaymentProviderId = 'stripe' | 'bit' | 'lemonsqueezy';

export interface PaymentProvider {
  id: PaymentProviderId;
  name: string;
  color: string; // couleur de marque
  onColor: string; // texte sur la couleur de marque
  // Comment on se connecte au service : compte en ligne (e-mail), ou téléphone (Bit).
  login: 'email' | 'phone';
  countries: string[]; // codes ISO où le service est pertinent ; vide = monde entier
  methods: string[]; // moyens proposés aux fidèles
}

export const PAYMENT_PROVIDERS: PaymentProvider[] = [
  { id: 'stripe', name: 'Stripe', color: '#635BFF', onColor: '#FFFFFF', login: 'email', countries: [], methods: ['Carte bancaire', 'Apple Pay', 'Google Pay', 'SEPA'] },
  { id: 'bit', name: 'Bit', color: '#12A5A0', onColor: '#FFFFFF', login: 'phone', countries: ['IL'], methods: ['Paiement instantané par téléphone'] },
  { id: 'lemonsqueezy', name: 'Lemon Squeezy', color: '#FFC233', onColor: '#1F1F1F', login: 'email', countries: [], methods: ['Carte bancaire', 'PayPal', 'Apple Pay'] },
];

// Pays où Stripe ne peut pas ouvrir de compte pour une communauté (Stripe n'y opère pas) : Bit prend le relais en Israël.
export const STRIPE_UNSUPPORTED_COUNTRIES = ['IL'];

export function paymentProvider(id: PaymentProviderId): PaymentProvider {
  return PAYMENT_PROVIDERS.find((p) => p.id === id) ?? PAYMENT_PROVIDERS[0];
}
