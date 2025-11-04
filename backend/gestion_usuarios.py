from flask import Blueprint, jsonify, request
from bd import obtener_conexion
from datetime import datetime, date
from email.utils import parsedate_to_datetime
import re
from mongodb import connectionBD


def _normalize_fecha(fecha_val):
    """Normalize various incoming date representations to YYYY-MM-DD or return None.

    Accepts:
    - None or empty -> None
    - datetime/date -> formatted date
    - ISO strings like '2021-05-30' or '2021-05-30T00:00:00'
    - RFC 2822/1123 strings like 'Mon, 30 Jul 2001 00:00:00 GMT'
    - common formats like '30/07/2001' or '30-07-2001'
    """
    if fecha_val is None:
        return None
    if isinstance(fecha_val, date) and not isinstance(fecha_val, datetime):
        return fecha_val.strftime('%Y-%m-%d')
    if isinstance(fecha_val, datetime):
        return fecha_val.date().strftime('%Y-%m-%d')
    if isinstance(fecha_val, str):
        s = fecha_val.strip()
        if s == '':
            return None
        # Try ISO
        try:
            # fromisoformat handles 'YYYY-MM-DD' and 'YYYY-MM-DDTHH:MM:SS'
            dt = datetime.fromisoformat(s)
            return dt.date().strftime('%Y-%m-%d')
        except Exception:
            pass
        # Try RFC formats using email.utils
        try:
            dt = parsedate_to_datetime(s)
            return dt.date().strftime('%Y-%m-%d')
        except Exception:
            pass
        # Try common day/month/year formats
        for fmt in ('%d/%m/%Y', '%d-%m-%Y', '%Y/%m/%d', '%Y-%m-%d'):
            try:
                dt = datetime.strptime(s, fmt)
                return dt.date().strftime('%Y-%m-%d')
            except Exception:
                continue
    # If nothing matched, return None to avoid DB error
    return None

usuarios_bp = Blueprint('usuarios', __name__, url_prefix='/api/usuarios')


def _format_usuario_row(row):
    """Normalize a DB row dict into the API user shape."""
    if not row:
        return None
    # DB fields may include 'email' or 'correo' and 'estado' as int 1/0
    correo = row.get('email') or row.get('correo') or row.get('username')
    estado_val = row.get('estado')
    estado = 'Activo' if estado_val in (1, '1', True) else 'Inactivo'
    # Nombre puede estar desglosado en columnas nuevas
    pn = row.get('primer_nombre')
    sn = row.get('segundo_nombre')
    pa = row.get('primer_apellido')
    sa = row.get('segundo_apellido')
    nombre_compuesto = row.get('nombre')
    if not nombre_compuesto:
        partes = [pn, sn, pa, sa]
        nombre_compuesto = ' '.join([p for p in partes if p]) or None
    return {
        'id_usuario': row.get('id_usuario') or row.get('id') or row.get('idUser'),
        'correo': correo,
        'estado': estado,
        'primer_nombre': pn,
        'segundo_nombre': sn,
        'primer_apellido': pa,
        'segundo_apellido': sa,
        # compat: mantener campo 'nombre' si algún frontend lo usa
        'nombre': nombre_compuesto,
    }


# === VER TODOS LOS USUARIOS ===
@usuarios_bp.route('/', methods=['GET'])
def obtener_usuarios():
    conexion = obtener_conexion()
    with conexion.cursor() as cursor:
        cursor.execute("SELECT * FROM usuario")
        usuarios = cursor.fetchall()
    conexion.close()
    # Normalizar cada fila antes de enviar
    usuarios_formateados = [_format_usuario_row(u) for u in usuarios]
    return jsonify(usuarios_formateados)


