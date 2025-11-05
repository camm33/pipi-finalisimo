from bd import obtener_conexion
import os

# Carpeta de uploads
UPLOAD_FOLDER = os.path.join(os.getcwd(), "uploads")

conn = obtener_conexion()
cursor = conn.cursor()

cursor.execute('SELECT id_usuario, username, foto FROM usuario')
usuarios = cursor.fetchall()

print(f"Verificando {len(usuarios)} usuarios...\n")

usuarios_con_problema = []
for usuario in usuarios:
    foto = usuario['foto']
    if foto:
        ruta_foto = os.path.join(UPLOAD_FOLDER, foto)
        if not os.path.exists(ruta_foto):
            usuarios_con_problema.append({
                'id': usuario['id_usuario'],
                'username': usuario['username'],
                'foto': foto
            })
            print(f"❌ Usuario {usuario['id_usuario']} ({usuario['username']}): Foto '{foto}' NO EXISTE")
        else:
            print(f"✅ Usuario {usuario['id_usuario']} ({usuario['username']}): Foto '{foto}' existe")
    else:
        print(f"⚠️  Usuario {usuario['id_usuario']} ({usuario['username']}): Sin foto")

print(f"\nTotal de usuarios con fotos faltantes: {len(usuarios_con_problema)}")

conn.close()
