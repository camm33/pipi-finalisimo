from bd import obtener_conexion

conn = obtener_conexion()
cursor = conn.cursor()

cursor.execute('SELECT id_usuario, username, foto FROM usuario LIMIT 10')
rows = cursor.fetchall()

print('Usuarios y sus fotos:')
for row in rows:
    print(f'ID: {row["id_usuario"]}, Username: {row["username"]}, Foto: {row["foto"]}')

conn.close()
