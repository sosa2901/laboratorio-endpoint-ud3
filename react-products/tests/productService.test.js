import test, { afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  getProducts,
  getProductById,
  getCategories,
  getProductsByCategory,
  searchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../src/services/productService.js';

const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; });

function mockFetch(result = {}) {
  let request;
  globalThis.fetch = async (url, options = {}) => {
    request = { url, options };
    return { ok: true, json: async () => result };
  };
  return () => request;
}

test('GET general con límite y desplazamiento', async () => {
  const recorded = mockFetch({ products: [], total: 0 });
  await getProducts(12, 24);
  assert.equal(recorded().url, 'https://dummyjson.com/products?limit=12&skip=24');
});

test('GET por identificador', async () => {
  const recorded = mockFetch({ id: 1 });
  await getProductById(1);
  assert.equal(recorded().url, 'https://dummyjson.com/products/1');
});

test('GET búsqueda URL-codificada', async () => {
  const recorded = mockFetch({ products: [] });
  await searchProducts('red phone', 12, 0);
  assert.match(recorded().url, /\/search\?q=red%20phone&limit=12&skip=0$/);
});

test('GET categorías y filtro por categoría', async () => {
  const recorded = mockFetch([]);
  await getCategories();
  assert.match(recorded().url, /\/categories$/);
  await getProductsByCategory('smartphones', 12, 12);
  assert.match(recorded().url, /\/category\/smartphones\?limit=12&skip=12$/);
});

test('POST crear producto', async () => {
  const recorded = mockFetch({ id: 195 });
  await createProduct({ title: 'Prueba', price: 15 });
  assert.match(recorded().url, /\/add$/);
  assert.equal(recorded().options.method, 'POST');
  assert.deepEqual(JSON.parse(recorded().options.body), { title: 'Prueba', price: 15 });
});

test('PUT actualizar producto', async () => {
  const recorded = mockFetch({ id: 1 });
  await updateProduct(1, { title: 'Nuevo nombre' });
  assert.equal(recorded().options.method, 'PUT');
  assert.match(recorded().url, /\/1$/);
});

test('DELETE eliminar producto', async () => {
  const recorded = mockFetch({ isDeleted: true });
  await deleteProduct(1);
  assert.equal(recorded().options.method, 'DELETE');
  assert.match(recorded().url, /\/1$/);
});

test('API con error HTTP produce mensaje comprensible', async () => {
  globalThis.fetch = async () => ({ ok: false, status: 404, json: async () => ({ message: 'No encontrado' }) });
  await assert.rejects(getProductById(99999), /No encontrado/);
});
