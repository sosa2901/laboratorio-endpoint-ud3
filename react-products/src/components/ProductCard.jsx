import { Link } from 'react-router-dom';

function ProductCard({ product, onEdit, onDelete, isBusy = false }) {
  return (
    <article className="product-card">
      {product.thumbnail ? (
        <img src={product.thumbnail} alt={product.title} loading="lazy" />
      ) : (
        <div className="product-placeholder" role="img" aria-label="Producto sin imagen">Sin imagen</div>
      )}
      <h3>{product.title}</h3>
      <p>{product.category || 'Sin categoría'}</p>
      <strong>${Number(product.price).toFixed(2)}</strong>
      <div className="actions">
        <Link to={`/products/${product.id}`} state={product.isLocal ? { localProduct: product } : undefined}>Ver detalle</Link>
        <button type="button" onClick={() => onEdit(product)} disabled={isBusy}>Editar</button>
        <button type="button" onClick={() => onDelete(product.id)} disabled={isBusy}>Eliminar</button>
      </div>
    </article>
  );
}

export default ProductCard;
