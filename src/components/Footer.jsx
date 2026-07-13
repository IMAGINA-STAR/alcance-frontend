import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <span>© {new Date().getFullYear()} Alcance</span>
      <div className="footer-links">
        <Link to="/terminos">Términos</Link>
        <Link to="/privacidad">Privacidad</Link>
      </div>
    </footer>
  );
}
