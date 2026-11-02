import ProductCard from './ProductCard.jsx';

function ProductList({ products, onEdit, onDelete, busyId }) {
  if (!products.length) {
    return <p>No se encontraron productos.</p>;
  }

  return (
    <section className="product-grid" aria-label="Listado de productos">
      {products.map((product) => (
        <ProductCard
          key={product.localKey ?? product.id}
          product={product}
          onEdit={onEdit}
          onDelete={onDelete}
          isBusy={busyId === product.id}
        />
      ))}
    </section>
  );
}

export default ProductList;
