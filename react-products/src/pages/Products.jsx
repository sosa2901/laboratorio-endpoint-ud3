
import { useEffect, useState } from 'react';
import ProductList from '../components/ProductList.jsx';
import {
  createProduct,
  deleteProduct,
  getCategories,
  getProducts,
  getProductsByCategory,
  searchProducts,
  updateProduct,
} from '../services/productService.js';

const LIMIT = 12;
const EMPTY_FORM = { title: '', price: '', description: '' };

function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoriesError, setCategoriesError] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [query, setQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [localProducts, setLocalProducts] = useState([]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadCategories() {
      try {
        const data = await getCategories(controller.signal);
        if (!controller.signal.aborted) {
          setCategories(data);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          setCategoriesError(err.message);
        }
      }
    }

    loadCategories();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      setLoading(true);
      setError('');

      try {
        const skip = (page - 1) * LIMIT;
        let data;

        if (activeQuery) {
          data = await searchProducts(
            activeQuery,
            LIMIT,
            skip,
            controller.signal
          );
        } else if (category) {
          data = await getProductsByCategory(
            category,
            LIMIT,
            skip,
            controller.signal
          );
        } else {
          data = await getProducts(
            LIMIT,
            skip,
            controller.signal
          );
        }

        if (!controller.signal.aborted) {
          setProducts(data.products ?? []);
          setTotal(data.total ?? 0);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadProducts();
    return () => controller.abort();
  }, [page, activeQuery, category, refreshKey]);

  function handleSearch(event) {
    event.preventDefault();
    setCategory('');
    setPage(1);
    setActiveQuery(query.trim());
    setRefreshKey((current) => current + 1);
    setNotice('');
  }

  function handleCategory(event) {
    setCategory(event.target.value);
    setActiveQuery('');
    setQuery('');
    setPage(1);
    setNotice('');
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleEdit(product) {
    setEditingId(product.id);

    setForm({
      title: product.title,
      price: String(product.price),
      description: product.description ?? '',
    });

    setNotice('Editando: ' + product.title);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setNotice('');
  }

  async function handleSave(event) {
    event.preventDefault();

    const payload = {
      title: form.title.trim(),
      price: Number(form.price),
      description: form.description.trim(),
    };

    if (
      !payload.title ||
      !payload.description ||
      !Number.isFinite(payload.price) ||
      payload.price <= 0
    ) {
      setError('Completa el título, descripción y un precio válido.');
      return;
    }

    setSaving(true);
    setError('');
    setNotice('');

    try {
      if (editingId !== null) {
        const createdHere = localProducts.some(
          (item) => item.id === editingId
        );

        const updated = createdHere
          ? payload
          : await updateProduct(editingId, payload);

        setProducts((current) =>
          current.map((item) =>
            item.id === editingId
              ? { ...item, ...updated }
              : item
          )
        );

        setLocalProducts((current) =>
          current.map((item) =>
            item.id === editingId
              ? { ...item, ...updated }
              : item
          )
        );

        setNotice('Producto actualizado en la vista.');
      } else {
        const created = await createProduct(payload);

        const localId = `local-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}`;

        const temp = {
          ...created,
          ...payload,
          id: localId,
          isLocal: true,
          localKey: localId,
        };

        setLocalProducts((current) => [
          temp,
          ...current,
        ]);

        setActiveQuery('');
        setQuery('');
        setCategory('');
        setPage(1);

        setNotice('Producto agregado a la vista.');
      }

      setForm(EMPTY_FORM);
      setEditingId(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('¿Eliminar este producto de la vista?')) {
      return;
    }

    setBusyId(id);
    setError('');
    setNotice('');

    try {
      const createdHere = localProducts.some(
        (item) => item.id === id
      );

      if (!createdHere) {
        await deleteProduct(id);
      }

      setProducts((current) =>
        current.filter((item) => item.id !== id)
      );

      setLocalProducts((current) =>
        current.filter((item) => item.id !== id)
      );

      if (!createdHere) {
        setTotal((current) => Math.max(0, current - 1));
      }

      setNotice('Producto eliminado de la vista.');

      if (editingId === id) {
        cancelEdit();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  const showingLocal = !activeQuery && !category;

  const visibleProducts = showingLocal && page === 1
    ? [...localProducts, ...products].slice(0, LIMIT)
    : products;

  const totalVisible = total + (
    showingLocal ? localProducts.length : 0
  );

  const totalPages = Math.max(
    1,
    Math.ceil(totalVisible / LIMIT)
  );

  return (
    <section>
      <h1>Productos</h1>

      <form className="product-form" onSubmit={handleSave}>
        <h2>
          {editingId !== null
            ? 'Editar producto'
            : 'Crear producto'}
        </h2>

        <label>
          Título
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Título del producto"
            required
          />
        </label>

        <label>
          Precio ($)
          <input
            name="price"
            type="number"
            min="0.01"
            step="0.01"
            value={form.price}
            onChange={handleChange}
            placeholder="Precio"
            required
          />
        </label>

        <label className="full-row">
          Descripción
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Descripción del producto"
            required
          />
        </label>

        <div className="form-actions full-row">
          <button
            className="primary"
            type="submit"
            disabled={saving}
          >
            {saving
              ? 'Guardando...'
              : editingId !== null
                ? 'Actualizar'
                : 'Guardar'}
          </button>

          {editingId !== null && (
            <button
              className="secondary"
              type="button"
              onClick={cancelEdit}
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {notice && (
        <p role="status" className="notice">
          {notice}
        </p>
      )}

      {error && (
        <p role="alert" className="error">
          {error}{' '}
          <button
            type="button"
            onClick={() =>
              setRefreshKey((current) => current + 1)
            }
          >
            Reintentar consulta
          </button>
        </p>
      )}

      <form
        onSubmit={handleSearch}
        className="search-form"
        role="search"
      >
        <input
          type="search"
          aria-label="Buscar productos"
          placeholder="Buscar producto..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />

        <button type="submit">
          Buscar
        </button>
      </form>

      <div className="controls">
        <label htmlFor="category-select">
          Categoría:
        </label>

        <select
          id="category-select"
          value={category}
          onChange={handleCategory}
        >
          <option value="">
            Todas las categorías
          </option>

          {categories.map((item) => {
            const value = typeof item === 'string'
              ? item
              : item.slug;

            const label = typeof item === 'string'
              ? item
              : item.name;

            return (
              <option key={value} value={value}>
                {label}
              </option>
            );
          })}
        </select>

        <span className="helper">
          {totalVisible} resultado(s)
        </span>
      </div>

      {categoriesError && (
        <p className="error" role="alert">
          No se pudieron cargar las categorías: {categoriesError}
        </p>
      )}

      {loading ? (
        <p role="status">
          Cargando productos...
        </p>
      ) : (
        <ProductList
          products={visibleProducts}
          onEdit={handleEdit}
          onDelete={handleDelete}
          busyId={busyId}
        />
      )}

      <div
        className="pagination"
        aria-label="Paginación de productos"
      >
        <button
          type="button"
          onClick={() =>
            setPage((value) => Math.max(1, value - 1))
          }
          disabled={page <= 1 || loading}
        >
          Anterior
        </button>

        <span>
          Página {page} de {totalPages}
        </span>

        <button
          type="button"
          onClick={() =>
            setPage((value) =>
              Math.min(totalPages, value + 1)
            )
          }
          disabled={page >= totalPages || loading}
        >
          Siguiente
        </button>
      </div>
    </section>
  );
}

export default Products;
