from bd import obtener_conexion

id_usuario = 21
conexion = obtener_conexion()
try:
    with conexion.cursor() as cursor:
        cursor.execute(
            """
            SELECT 
                u.id_usuario,
                u.primer_nombre AS PrimerNombre,
                u.segundo_nombre AS SegundoNombre,
                u.primer_apellido AS PrimerApellido,
                u.segundo_apellido AS SegundoApellido,
                u.username AS username_usuario,
                u.email AS email_usuario,
                u.fecha_nacimiento AS fecha_nacimiento,
                u.talla AS talla_usuario,
                u.foto AS foto_usuario,
                p.id_publicacion,
                pr.id_prenda,
                pr.nombre AS nombre_prenda,
                pr.foto AS foto_prenda,
                COALESCE(vv.promedio_valoracion, 0) AS promedio_valoracion
            FROM usuario u
            LEFT JOIN publicacion p ON u.id_usuario = p.id_usuario
            LEFT JOIN prenda pr ON p.id_publicacion = pr.id_publicacion
            LEFT JOIN (
                SELECT 
                    v.id_usuario_valorado,
                    AVG(v.puntuacion) AS promedio_valoracion
                FROM valoracion_usuario v
                GROUP BY v.id_usuario_valorado
            ) vv ON u.id_usuario = vv.id_usuario_valorado
            WHERE u.id_usuario = %s
            """,
            (id_usuario,)
        )

        filas = cursor.fetchall()
        if not filas:
            print("No se encontraron resultados")
        else:
            columnas = [desc[0] for desc in cursor.description]
            print("Columnas:", columnas)
            print("\nPrimera fila:")
            for col, val in zip(columnas, filas[0]):
                print(f"  {col}: {val} (tipo: {type(val).__name__})")
finally:
    conexion.close()
