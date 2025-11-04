from flask import Blueprint, request, jsonify
from bd import obtener_conexion

gestion_prendas_bp = Blueprint("gestion_prendas", __name__)

# ------------------ 📦 OBTENER TODAS LAS PUBLICACIONES CON PRENDA ------------------
@gestion_prendas_bp.route("/api/prendas", methods=["GET"])
def obtener_prendas():
    """Devuelve todas las publicaciones unidas con su prenda.

    Campos expuestos (alias para el frontend):
    - id_publicacion, id_prenda, nombre_prenda, descripcion_prenda, talla,
      foto, foto2, foto3, foto4, valor, tipo_publicacion, estado, fecha_publicacion, id_usuario
    """
    conexion = obtener_conexion()
    try:
        with conexion.cursor() as cursor:
            cursor.execute(
                """
                SELECT 
                    p.id_publicacion,
                    p.descripcion AS descripcion_publicacion,
                    p.estado,
                    p.tipo_publicacion,
                    p.fecha_publicacion,
                    p.id_usuario,
                    pr.id_prenda,
                    pr.nombre AS nombre_prenda,
                    pr.descripcion_prenda,
                    pr.talla,
                    pr.foto,
                    pr.foto2,
                    pr.foto3,
                    pr.foto4,
                    pr.valor
                FROM publicacion p
                INNER JOIN prenda pr ON p.id_publicacion = pr.id_publicacion
                ORDER BY p.id_publicacion DESC
                """
            )
            filas = cursor.fetchall()
        return jsonify(filas), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        conexion.close()


# (Opcional) Ruta de creación por SP/INSERT puede añadirse si la necesitas en Admin.


# ------------------ 🧾 OBTENER UNA PUBLICACIÓN PR+PU ------------------
@gestion_prendas_bp.route("/api/prendas/<int:id_publicacion>", methods=["GET"])
def obtener_publicacion(id_publicacion):
    conexion = obtener_conexion()
    try:
        with conexion.cursor() as cursor:
            cursor.execute(
                """
                SELECT 
                    p.id_publicacion,
                    p.descripcion AS descripcion_publicacion,
                    p.estado,
                    p.tipo_publicacion,
                    p.fecha_publicacion,
                    p.id_usuario,
                    pr.id_prenda,
                    pr.nombre AS nombre_prenda,
                    pr.descripcion_prenda,
                    pr.talla,
                    pr.foto,
                    pr.foto2,
                    pr.foto3,
                    pr.foto4,
                    pr.valor
                FROM publicacion p
                INNER JOIN prenda pr ON p.id_publicacion = pr.id_publicacion
                WHERE p.id_publicacion = %s
                """,
                (id_publicacion,),
            )
            fila = cursor.fetchone()
        if fila:
            return jsonify(fila), 200
        return jsonify({"status": "error", "message": "Publicación no encontrada"}), 404
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        conexion.close()


