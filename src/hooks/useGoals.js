// src/hooks/useGoals.js
import { useState, useEffect } from "react";
import {
  collection, addDoc, getDocs, deleteDoc,
  doc, updateDoc, serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/config";

export function useGoals(uid) {
  const [goals, setGoals] = useState([]);

  useEffect(() => {
    if (!uid) { setGoals([]); return; }
    async function load() {
      const snap = await getDocs(collection(db, "users", uid, "goals"));
      setGoals(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }
    load();
  }, [uid]);

  async function addGoal(goal) {
    const ref = await addDoc(collection(db, "users", uid, "goals"), {
      ...goal, savedAmount: 0, createdAt: serverTimestamp(),
    });
    setGoals(prev => [...prev, { id: ref.id, ...goal, savedAmount: 0 }]);
  }

  async function addSavings(id, amount) {
    const goal     = goals.find(g => g.id === id);
    if (!goal) return;
    const newSaved = (Number(goal.savedAmount) || 0) + amount;
    await updateDoc(doc(db, "users", uid, "goals", id), { savedAmount: newSaved });
    setGoals(prev => prev.map(g => g.id === id ? { ...g, savedAmount: newSaved } : g));
  }

  async function deleteGoal(id) {
    await deleteDoc(doc(db, "users", uid, "goals", id));
    setGoals(prev => prev.filter(g => g.id !== id));
  }

  return { goals, addGoal, addSavings, deleteGoal };
}
