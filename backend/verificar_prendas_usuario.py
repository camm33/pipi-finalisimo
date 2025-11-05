from bd import obtener_conexion

# Verificar prendas del usuario 21
conn = obtener_conexion()
cursor = conn.cursor()

cursor.execute("""
    SELECT 
        pr.id_prenda,
        pr.nombre,
        pr.foto,
        pr.foto2,
        pr.foto3,
        pr.foto4,
        p.id_publicacion,
        p.id_usuario
    FROM prenda pr
    JOIN publicacion p ON pr.id_publicacion = p.id_publicacion
    WHERE p.id_usuario = 21
""")

prendas = cursor.fetchall()

print(f"📊 Usuario 21 tiene {len(prendas)} prendas:")
print("-" * 80)

if len(prendas) == 0:
    print("❌ No hay prendas para este usuario")
else:
    for prenda in prendas:
        print(f"\nPrenda ID: {prenda['id_prenda']}")
        print(f"  - Nombre: {prenda['nombre']}")
        print(f"  - Foto principal: {prenda['foto']}")
        print(f"  - Foto 2: {prenda['foto2']}")
        print(f"  - Foto 3: {prenda['foto3']}")
        print(f"  - Foto 4: {prenda['foto4']}")
        print(f"  - Publicación: {prenda['id_publicacion']}")

conn.close()
