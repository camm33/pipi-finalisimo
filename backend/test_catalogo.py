from bd import obtener_conexion
import pymysql

try:
    conexion = obtener_conexion()
    with conexion.cursor(pymysql.cursors.DictCursor) as cursor:
        # Verificar si existe la vista catalogo
        cursor.execute("SHOW FULL TABLES WHERE Table_type = 'VIEW'")
        vistas = cursor.fetchall()
        print("Vistas disponibles:")
        for vista in vistas:
            print(f"  - {vista}")
        
        print("\n" + "="*50)
        print("Intentando ejecutar query de catalogo:")
        print("="*50)
        
        cursor.execute("""
            SELECT 
                id_publicacion,
                tipo_publicacion,
                id_prenda,
                nombre_prenda,
                talla,
                foto,
                valor,
                id_usuario
            FROM catalogo
            ORDER BY id_publicacion DESC
            LIMIT 5
        """)
        publicaciones = cursor.fetchall()
        print(f"\nSe encontraron {len(publicaciones)} publicaciones")
        for pub in publicaciones:
            print(pub)
            
except Exception as e:
    print(f"ERROR: {e}")
    import traceback
    traceback.print_exc()
finally:
    if conexion:
        conexion.close()
