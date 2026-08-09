// Formatage monétaire DÉTERMINISTE (identique côté serveur et navigateur).
//
// `Number.toLocaleString()` sans locale dépend de la locale du runtime :
// le serveur (Node) rend "2,500" alors qu'un navigateur français rend "2 500".
// Cette différence casse l'hydratation React (#418) et rend la page non
// interactive (boutons "Ajouter au panier"/"Payer" morts). On formate donc
// nous-mêmes, avec une espace fixe, sans dépendre d'aucune locale.
export function formatFCFA(n: number | string | null | undefined): string {
  const num = Math.round(Number(n) || 0);
  const sign = num < 0 ? '-' : '';
  return sign + Math.abs(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}