# === AGREGAR USUARIO (acepta datos mínimos) ===
@usuarios_bp.route('/', methods=['POST'])
def agregar_usuario():
    datos = request.json or {}
    nombre = datos.get('nombre') or datos.get('name') or 'Sin nombre'
    correo = datos.get('correo') or datos.get('email') or datos.get('username') or ''
    # Rellenar columnas requeridas con valores por defecto cuando falten
    contrasena = datos.get('contrasena') or datos.get('password') or ''
    talla = datos.get('talla') or None
    fecha_nacimiento = datos.get('fecha_nacimiento') or None
    # Normalizar fecha antes de insertar en la base de datos
    fecha_nacimiento = _normalize_fecha(fecha_nacimiento)
    foto = datos.get('foto') or None
    id_rol = datos.get('id_rol') or 1

    conexion = obtener_conexion()
    with conexion.cursor() as cursor:
        cursor.execute(
            """
            INSERT INTO usuario (nombre, username, email, contrasena, talla, fecha_nacimiento, foto, id_rol, estado)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 1)
            """,
            (
                nombre, correo, correo, contrasena, talla, fecha_nacimiento, foto, id_rol
            ),
        )
        new_id = cursor.lastrowid
    conexion.commit()
    # Recuperar el usuario insertado para devolverlo (fila completa)
    with conexion.cursor() as cursor:
        cursor.execute("SELECT * FROM usuario WHERE id_usuario = %s", (new_id,))
        nuevo = cursor.fetchone()
    conexion.close()
    return jsonify(nuevo), 201


# === INACTIVAR USUARIO (mantener compatibilidad con dos rutas) ===
@usuarios_bp.route('/inactivar/<int:id_usuario>', methods=['PUT'])
@usuarios_bp.route('/<int:id_usuario>/inactivar', methods=['PUT'])
def inactivar_usuario(id_usuario):
    conexion = obtener_conexion()
    with conexion.cursor() as cursor:
        cursor.execute("UPDATE usuario SET estado = 0 WHERE id_usuario = %s", (id_usuario,))
    conexion.commit()
    conexion.close()
    return jsonify({"mensaje": f"Usuario {id_usuario} inactivado correctamente"})


# === EDITAR USUARIO ===
@usuarios_bp.route('/<int:id_usuario>', methods=['PUT'])
def editar_usuario(id_usuario):
    datos = request.json or {}
    # Construir dinámicamente SET según los campos presentes
    campos = []
    valores = []
    # mapping clásico para campos con nombres distintos
    mapping = {
        'nombre': 'nombre',
        'correo': 'email',
        'email': 'email',
        'username': 'username',
        'contrasena': 'contrasena',
        'password': 'contrasena',
        'talla': 'talla',
        'fecha_nacimiento': 'fecha_nacimiento',
        'foto': 'foto',
        'id_rol': 'id_rol',
    }

    # Obtener lista de columnas reales de la tabla usuario para permitir actualizaciones dinámicas seguras
    conexion = obtener_conexion()
    with conexion.cursor() as cursor:
        cursor.execute("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'usuario' AND TABLE_SCHEMA = DATABASE()")
        cols = {r['COLUMN_NAME'] for r in cursor.fetchall()}

    # Para cada campo entrante, decidir la columna a actualizar si es segura
    for k, v in datos.items():
        col = None
        if k in mapping:
            col = mapping[k]
        elif k in cols:
            col = k
        # si tenemos columna válida, añadir al SET
        if col:
            campos.append(f"{col} = %s")
            if col == 'fecha_nacimiento':
                valores.append(_normalize_fecha(v))
            else:
                valores.append(v)

    if not campos:
        return jsonify({"error": "No se proporcionaron campos para actualizar"}), 400

    valores.append(id_usuario)
    sql = f"UPDATE usuario SET {', '.join(campos)} WHERE id_usuario = %s"
    with conexion.cursor() as cursor:
        cursor.execute(sql, tuple(valores))
    conexion.commit()
    # Recuperar usuario actualizado (fila completa)
    with conexion.cursor() as cursor:
        cursor.execute("SELECT * FROM usuario WHERE id_usuario = %s", (id_usuario,))
        usuario = cursor.fetchone()
    conexion.close()
    if not usuario:
        return jsonify({"error": "Usuario no encontrado"}), 404
    return jsonify(usuario)


@usuarios_bp.route('/<int:id_usuario>', methods=['GET'])
def obtener_usuario(id_usuario):
    conexion = obtener_conexion()
    with conexion.cursor() as cursor:
        cursor.execute("SELECT * FROM usuario WHERE id_usuario = %s", (id_usuario,))
        usuario = cursor.fetchone()
    conexion.close()
    if not usuario:
        return jsonify({"error": "Usuario no encontrado"}), 404
    return jsonify(usuario)


