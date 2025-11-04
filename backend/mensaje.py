import smtplib
import pymysql
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from bd import obtener_conexion
from flask import Blueprint, request, jsonify

mensaje_bp = Blueprint('mensaje_bp', __name__)


class Mensaje:
    # Configuración del correo
    EMAIL = "appdoublepp@gmail.com"
    PASSWORD = "ssun pbmt motb lmxx"

    def __init__(self):
        pass

    def enviar_correo(self, destinatarios, texto):
        """destinatarios: string o lista de correos"""
        if isinstance(destinatarios, str):
            destinatarios = [destinatarios]

        if not destinatarios:
            return "No hay destinatarios válidos."

        # === Plantilla HTML global ===
        plantilla_html = f"""
        <div style="font-family:'Libre Baskerville','Merriweather','Garamond',serif;
                    background-color:#fdf8f2; padding:25px; border-radius:12px;
                    border:1px solid #e0cba8; max-width:480px; margin:auto;">
            <h2 style="color:#b68c56; text-align:center;">📩 Notificación de <b>Double π</b></h2>
            <p style="font-size:16px; color:#333; line-height:1.6;">
                {texto}
            </p>
            <hr style="border:none; border-top:1px solid #e8d7b2; margin:20px 0;">
            <p style="text-align:center; color:#999; font-size:12px;">
                © 2025 <b>Double π</b> — Sin límites, sin barreras, más tallas, más de ti ✨
            </p>
        </div>
        """

        try:
            # Enviar correo a cada destinatario con HTML
            for recipient in destinatarios:
                msg = MIMEMultipart("alternative")
                msg["From"] = self.EMAIL
                msg["To"] = recipient
                msg["Subject"] = "Notificación - Double π"

                # Agregamos la versión HTML (esto asegura los estilos)
                parte_html = MIMEText(plantilla_html, "html", "utf-8")
                msg.attach(parte_html)

                # Enviar
                with smtplib.SMTP("smtp.gmail.com", 587) as enviar:
                    enviar.starttls()
                    enviar.login(self.EMAIL, self.PASSWORD)
                    enviar.sendmail(self.EMAIL, recipient, msg.as_string())
                    print(f"✅ Correo enviado a: {recipient}")
        except Exception as e:
            print(f"❌ Error al enviar correo: {str(e)}")
            import traceback
            traceback.print_exc()

    def obtener_todos_los_correos(self):
        correos = []
        conexion = obtener_conexion()
        try:
            with conexion.cursor() as cursor:
                cursor.execute("SELECT email FROM usuario WHERE email IS NOT NULL AND email != '' AND email LIKE '%@%'")
                resultados = cursor.fetchall()
                print(f"📧 Resultados obtenidos: {len(resultados) if resultados else 0}")
                # Como bd.py usa DictCursor, los resultados son diccionarios
                for fila in resultados:
                    if fila and 'email' in fila and fila['email']:
                        email = fila['email'].strip()
                        if email and '@' in email:
                            correos.append(email)
                print(f"✅ Correos válidos procesados: {len(correos)}")
                if correos:
                    print(f"📋 Primeros 3 correos: {correos[:3]}")
        except Exception as e:
            print(f"❌ Error al obtener correos: {str(e)}")
            import traceback
            traceback.print_exc()
        finally:
            if conexion:
                conexion.close()
        return correos


# --- Rutas API ---
@mensaje_bp.route('/api/enviar_correo', methods=['POST'])
def api_enviar_correo():
    data = request.get_json() or {}
    correo = data.get('correo')
    mensaje_texto = data.get('mensaje')
    enviar_todos = data.get('enviar_todos', False)

    servicio = Mensaje()

    if enviar_todos:
        resultado = servicio.enviar_a_todos(mensaje_texto)
        return jsonify({'ok': True, 'resultado': resultado})

    if not correo:
        return jsonify({'ok': False, 'resultado': 'No se proporcionó correo'}), 400

    resultado = servicio.enviar_correo(correo, mensaje_texto)
    return jsonify({'ok': True, 'resultado': resultado})


@mensaje_bp.route('/api/usuarios_emails', methods=['GET'])
def api_usuarios_emails():
    try:
        print("🔍 Endpoint /api/usuarios_emails llamado")
        servicio = Mensaje()
        correos = servicio.obtener_todos_los_correos()
        print(f"📬 Enviando {len(correos)} correos al frontend")
        response_data = {
            'ok': True, 
            'emails': correos, 
            'count': len(correos),
            'message': f'Se encontraron {len(correos)} usuarios'
        }
        return jsonify(response_data)
    except Exception as e:
        print(f"❌ Error en api_usuarios_emails: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'ok': False, 
            'error': str(e), 
            'emails': [],
            'message': 'Error del servidor'
        }), 500

# Ruta de prueba para verificar que el blueprint funciona
@mensaje_bp.route('/api/test', methods=['GET'])
def test_endpoint():
    return jsonify({'ok': True, 'message': 'Blueprint mensaje funcionando correctamente'})
