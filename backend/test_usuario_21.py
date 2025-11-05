from bd import obtener_conexion

conexion = obtener_conexion()
try:
    with conexion.cursor() as cursor:
        cursor.execute('SELECT * FROM usuario WHERE id_usuario = 21')
        usuario = cursor.fetchone()
        if usuario:
            print("Usuario ID 21:")
            for key, value in usuario.items():
                print(f"  {key}: {value}")
        else:
            print("No existe usuario con ID 21")
            
        # Buscar un usuario válido
        cursor.execute('SELECT * FROM usuario WHERE id_usuario = 1')
        usuario = cursor.fetchone()
        if usuario:
            print("\nUsuario ID 1:")
            for key, value in usuario.items():
                print(f"  {key}: {value}")
finally:
    conexion.close()
