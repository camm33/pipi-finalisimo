import pymysql
from bd import obtener_conexion

con = obtener_conexion()
cur = con.cursor(pymysql.cursors.DictCursor)

print("\n=== PUBLICACIONES EN LA BD ===")
cur.execute("SELECT id_publicacion, id_prenda, nombre FROM prenda LIMIT 10")
rows = cur.fetchall()

for r in rows:
    print(f"ID_PUBLICACION: {r['id_publicacion']}, ID_PRENDA: {r['id_prenda']}, NOMBRE: {r['nombre']}")

print(f"\n✅ Total: {len(rows)} prendas")

con.close()