@gestion_prendas_bp.route("/api/prendas/<int:id_publicacion>", methods=["PUT"])
def editar_publicacion(id_publicacion):
    """Actualiza columnas de publicacion y prenda según payload recibido.

    Acepta JSON (application/json) o form-data; campos soportados:
    - publicacion: descripcion (o descripcion_publicacion), estado, tipo_publicacion, fecha_publicacion/fecha
    - prenda: nombre, descripcion_prenda, talla, valor, (opcional) foto
    """
    datos = request.get_json(silent=True) or {}
    if not datos and request.form:
        datos = request.form.to_dict()

    conexion = obtener_conexion()
    try:
        with conexion.cursor() as cursor:
            # Actualizar PUBLICACION
            set_pub = []
            vals_pub = []
            if "descripcion_publicacion" in datos or "descripcion" in datos:
                set_pub.append("descripcion = %s")
                vals_pub.append(datos.get("descripcion_publicacion") or datos.get("descripcion"))
            if "estado" in datos:
                set_pub.append("estado = %s")
                vals_pub.append(datos.get("estado"))
            if "tipo_publicacion" in datos:
                set_pub.append("tipo_publicacion = %s")
                vals_pub.append(datos.get("tipo_publicacion"))
            if "fecha_publicacion" in datos or "fecha" in datos:
                set_pub.append("fecha_publicacion = %s")
                vals_pub.append(datos.get("fecha_publicacion") or datos.get("fecha"))
            if set_pub:
                sql_pub = f"UPDATE publicacion SET {', '.join(set_pub)} WHERE id_publicacion = %s"
                vals_pub.append(id_publicacion)
                cursor.execute(sql_pub, tuple(vals_pub))

            # Actualizar PRENDA (busca id_prenda por id_publicacion)
            cursor.execute("SELECT id_prenda FROM prenda WHERE id_publicacion = %s", (id_publicacion,))
            row = cursor.fetchone()
            id_prenda = row.get("id_prenda") if row else None

            if id_prenda:
                set_pr = []
                vals_pr = []
                if "nombre" in datos:
                    set_pr.append("nombre = %s")
                    vals_pr.append(datos.get("nombre"))
                if "descripcion_prenda" in datos:
                    set_pr.append("descripcion_prenda = %s")
                    vals_pr.append(datos.get("descripcion_prenda"))
                if "talla" in datos:
                    set_pr.append("talla = %s")
                    vals_pr.append(datos.get("talla"))
                if "valor" in datos:
                    set_pr.append("valor = %s")
                    vals_pr.append(datos.get("valor"))
                if "foto" in datos:
                    set_pr.append("foto = %s")
                    vals_pr.append(datos.get("foto"))
                if set_pr:
                    sql_pr = f"UPDATE prenda SET {', '.join(set_pr)} WHERE id_prenda = %s"
                    vals_pr.append(id_prenda)
                    cursor.execute(sql_pr, tuple(vals_pr))

        conexion.commit()
        # Obtener la prenda actualizada
        with conexion.cursor() as cursor:
            cursor.execute("SELECT * FROM prenda WHERE id_publicacion = %s", (id_publicacion,))
            prenda_actualizada = cursor.fetchone()
        return jsonify(prenda_actualizada), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        conexion.close()


def eliminar_publicacion_prenda(id_publicacion):
    """Elimina la prenda, pagos (si corresponde) y luego la publicación."""
    conexion = obtener_conexion()
    try:
        with conexion.cursor() as cursor:
            # borrar pagos vinculados a la publicación (si tu tabla pago existe con FK a publicacion)
            try:
                cursor.execute("DELETE FROM pago WHERE id_publicacion = %s", (id_publicacion,))
            except Exception:
                # Si no existe la tabla/relación en el entorno actual, continuar
                pass

            # borrar prenda y luego la publicación
            cursor.execute("DELETE FROM prenda WHERE id_publicacion = %s", (id_publicacion,))
            cursor.execute("DELETE FROM publicacion WHERE id_publicacion = %s", (id_publicacion,))
        conexion.commit()
        return {"status": "success", "message": "Publicación y prenda eliminadas"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
    finally:
        conexion.close()


@gestion_prendas_bp.route("/api/prendas/<int:id_publicacion>", methods=["DELETE"])
def eliminar_publicacion(id_publicacion):
    try:
        resultado = eliminar_publicacion_prenda(id_publicacion)
        status = 200 if resultado.get("status") == "success" else 400
        return jsonify(resultado), status
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


# ------------------ 📸 ACTUALIZAR IMAGEN ------------------
@gestion_prendas_bp.route("/api/prendas/<int:id_prenda>/imagen", methods=["PUT"])
def actualizar_imagen(id_prenda):
    datos = request.get_json()
    imagen = datos.get("imagen")

    if not imagen:
        return jsonify({"status": "error", "message": "No se proporcionó la imagen"}), 400

    conexion = obtener_conexion()
    try:
        with conexion.cursor() as cursor:
            cursor.execute("UPDATE prenda SET foto = %s WHERE id_prenda = %s", (imagen, id_prenda))
            conexion.commit()
        return jsonify({"status": "success", "message": "Imagen actualizada correctamente"}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        conexion.close()
