from bd import obtener_conexion

# Verificar todas las prendas con sus fotos
conn = obtener_conexion()
cursor = conn.cursor()

cursor.execute("""
    SELECT 
        pr.id_prenda,
        pr.nombre,
        pr.foto,
        p.id_usuario,
        u.username
    FROM prenda pr
    JOIN publicacion p ON pr.id_publicacion = p.id_publicacion
    JOIN usuario u ON p.id_usuario = u.id_usuario
    LIMIT 20
""")

prendas = cursor.fetchall()

print(f"📊 Verificando fotos de prendas:")
print("-" * 80)

for prenda in prendas:
    foto = prenda['foto']
    foto_existe = "✅" if foto else "❌"
    print(f"{foto_existe} ID: {prenda['id_prenda']:3} | Usuario: {prenda['username']:15} | Nombre: {prenda['nombre'][:30]:30} | Foto: {foto}")

conn.close()
