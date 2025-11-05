from bd import obtener_conexion

id_usuario = 21

conn = obtener_conexion()
cursor = conn.cursor()

# Verificar si el usuario tiene publicaciones
cursor.execute("""
    SELECT 
        p.id_publicacion,
        pr.id_prenda,
        pr.nombre,
        pr.foto
    FROM usuario u
    LEFT JOIN publicacion p ON u.id_usuario = p.id_usuario
    LEFT JOIN prenda pr ON p.id_publicacion = pr.id_publicacion
    WHERE u.id_usuario = %s
""", (id_usuario,))

rows = cursor.fetchall()

print(f"📊 Usuario {id_usuario} tiene {len(rows)} filas en el resultado")
print()

if len(rows) == 0:
    print("❌ No se encontró el usuario")
else:
    for i, row in enumerate(rows, 1):
        print(f"Fila {i}:")
        print(f"  - ID Publicación: {row.get('id_publicacion')}")
        print(f"  - ID Prenda: {row.get('id_prenda')}")
        print(f"  - Nombre: {row.get('nombre')}")
        print(f"  - Foto: {row.get('foto')}")
        print()

conn.close()
