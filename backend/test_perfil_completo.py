from bd import obtener_conexion
import json

print("Probando obtener_datos_perfil completo...")
print("="*50)

# Simular lo que hace la función obtener_datos_perfil
id_usuario = 25  # ardillalol

try:
    # Obtener datos del usuario
    conexion = obtener_conexion()
    with conexion.cursor() as cursor:
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
            (id_usuario,)
        )
        datos_usuario = cursor.fetchone()
        
        if not datos_usuario:
            print("❌ Usuario no encontrado")
        else:
            print("✅ Usuario encontrado:")
            print(json.dumps(datos_usuario, indent=2, default=str))
            
            # Construir el perfil como lo hace la función
            perfil = {
                "id_usuario": datos_usuario["id_usuario"],
                "PrimerNombre": datos_usuario["PrimerNombre"] or "",
                "SegundoNombre": datos_usuario["SegundoNombre"] or "",
                "PrimerApellido": datos_usuario["PrimerApellido"] or "",
                "SegundoApellido": datos_usuario["SegundoApellido"] or "",
                "username_usuario": datos_usuario["username_usuario"] or "",
                "email_usuario": datos_usuario["email_usuario"] or "",
                "foto_usuario": datos_usuario["foto_usuario"] or "default.jpg",
            }
            
            print("\n📦 Perfil construido:")
            print(json.dumps(perfil, indent=2))
            
    conexion.close()
    
except Exception as e:
    print(f"❌ ERROR: {e}")
    import traceback
    traceback.print_exc()
