import { useState, useEffect, useCallback } from "react";

// ── Product hooks ─────────────────────────────────────────────────────────────
import {
  Product, ProductCreate, ProductUpdate,
  getAllProducts, getProductById,
  getProductsByCategoryId, getAvailableProducts, getAvailableProductsByCategoryId,
  createProduct, createProductWithId,
  updateProduct, toggleAvailability, deleteProduct,
} from "./Productservice";

// ── Category hooks ────────────────────────────────────────────────────────────
import {
  Category, CategoryCreate, CategoryUpdate,
  getAllCategories, getCategoryById,
  createCategory, createCategoryWithId,
  updateCategory, deleteCategory,
} from "./Categoryservice";

// =============================================================================
// PRODUCT HOOKS
// =============================================================================

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setProducts(await getAllProducts());
    } catch (e: any) {
      setError(e.message ?? "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const add = async (data: ProductCreate) => {
    const created = await createProduct(data);
    setProducts((prev) => [...prev, created]);
    return created;
  };

  const addWithId = async (id: string, data: ProductCreate) => {
    const created = await createProductWithId(id, data);
    setProducts((prev) => [...prev, created]);
    return created;
  };

  const edit = async (id: string, data: ProductUpdate) => {
    await updateProduct(id, data);
    setProducts((prev) =>
      prev.map((p) => (p.product_id === id ? { ...p, ...data } : p))
    );
  };

  const toggle = async (id: string, available: boolean) => {
    await toggleAvailability(id, available);
    setProducts((prev) =>
      prev.map((p) => (p.product_id === id ? { ...p, available } : p))
    );
  };

  const remove = async (id: string) => {
    await deleteProduct(id);
    setProducts((prev) => prev.filter((p) => p.product_id !== id));
  };

  return { products, loading, error, refetch: fetch, add, addWithId, edit, toggle, remove };
};

// ─── Single product ───────────────────────────────────────────────────────────
export const useProduct = (id: string) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getProductById(id)
      .then(setProduct)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  return { product, loading, error };
};

// ─── Products by category_id ──────────────────────────────────────────────────
export const useProductsByCategoryId = (category_id: string) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  useEffect(() => {
    if (!category_id) return;
    setLoading(true);
    getProductsByCategoryId(category_id)
      .then(setProducts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [category_id]);

  return { products, loading, error };
};

// ─── Available products ───────────────────────────────────────────────────────
export const useAvailableProducts = (category_id?: string) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const fn = category_id
      ? getAvailableProductsByCategoryId(category_id)
      : getAvailableProducts();
    fn.then(setProducts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [category_id]);

  return { products, loading, error };
};

// =============================================================================
// CATEGORY HOOKS
// =============================================================================

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setCategories(await getAllCategories());
    } catch (e: any) {
      setError(e.message ?? "Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const add = async (data: CategoryCreate) => {
    const created = await createCategory(data);
    setCategories((prev) => [...prev, created]);
    return created;
  };

  const addWithId = async (id: string, data: CategoryCreate) => {
    const created = await createCategoryWithId(id, data);
    setCategories((prev) => [...prev, created]);
    return created;
  };

  const edit = async (id: string, data: CategoryUpdate) => {
    await updateCategory(id, data);
    setCategories((prev) =>
      prev.map((c) => (c.category_id === id ? { ...c, ...data } : c))
    );
  };

  const remove = async (id: string) => {
    await deleteCategory(id);
    setCategories((prev) => prev.filter((c) => c.category_id !== id));
  };

  return { categories, loading, error, refetch: fetch, add, addWithId, edit, remove };
};

// ─── Single category ──────────────────────────────────────────────────────────
export const useCategory = (id: string) => {
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getCategoryById(id)
      .then(setCategory)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  return { category, loading, error };
};