import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PreguntasFrecuentes.css';

export default function PreguntasFrecuentes() {
  const navigate = useNavigate();
  const [openItems, setOpenItems] = useState([]);

  const toggleItem = (id) => {
    setOpenItems(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const faqData = [
    {
      section: "Sobre la plataforma",
      questions: [
        {
          q: "¿Qué es Double P?",
          a: "Double P es una plataforma web que conecta a personas con tallas plus size y petite para intercambiar, vender o donar ropa de segunda mano. Promovemos la inclusión, la sostenibilidad y el consumo responsable de moda."
        },
        {
          q: "¿Cómo funciona la plataforma?",
          a: "Puedes registrarte, crear tu perfil, subir fotos de tus prendas y elegir si deseas vender, donar o intercambiar. Otros usuarios pueden contactarte directamente desde la aplicación para concretar el acuerdo."
        },
        {
          q: "¿Es necesario pagar para usar Double P?",
          a: "No. El registro y uso general son gratuitos. Solo se aplica una pequeña comisión del 4 % sobre el valor de cada venta realizada dentro de la plataforma."
        }
      ]
    },
    {
      section: "Sobre las ventas y la comisión",
      questions: [
        {
          q: "¿Por qué se cobra una comisión del 4 %?",
          a: "El 4 % se utiliza para mantener la seguridad del sistema, los servidores, el soporte técnico y el desarrollo de nuevas funciones. Es una forma de garantizar que la plataforma siga siendo segura y accesible para todos."
        },
        {
          q: "¿Cuándo se aplica la comisión?",
          a: "El descuento del 4 % se aplica automáticamente al valor total de cada venta antes de transferir el monto al vendedor."
        },
        {
          q: "¿Cómo recibo el dinero de mis ventas?",
          a: "Una vez confirmada la venta, Double P procesará el pago al vendedor mediante el método elegido (transferencia, billetera virtual u otro medio disponible). El tiempo de acreditación puede variar según el método."
        }
      ]
    },
    {
      section: "Sobre las prendas",
      questions: [
        {
          q: "¿Qué tipo de ropa puedo publicar?",
          a: "Solo se permiten prendas en buen estado: limpias, sin daños visibles y listas para usar. Puedes publicar ropa de tallas plus size o petite para mujeres, hombres o personas no binarias."
        },
        {
          q: "¿Puedo donar ropa?",
          a: "Sí. Double P cuenta con una opción para marcar tus prendas como donación gratuita. Los usuarios interesados podrán contactarte para coordinar la entrega."
        },
        {
          q: "¿Puedo intercambiar ropa?",
          a: "Sí. Puedes acordar intercambios directamente con otros usuarios desde el chat de la aplicación, sin necesidad de realizar una transacción económica."
        }
      ]
    },
    {
      section: "Sobre las cuentas y seguridad",
      questions: [
        {
          id: 10,
          q: "¿Cómo protegen mis datos personales?",
          a: "Cumplimos con la Ley 1581 de 2012 (Colombia) sobre protección de datos personales. Tu información se usa únicamente para los fines de la plataforma y nunca se comparte sin tu consentimiento."
        },
        {
          q: "¿Qué hago si olvido mi contraseña?",
          a: "Puedes restablecerla fácilmente desde la opción \"¿Olvidaste tu contraseña?\" en la pantalla de inicio de sesión. Se enviará un enlace seguro a tu correo electrónico registrado."
        },
        {
          q: "¿Qué pasa si detecto una cuenta falsa o un comportamiento sospechoso?",
          a: "Debes reportarlo de inmediato enviando un mensaje al soporte de Double P. El equipo de seguridad revisará el caso y tomará las medidas necesarias."
        }
      ]
    },
    {
      section: "Sobre los envíos y entregas",
      questions: [
        {
          q: "¿Double P gestiona los envíos?",
          a: "Por ahora, los envíos o entregas son responsabilidad de los usuarios. Puedes acordar personalmente la entrega o usar un servicio de mensajería externo."
        },
        {
          q: "¿Qué pasa si no recibo la prenda comprada?",
          a: "Si ocurre un problema con una transacción, puedes reportarlo en la sección \"Soporte\". Double P evaluará el caso y, si es necesario, intermediará para resolverlo."
        }
      ]
    },
    {
      section: "Otros temas",
      questions: [
        {
          q: "¿Puedo eliminar mi cuenta?",
          a: "Sí. Puedes hacerlo desde tu perfil en la configuración de la cuenta. Al eliminarla, toda tu información y publicaciones serán eliminadas de forma segura."
        },
        {
          q: "¿Cómo contacto con soporte?",
          a: "Puedes escribirnos desde la opción \"Ayuda y soporte\" en el menú principal o al correo electrónico oficial: appdoublepp@gmail.com"
        }
      ]
    }
  ];

  return (
    <div className="faq-root">
      {/* Banner superior con imagen */}
      <div className="faq-banner">
        <img 
          src="/preguntas.jpeg" 
          alt="Banner" 
          className="faq-banner-image"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = '/contacto.jpeg';
          }}
        />
        <div className="faq-banner-content">
          <h1>Preguntas Frecuentes</h1>
          <p>Encuentra respuestas a las dudas más comunes sobre Double P</p>
        </div>
      </div>

      <div className="faq-container">
        {faqData.map((section, idx) => (
          <div key={idx} className="faq-section">
            <h2 className="faq-section-title">
              {section.section}
            </h2>
            <div className="faq-items">
              {section.questions.map((item, qIdx) => {
                const uniqueId = `${idx}-${qIdx}`;
                return (
                  <div
                    key={uniqueId}
                    className={`faq-item ${openItems.includes(uniqueId) ? 'open' : ''}`}
                  >
                    <button
                      className="faq-question"
                      onClick={() => toggleItem(uniqueId)}
                    >
                      <span className="faq-question-text">
                        {item.q}
                      </span>
                      <span className="faq-toggle">▼</span>
                    </button>
                    <div className="faq-answer">
                      <p>{item.a}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <button className="faq-back-btn" onClick={() => navigate('/configuracion')}>
          ← Volver a Configuración
        </button>
      </div>
    </div>
  );
}