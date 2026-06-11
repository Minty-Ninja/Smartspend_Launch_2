// src/hooks/useExpenses.js
import { useState, useEffect } from "react";
import {
  collection, addDoc, getDocs, deleteDoc,
  doc, query, orderBy, serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/config";

export function useExpenses(uid) {
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    if (!uid) { setExpenses([]); return; }
    async function load() {
      try {
        const q    = query(collection(db, "users", uid, "expenses"), orderBy("Date", "desc"));
        const snap = await getDocs(q);
        setExpenses(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch {
        // Fallback: no orderBy if index missing
        const snap = await getDocs(collection(db, "users", uid, "expenses"));
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        list.sort((a, b) => new Date(b.Date) - new Date(a.Date));
        setExpenses(list);
      }
    }
    load();
  }, [uid]);

  async function addExpense(expense) {
    const ref = await addDoc(collection(db, "users", uid, "expenses"), {
      ...expense, createdAt: serverTimestamp(),
    });
    setExpenses(prev => [{ id: ref.id, ...expense }, ...prev]);
  }

  async function deleteExpense(id) {
    await deleteDoc(doc(db, "users", uid, "expenses", id));
    setExpenses(prev => prev.filter(e => e.id !== id));
  }

  return { expenses, addExpense, deleteExpense };
}
