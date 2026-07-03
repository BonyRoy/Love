import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { getBeatifyDb } from "./config";

export async function fetchBeatifyTrack(uuid) {
  const trimmed = uuid?.trim();
  if (!trimmed) return null;

  const beatifyDb = await getBeatifyDb();
  const q = query(
    collection(beatifyDb, "music"),
    where("uuid", "==", trimmed),
    limit(1),
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;

  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() };
}
