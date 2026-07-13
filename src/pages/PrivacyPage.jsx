import { Link } from 'react-router-dom';

export default function PrivacyPage() {
  return (
    <div className="container legal-page">
      <Link to="/" className="brand" style={{ marginBottom: 24, display: 'inline-flex' }}>
        <div className="brand-mark">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M4 15V9M9 18V6M14 21V3M19 12V12" stroke="white" strokeWidth="2.6" strokeLinecap="round" />
          </svg>
        </div>
        Alcance
      </Link>

      <h1>Aviso de Privacidad — Alcance</h1>
      <p className="legal-updated"><strong>Última actualización:</strong> 13 de julio de 2026</p>

      <p>
        Este Aviso de Privacidad explica cómo <strong>Alcance</strong>, operada por <strong>IMAGINA</strong>,
        recopila, usa, protege y comparte tu información personal cuando usas la Plataforma.
      </p>

      <hr />

      <h2>1. Responsable del tratamiento de datos</h2>
      <p><strong>IMAGINA</strong>, operadora de la plataforma Alcance, es responsable del tratamiento de los datos personales recopilados a través de la Plataforma.</p>
      <p>Contacto: <strong>aatlantis719@gmail.com</strong></p>

      <hr />

      <h2>2. Datos que recopilamos</h2>
      <p>Dependiendo de tu rol en la Plataforma (Anunciante o Influencer), podemos recopilar:</p>
      <ul>
        <li><strong>Datos de cuenta:</strong> nombre, correo electrónico, contraseña (almacenada de forma encriptada), rol.</li>
        <li><strong>Datos de perfil de Influencer:</strong> categoría de contenido, número de seguidores, tasa de interacción (engagement), biografía, usuario de Instagram/TikTok, foto de perfil.</li>
        <li><strong>Datos de perfil de Anunciante:</strong> nombre de marca, industria, sitio web.</li>
        <li><strong>Datos bancarios:</strong> nombre del banco y número de cuenta, proporcionados voluntariamente por el Influencer para recibir sus pagos.</li>
        <li><strong>Datos de transacciones:</strong> monto de cada Colaboración, comisión retenida, estado de pago, historial de pagos recibidos.</li>
        <li><strong>Contenido de comunicaciones:</strong> mensajes enviados a través del chat integrado entre Anunciantes e Influencers.</li>
        <li><strong>Datos técnicos:</strong> dirección IP, tipo de navegador, y otra información recopilada automáticamente para el funcionamiento y seguridad de la Plataforma.</li>
      </ul>

      <hr />

      <h2>3. Para qué usamos tus datos</h2>
      <p>Usamos tu información para:</p>
      <ul>
        <li>Crear y administrar tu cuenta en Alcance.</li>
        <li>Mostrar tu perfil (Espacios publicados, o catálogo de Espacios) a otros usuarios de la Plataforma.</li>
        <li>Procesar pagos entre Anunciantes e Influencers, incluyendo el pago de tu comisión o de tu parte correspondiente.</li>
        <li>Permitir la comunicación entre Anunciantes e Influencers dentro de una Colaboración.</li>
        <li>Prevenir fraude y proteger la seguridad de la Plataforma.</li>
        <li>Cumplir con obligaciones legales y fiscales aplicables en Guatemala.</li>
        <li>Comunicarte novedades, confirmaciones de pago, o notificaciones relacionadas con tu actividad en la Plataforma.</li>
      </ul>

      <hr />

      <h2>4. Con quién compartimos tus datos</h2>
      <p>No vendemos tu información personal. La compartimos únicamente en estos casos:</p>
      <ul>
        <li><strong>Entre Anunciantes e Influencers:</strong> tu nombre, perfil y (si aplica) foto son visibles para la otra parte de una Colaboración, para permitir la coordinación del trabajo.</li>
        <li><strong>Recurrente</strong> (pasarela de pagos): procesa los pagos realizados en la Plataforma. Recurrente recibe la información necesaria para completar cada transacción, conforme a su propia política de privacidad.</li>
        <li><strong>Cloudinary</strong> (almacenamiento de imágenes): aloja las fotos de perfil que subes a la Plataforma.</li>
        <li><strong>Autoridades competentes:</strong> cuando sea requerido por ley, orden judicial, o para proteger los derechos, seguridad o propiedad de Alcance o de terceros.</li>
      </ul>

      <hr />

      <h2>5. Seguridad de tus datos</h2>
      <p>Tomamos medidas razonables para proteger tu información, incluyendo el uso de contraseñas encriptadas y conexiones seguras (HTTPS). Sin embargo, ningún sistema es 100% infalible, y no podemos garantizar seguridad absoluta.</p>

      <hr />

      <h2>6. Tus derechos</h2>
      <p>Puedes solicitarnos en cualquier momento:</p>
      <ul>
        <li>Acceder a los datos personales que tenemos sobre ti.</li>
        <li>Corregir información incorrecta o desactualizada.</li>
        <li>Solicitar la eliminación de tu cuenta y datos asociados, salvo aquella información que debamos conservar por obligaciones legales o fiscales (por ejemplo, historial de transacciones ya procesadas).</li>
      </ul>
      <p>Para ejercer estos derechos, escríbenos a: <strong>aatlantis719@gmail.com</strong></p>

      <hr />

      <h2>7. Retención de datos</h2>
      <p>Conservamos tu información mientras tu cuenta esté activa, y por el tiempo adicional necesario para cumplir obligaciones legales, fiscales o para resolver disputas relacionadas con transacciones pasadas.</p>

      <hr />

      <h2>8. Cambios a este aviso</h2>
      <p>Podemos actualizar este Aviso de Privacidad periódicamente. Notificaremos cambios importantes dentro de la Plataforma.</p>

      <hr />

      <h2>9. Contacto</h2>
      <p>Si tienes preguntas sobre este Aviso de Privacidad o sobre cómo manejamos tu información, contáctanos en: <strong>aatlantis719@gmail.com</strong></p>

      <hr />

      <p className="legal-disclaimer">
        Este documento es un punto de partida redactado con apoyo de IA y debe ser revisado por un abogado antes de
        su publicación oficial, para asegurar cumplimiento con la legislación guatemalteca vigente en materia de
        protección de datos personales.
      </p>
    </div>
  );
}
