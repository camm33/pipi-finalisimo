from flask import Blueprint, jsonify, session, request
from bd import obtener_conexion
from functools import wraps


def admin_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        # Autenticación por sesión
        user_id = session.get("id_usuario")
        if user_id:
            conexion = obtener_conexion()
            try:
                with conexion.cursor() as cursor:
                    cursor.execute("SELECT id_rol FROM usuario WHERE id_usuario=%s", (user_id,))
                    row = cursor.fetchone()
                if not row:
                    return jsonify({"ok": False, "error": "Usuario no encontrado"}), 404
                id_rol = row[0] if isinstance(row, (list, tuple)) else row.get("id_rol")
                if str(id_rol) == "1":
                    return f(*args, **kwargs)
                return jsonify({"ok": False, "error": "Acceso denegado: no eres administrador"}), 403
            finally:
                conexion.close()

        # Autenticación por cabecera
        header_role = request.headers.get("X-Id-Rol") or request.headers.get("X-IdRol")
        if header_role is not None:
            if str(header_role).strip() == "1":
                return f(*args, **kwargs)
            else:
                return jsonify({"ok": False, "error": "Acceso denegado: rol incorrecto en cabecera"}), 403

        # Si ninguna autenticación válida, rechazar
        return jsonify({"ok": False, "error": "No autenticado: falta sesión o cabecera X-Id-Rol"}), 401
    return wrapper

admin_home_bp = Blueprint("admin_home", __name__)

def query_single_value(sql):
    conexion = obtener_conexion()
    with conexion.cursor() as cursor:
        cursor.execute(sql)
        result = cursor.fetchone()
    conexion.close()
    # soportar tanto cursors que devuelven tuplas/listas como dicts
    if not result:
        return 0
    if isinstance(result, (list, tuple)):
        return result[0]
    if isinstance(result, dict):
        try:
            return next(iter(result.values()))
        except StopIteration:
            return 0
    return result


@admin_home_bp.route('/api/admin/total_usuarios')
@admin_required
def total_usuarios():
    total = query_single_value("SELECT total_usuarios FROM vista_total_usuarios")
    return jsonify({'total_usuarios': total})


@admin_home_bp.route('/api/admin/publicaciones_activas')
@admin_required
def publicaciones_activas():
    total = query_single_value("SELECT publicaciones_activas FROM vista_publicaciones_activas")
    return jsonify({'publicaciones_activas': total})


@admin_home_bp.route('/api/admin/numero_usuarios')
@admin_required
def numero_usuarios():
    total = query_single_value("SELECT numero_usuarios FROM vista_numero_usuarios")
    return jsonify({'numero_usuarios': total})


@admin_home_bp.route('/api/admin/numero_administradores')
@admin_required
def numero_administradores():
    total = query_single_value("SELECT numero_administradores FROM vista_numero_administradores")
    return jsonify({'numero_administradores': total})


@admin_home_bp.route("/api/admin/publicaciones_tipo")
@admin_required
def publicaciones_tipo():
    conexion = obtener_conexion()
    try:
        with conexion.cursor() as cursor:
            cursor.execute("""
                SELECT tipo_publicacion, COUNT(*) AS total
                FROM publicacion
                WHERE estado = 'Disponible'
                GROUP BY tipo_publicacion;
            """)
            resultados = cursor.fetchall()

        # resultados puede ser lista de tuplas o lista de dicts según el cursor
        data = []
        for row in resultados:
            if isinstance(row, (list, tuple)):
                tipo = row[0]
                total = row[1]
            elif isinstance(row, dict):
                tipo = row.get('tipo_publicacion') or row.get('tipo')
                total = row.get('total')
            else:
                continue
            data.append({"tipo": tipo, "total": total})
        return jsonify({"ok": True, "data": data})

    except Exception as e:
        return jsonify({"ok": False, "error": str(e)})
    finally:
        conexion.close()
