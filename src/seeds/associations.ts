import { Association, CommunityId, Congregation, receiptFormatFor } from '../types';

// Associations de la démo : chaque communauté a son association ; la communauté principale juive en a
// trois, pour montrer le cas courant d'un responsable à cheval sur deux pays (Cerfa / Seif 46)
// et d'une œuvre distincte (Hevra Kadisha).
export function demoAssociations(religion: CommunityId, congregations: Congregation[], defaultCongregation: string): Association[] {
  const out: Association[] = [];
  for (const k of congregations) {
    const country = k.country ?? 'FR';
    if (religion === 'jewish' && k.id === defaultCongregation) {
      out.push(
        { id: `${k.id}-fr`, congregationId: k.id, name: `Association ${k.name}`, purpose: 'Synagogue', country: 'FR', receiptFormat: 'cerfa', legalId: 'W751234567', address: k.address, city: k.city, president: 'M. Raphaël Benhamou, président', isDefault: true },
        { id: `${k.id}-il`, congregationId: k.id, name: `Amutat ${k.name}`, purpose: 'Synagogue (Israël)', country: 'IL', receiptFormat: 'seif46', legalId: '580-123-456', address: 'Rehov Ben Yehuda 8', city: 'Jérusalem', president: 'M. Raphaël Benhamou, président', isDefault: false },
        { id: `${k.id}-hk`, congregationId: k.id, name: `Hevra Kadisha ${k.name}`, purpose: 'Hevra Kadisha', country: 'FR', receiptFormat: 'cerfa', legalId: 'W751234568', address: k.address, city: k.city, president: 'M. Yossef Benhamou, président', isDefault: false }
      );
      continue;
    }
    out.push({ id: `${k.id}-asso`, congregationId: k.id, name: `Association ${k.name}`, country, receiptFormat: receiptFormatFor(country), address: k.address, city: k.city, isDefault: true });
  }
  return out;
}
