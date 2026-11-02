import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { getProductById } from '../services/productService.js';

function ProductDetail() {
  const { id } = useParams();
  const location = useLocation();
  const localProduct = location.state?.localProduct;
  const [product, setProduct] = useState(localProduct ?? null);
  const [loading, setLoading] = useState(!localProduct);
  const [error, setError] = useState('');

  useEffect(() => {
    if (localProduct && String(localProduct.id) === id) return;
    const controller = new AbortController();

    async function loadProduct() {
      setLoading(true);
      setError('');
      try {
        const data = await getProductById(id, controller.signal);
        setProduct(data);
      } catch (err) {
        if (err.name !== 'AbortError') setError(err.message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadProduct();
    return () => controller.abort();
  }, [id, localProduct]);

  if (loading) return <p role="status">Cargando producto...</p>;
  if (error) return <p className="error" role="alert">{error} <Link to="/products">Volver a productos</Link></p>;
  if (!product) return <p>Producto no encontrado.</p>;

  return (
    <section className="product-detail">
      <Link to="/products">← Regresar al catálogo</Link>
      <h1>{product.title}</h1>
      {product.thumbnail && <img src={product.thumbnail} alt={product.title} />}
      <p>{product.description}</p>
      <p><strong>Categoría:</strong> {product.category}</p>
      <p><strong>Precio:</strong> ${Number(product.price).toFixed(2)}</p>
      <p><strong>Stock:</strong> {product.stock}</p>
      <p><strong>Rating:</strong> {product.rating}</p>
    </section>
  );
}

export default ProductDetail;