# === BORRAR USUARIO ===
@usuarios_bp.route('/<int:id_usuario>', methods=['DELETE'])
def borrar_usuario(id_usuario):
    print(f"[borrar_usuario] received request to delete id_usuario={id_usuario}")
    conexion = obtener_conexion()
    try:
        with conexion.cursor() as cursor:
            cursor.execute("SELECT COUNT(*) as cnt FROM usuario WHERE id_usuario = %s", (id_usuario,))
            row = cursor.fetchone()
            if not row or row.get('cnt', 0) == 0:
                return jsonify({"error": "Usuario no encontrado"}), 404

            # 1) Encontrar publicaciones del usuario
            cursor.execute("SELECT id_publicacion FROM publicacion WHERE id_usuario = %s", (id_usuario,))
            pubs = [r.get('id_publicacion') for r in cursor.fetchall() if r]

            # 2) Borrar pagos relacionados a esas publicaciones
            if pubs:
                cursor.execute("DELETE FROM pago WHERE id_publicacion IN (%s)" % ','.join(['%s'] * len(pubs)), tuple(pubs))

            # 3) Borrar prendas relacionadas a esas publicaciones
            if pubs:
                cursor.execute("DELETE FROM prenda WHERE id_publicacion IN (%s)" % ','.join(['%s'] * len(pubs)), tuple(pubs))

            # 4) Borrar las publicaciones
            if pubs:
                cursor.execute("DELETE FROM publicacion WHERE id_publicacion IN (%s)" % ','.join(['%s'] * len(pubs)), tuple(pubs))

            # 5) Borrar pagos asociados al usuario (si existen pagos realizados por el usuario)
            cursor.execute("DELETE FROM pago WHERE id_usuario = %s", (id_usuario,))

            # 6) Borrar valoraciones donde este usuario fue valorado (FK a usuario)
            try:
                cursor.execute("DELETE FROM valoracion WHERE usuario_valorado_id = %s", (id_usuario,))
            except Exception as e:
                print(f"[borrar_usuario] warning deleting valoracion for id_usuario={id_usuario}: {e}")

            # 7) Borrar mensajes del usuario en MongoDB (remitente o destinatario)
            try:
                collection = connectionBD()
                if collection is not None:
                    collection.delete_many({"$or": [{"id_remitente": id_usuario}, {"id_destinatario": id_usuario}]})
                    print(f"[borrar_usuario] mensajes MongoDB borrados para id_usuario={id_usuario}")
            except Exception as e:
                print(f"[borrar_usuario] error borrando mensajes MongoDB: {e}")

            # 8) Finalmente borrar el usuario
            cursor.execute("DELETE FROM usuario WHERE id_usuario = %s", (id_usuario,))

        conexion.commit()
    finally:
        conexion.close()

    return jsonify({"mensaje": f"Usuario {id_usuario} y sus datos asociados eliminados correctamente"})


