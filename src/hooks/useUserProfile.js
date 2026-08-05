import { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export function useUserProfile() {
  const [displayName, setDisplayName] = useState(null);
  const [loading, setLoading] = useState(true);
  const [needsName, setNeedsName] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const uid = auth.currentUser?.uid;
      if (!uid) return;
      const ref = doc(db, "users", uid);
      const snap = await getDoc(ref);
      if (snap.exists() && snap.data().displayName) {
        setDisplayName(snap.data().displayName);
        setNeedsName(false);
      } else {
        setNeedsName(true);
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const saveName = async (name) => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    await setDoc(doc(db, "users", uid), { displayName: name }, { merge: true });
    setDisplayName(name);
    setNeedsName(false);
  };

  return { displayName, loading, needsName, saveName };
}