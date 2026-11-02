const API_URL = 'https://dummyjson.com/products';

async function request(path = '', options = {}) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, options);
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new Error('No se pudo conectar con DummyJSON. Revisa tu conexión.');
  }

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.message || `La petición falló (HTTP ${response.status}).`);
  }
  return data;
}
export function getProducts(limit = 12, skip = 0, signal) {
  return request(`?limit=${limit}&skip=${skip}`, { signal });
}
export function getProductById(id, signal) {
  return request(`/${encodeURIComponent(id)}`, { signal });
}
export function searchProducts(query, limit = 12, skip = 0, signal) {
  return request(`/search?q=${encodeURIComponent(query)}&limit=${limit}&skip=${skip}`, { signal });
}
export function getCategories(signal) {
  return request('/categories', { signal });
}
export function getProductsByCategory(category, limit = 12, skip = 0, signal) {
  return request(`/category/${encodeURIComponent(category)}?limit=${limit}&skip=${skip}`, { signal });
}
export function createProduct(product) {
  return request('/add', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  });
}
export function updateProduct(id, product) {
  return request(`/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  });
}
export function deleteProduct(id) {
  return request(`/${encodeURIComponent(id)}`, { method: 'DELETE' });
}
