import pymysql
from bd import obtener_conexion

print("Probando el query exacto del endpoint...")
print("="*50)

try:
    conexion = obtener_conexion()
    print("✓ Conexión establecida")
    
    with conexion.cursor(pymysql.cursors.DictCursor) as cursor:
        query = """
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
        """
        
        print("\nEjecutando query...")
        cursor.execute(query)
        publicaciones = cursor.fetchall()
        
        print(f"\n✓ Query ejecutado exitosamente")
        print(f"✓ Publicaciones encontradas: {len(publicaciones)}")
        
        if publicaciones:
            print("\nPrimera publicación:")
            print(publicaciones[0])
            
            # Verificar si hay fotos que no existen
            import os
            upload_folder = os.path.join(os.path.dirname(__file__), "uploads")
            
            print(f"\nVerificando archivos de imagen...")
            for i, pub in enumerate(publicaciones[:5]):  # Solo las primeras 5
                foto = pub.get('foto')
                if foto:
                    foto_path = os.path.join(upload_folder, foto)
                    existe = os.path.exists(foto_path)
                    status = "✓" if existe else "✗"
                    print(f"{status} Publicación {pub.get('id_publicacion')}: {foto} {'(EXISTE)' if existe else '(NO EXISTE)'}")
        
    conexion.close()
    print("\n✓ Conexión cerrada correctamente")
    
except Exception as e:
    print(f"\n✗ ERROR: {e}")
    import traceback
    traceback.print_exc()
