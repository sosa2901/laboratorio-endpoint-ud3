import { Link } from 'react-router-dom';

function Home() {
  return (
    <section>
      <h1>Gestión de Productos</h1>
      <p>Aplicación desarrollada con React para consumir productos desde DummyJSON.</p>
      <p>Consulta el catálogo, busca artículos, filtra por categoría y practica operaciones HTTP.</p>
      <Link className="primary-link" to="/products">Ver productos</Link>
    </section>
  );
}

export default Home;
