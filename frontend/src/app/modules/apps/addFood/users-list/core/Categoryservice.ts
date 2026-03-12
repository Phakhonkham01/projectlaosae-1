// ─── Types ────────────────────────────────────────────────────────────────────
export interface Category {
  category_id: string;  // ໄອດີປະເພດ
  name: string;         // ຊື່ປະເພດ
}

export type CategoryCreate = Omit<Category, "category_id">;
export type CategoryUpdate = Partial<CategoryCreate>;

// ─── Imports ──────────────────────────────────────────────────────────────────
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../../../../../../../firebase/useFirebase"; // adjust path as needed

const COLLECTION = "categories";
const colRef = () => collection(db, COLLECTION);

// ─── GET ALL ──────────────────────────────────────────────────────────────────
export const getAllCategories = async (): Promise<Category[]> => {
  const snapshot = await getDocs(colRef());
  return snapshot.docs.map((d) => ({ category_id: d.id, ...d.data() } as Category));
};

// ─── GET BY ID ────────────────────────────────────────────────────────────────
export const getCategoryById = async (id: string): Promise<Category | null> => {
  const snap = await getDoc(doc(db, COLLECTION, id));
  if (!snap.exists()) return null;
  return { category_id: snap.id, ...snap.data() } as Category;
};

// ─── CREATE ───────────────────────────────────────────────────────────────────
export const createCategory = async (data: CategoryCreate): Promise<Category> => {
  const docRef = await addDoc(colRef(), data);
  return { category_id: docRef.id, ...data };
};

export const createCategoryWithId = async (
  id: string,
  data: CategoryCreate
): Promise<Category> => {
  await setDoc(doc(db, COLLECTION, id), data);
  return { category_id: id, ...data };
};

// ─── UPDATE ───────────────────────────────────────────────────────────────────
export const updateCategory = async (
  id: string,
  data: CategoryUpdate
): Promise<void> => {
  await updateDoc(doc(db, COLLECTION, id), data as Record<string, unknown>);
};

// ─── DELETE ───────────────────────────────────────────────────────────────────
export const deleteCategory = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, COLLECTION, id));
};