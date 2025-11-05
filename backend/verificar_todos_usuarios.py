from bd import obtener_conexion

conn = obtener_conexion()
cursor = conn.cursor()

# Ver todos los usuarios con sus publicaciones
cursor.execute("""
    SELECT 
        u.id_usuario,
        u.username,
        COUNT(DISTINCT p.id_publicacion) as num_publicaciones,
        COUNT(pr.id_prenda) as num_prendas
    FROM usuario u
    LEFT JOIN publicacion p ON u.id_usuario = p.id_usuario
    LEFT JOIN prenda pr ON p.id_publicacion = pr.id_publicacion
    GROUP BY u.id_usuario, u.username
    ORDER BY num_publicaciones DESC
    LIMIT 15
""")

rows = cursor.fetchall()

print("📊 Usuarios con publicaciones:")
print("-" * 60)
for row in rows:
    print(f"ID: {row['id_usuario']:3} | Usuario: {row['username']:15} | Publicaciones: {row['num_publicaciones']:2} | Prendas: {row['num_prendas']:2}")

conn.close()
