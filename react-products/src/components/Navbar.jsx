import { NavLink } from 'react-router-dom';

function Navbar() {
  return (
    <nav aria-label="Navegación principal">
      <h2>React Products</h2>
      <ul>
        <li><NavLink to="/" end>Inicio</NavLink></li>
        <li><NavLink to="/products">Productos</NavLink></li>
      </ul>
    </nav>
  );
}

export default Navbar;
