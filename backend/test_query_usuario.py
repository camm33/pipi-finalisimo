from bd import obtener_conexion

print("Probando query de usuario...")
print("="*50)

try:
    conexion = obtener_conexion()
    with conexion.cursor() as cursor:
        # Obtener datos básicos del usuario
        cursor.execute(
            """
            SELECT 
                id_usuario,
                primer_nombre AS PrimerNombre,
                segundo_nombre AS SegundoNombre,
                primer_apellido AS PrimerApellido,
                segundo_apellido AS SegundoApellido,
                username AS username_usuario,
                email AS email_usuario,
                foto AS foto_usuario,
                talla,
                fecha_nacimiento
            FROM usuario
            WHERE id_usuario = %s
            """,
            (25,)  # ID de ardillalol
        )
        usuario = cursor.fetchone()
        
        if not usuario:
            print("❌ Usuario no encontrado")
        else:
            columnas = [desc[0] for desc in cursor.description]
            datos_usuario = dict(zip(columnas, usuario))
            print("✅ Usuario encontrado:")
            for key, value in datos_usuario.items():
                print(f"  {key}: {value}")
            
    conexion.close()
    
except Exception as e:
    print(f"❌ ERROR: {e}")
    import traceback
    traceback.print_exc()
