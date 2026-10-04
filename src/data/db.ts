import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  Query,
  setDoc,
  updateDoc,
  writeBatch,
  deleteField,
  increment as fsIncrement,
  DocumentData,
} from 'firebase/firestore';
import { getDb } from '../firebase/app';

// Couche d'accès aux données. Deux modes :
// - « demo » : tout reste en mémoire (maquette), les écritures sont ignorées ;
// - « firebase » : chaque écriture part dans Firestore, les listes arrivent par abonnement temps réel.
// Les écrans ne voient pas la différence : l'état React est mis à jour dans les deux cas.

export type Coll =
  | 'users'
  | 'congregations'
  | 'memberships'
  | 'staffInvites'
  | 'currents'
  | 'groups'
  | 'paymentLinks'
  | 'courses'
  | 'questions'
  | 'dayEntries'
  | 'holidays'
  | 'agenda'
  | 'donationCategories'
  | 'pledges'
  | 'donations'
  | 'memberDates'
  | 'lives';

export type Op = { type: 'set'; coll: Coll; id: string; data: object; merge?: boolean } | { type: 'update'; coll: Coll; id: string; data: object } | { type: 'delete'; coll: Coll; id: string };

export interface Db {
  mode: 'demo' | 'firebase';
  newId: (prefix?: string) => string;
  set: (coll: Coll, id: string, data: object, merge?: boolean) => Promise<void>;
  update: (coll: Coll, id: string, patch: object) => Promise<void>;
  remove: (coll: Coll, id: string) => Promise<void>;
  batch: (ops: Op[]) => Promise<void>;
}

// Valeurs spéciales utilisables dans un update (ignorées en mode démo).
export const FIELD_DELETE = () => deleteField();
export const FIELD_INCREMENT = (n: number) => fsIncrement(n);

let seq = 1000;

export const demoDb: Db = {
  mode: 'demo',
  newId: (prefix = 'x') => `${prefix}${seq++}`,
  set: async () => undefined,
  update: async () => undefined,
  remove: async () => undefined,
  batch: async () => undefined,
};

function report(action: string, e: unknown) {
  // Les erreurs d'écriture (règles, réseau) sont visibles en console ; l'écran garde sa version locale.
  console.warn(`[firestore] ${action} : ${(e as Error)?.message ?? e}`);
}

export const firebaseDb: Db = {
  mode: 'firebase',
  newId: (prefix = '') => prefix + doc(collection(getDb(), 'ids')).id,
  set: (coll, id, data, merge) => setDoc(doc(getDb(), coll, id), clean(data), { merge: !!merge }).catch((e) => report(`set ${coll}/${id}`, e)),
  update: (coll, id, patch) => updateDoc(doc(getDb(), coll, id), clean(patch) as DocumentData).catch((e) => report(`update ${coll}/${id}`, e)),
  remove: (coll, id) => deleteDoc(doc(getDb(), coll, id)).catch((e) => report(`delete ${coll}/${id}`, e)),
  batch: async (ops) => {
    const b = writeBatch(getDb());
    for (const op of ops) {
      const ref = doc(getDb(), op.coll, op.id);
      if (op.type === 'set') b.set(ref, clean(op.data), { merge: !!op.merge });
      else if (op.type === 'update') b.update(ref, clean(op.data) as DocumentData);
      else b.delete(ref);
    }
    await b.commit().catch((e) => report(`batch (${ops.length})`, e));
  },
};

// Retire les fonctions et les images « require » (nombres) qui ne peuvent pas être stockées.
function clean<T extends object>(data: T): T {
  return JSON.parse(JSON.stringify(data, (k, v) => (typeof v === 'function' ? undefined : v)));
}

// Abonnement à plusieurs requêtes fusionnées en une seule liste (dédoublonnée par id).
export function listenMerged<T extends { id: string }>(queries: Query[], cb: (rows: T[]) => void, onError?: (e: Error) => void): () => void {
  if (!queries.length) {
    cb([]);
    return () => undefined;
  }
  const parts: Map<number, T[]> = new Map();
  const emit = () => {
    const seen = new Map<string, T>();
    for (const rows of parts.values()) for (const r of rows) seen.set(r.id, r);
    cb([...seen.values()]);
  };
  const unsubs: (() => void)[] = [];
  const timers: ReturnType<typeof setTimeout>[] = [];
  let stopped = false;
  // Un refus juste après une adhésion vient d'une règle évaluée avant l'écriture : on réessaie quelques fois.
  const subscribe = (q: Query, i: number, attempt: number) => {
    unsubs[i] = onSnapshot(
      q,
      (snap) => {
        parts.set(i, snap.docs.map((d) => ({ ...(d.data() as object), id: d.id }) as T));
        emit();
      },
      (e) => {
        parts.set(i, []);
        emit();
        if (e.code === 'permission-denied' && attempt < 4 && !stopped) {
          timers.push(setTimeout(() => !stopped && subscribe(q, i, attempt + 1), 1500 * (attempt + 1)));
          return;
        }
        const path = (q as unknown as { _query?: { path?: { segments?: string[] } } })._query?.path?.segments?.join('/') ?? '?';
        console.warn(`[firestore] listen ${path} :`, e.message);
        onError?.(e);
      }
    );
  };
  queries.forEach((q, i) => subscribe(q, i, 0));
  return () => {
    stopped = true;
    timers.forEach(clearTimeout);
    unsubs.forEach((u) => u());
  };
}

// Découpe une liste d'ids par paquets de 30 (limite Firestore pour l'opérateur « in »).
export function chunks<T>(list: T[], size = 30): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size));
  return out;
}