@usuarios_bp.route('/<path:maybe_id>', methods=['DELETE'])
def borrar_usuario_tolerante(maybe_id):
    """Ruta DELETE tolerante: acepta id con caracteres adicionales (p. ej. '3.c').

    Intenta extraer el primer entero y borrar ese usuario. Si no puede, devuelve 400.
    """
    # Intentar parseo directo
    id_usuario = None
    try:
        id_usuario = int(maybe_id)
    except Exception:
        m = re.search(r"(\d+)", str(maybe_id))
        if m:
            id_usuario = int(m.group(1))
    if id_usuario is None:
        print(f"[borrar_usuario_tolerante] recibido maybe_id={maybe_id} -> no id extraído")
        return jsonify({"error": "ID de usuario inválido"}), 400

    # Reutilizar la lógica de borrado con el id entero
    print(f"[borrar_usuario_tolerante] will delete id_usuario={id_usuario} (from maybe_id={maybe_id})")
    conexion = obtener_conexion()
    try:
        with conexion.cursor() as cursor:
            cursor.execute("SELECT COUNT(*) as cnt FROM usuario WHERE id_usuario = %s", (id_usuario,))
            row = cursor.fetchone()
            if not row or row.get('cnt', 0) == 0:
                return jsonify({"error": "Usuario no encontrado"}), 404

            # realizar borrado en cascada similar al endpoint normal
            cursor.execute("SELECT id_publicacion FROM publicacion WHERE id_usuario = %s", (id_usuario,))
            pubs = [r.get('id_publicacion') for r in cursor.fetchall() if r]
            if pubs:
                cursor.execute("DELETE FROM pago WHERE id_publicacion IN (%s)" % ','.join(['%s'] * len(pubs)), tuple(pubs))
                cursor.execute("DELETE FROM prenda WHERE id_publicacion IN (%s)" % ','.join(['%s'] * len(pubs)), tuple(pubs))
                cursor.execute("DELETE FROM publicacion WHERE id_publicacion IN (%s)" % ','.join(['%s'] * len(pubs)), tuple(pubs))

            cursor.execute("DELETE FROM pago WHERE id_usuario = %s", (id_usuario,))

            # borrar valoraciones hacia este usuario
            try:
                cursor.execute("DELETE FROM valoracion WHERE usuario_valorado_id = %s", (id_usuario,))
            except Exception as e:
                print(f"[borrar_usuario_tolerante] warning deleting valoracion for id_usuario={id_usuario}: {e}")

            try:
                collection = connectionBD()
                if collection is not None:
                    collection.delete_many({"$or": [{"id_remitente": id_usuario}, {"id_destinatario": id_usuario}]})
            except Exception as e:
                print(f"[borrar_usuario_tolerante] error borrando mensajes MongoDB: {e}")

            cursor.execute("DELETE FROM usuario WHERE id_usuario = %s", (id_usuario,))

        conexion.commit()
    finally:
        # verificar que se borró
        try:
            with conexion.cursor() as cursor:
                cursor.execute("SELECT COUNT(*) as cnt FROM usuario WHERE id_usuario = %s", (id_usuario,))
                after = cursor.fetchone()
                print(f"[borrar_usuario_tolerante] after delete check for id={id_usuario} -> {after}")
        except Exception:
            pass
        conexion.close()

    return jsonify({"mensaje": f"Usuario {id_usuario} y sus datos asociados eliminados correctamente"})



# --- RUTAS DE DEPURACIÓN ---
@usuarios_bp.route('/debug/check/<int:id_usuario>', methods=['GET'])
def debug_check_usuario(id_usuario):
    """Devuelve si existe el usuario y la fila completa. Útil para verificar desde PowerShell/curl."""
    conexion = obtener_conexion()
    with conexion.cursor() as cursor:
        cursor.execute("SELECT COUNT(*) as cnt FROM usuario WHERE id_usuario = %s", (id_usuario,))
        row = cursor.fetchone()
        exists = bool(row and row.get('cnt', 0) > 0)
        usuario = None
        if exists:
            cursor.execute("SELECT * FROM usuario WHERE id_usuario = %s", (id_usuario,))
            usuario = cursor.fetchone()
    conexion.close()
    return jsonify({"exists": exists, "usuario": usuario})


@usuarios_bp.route('/debug/force_delete/<int:id_usuario>', methods=['DELETE'])
def debug_force_delete(id_usuario):
    """Borra forzosamente y devuelve conteo antes/después (solo para depuración)."""
    print(f"[debug_force_delete] request to force-delete id={id_usuario}")
    conexion = obtener_conexion()
    with conexion.cursor() as cursor:
        cursor.execute("SELECT COUNT(*) as cnt FROM usuario WHERE id_usuario = %s", (id_usuario,))
        before = cursor.fetchone()
        cursor.execute("DELETE FROM usuario WHERE id_usuario = %s", (id_usuario,))
    conexion.commit()
    with conexion.cursor() as cursor:
        cursor.execute("SELECT COUNT(*) as cnt FROM usuario WHERE id_usuario = %s", (id_usuario,))
        after = cursor.fetchone()
    conexion.close()
    print(f"[debug_force_delete] before={before} after={after}")
    return jsonify({"before": before, "after": after})