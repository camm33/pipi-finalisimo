import pymysql

print("Probando conexión a MySQL...")
print("="*50)

# Prueba 1: Sin contraseña
print("\nPrueba 1: Conectando sin contraseña...")
try:
    conn = pymysql.connect(
        host='localhost',
        user='root',
        password='',
        database='Double_P'
    )
    print("✓ ÉXITO: Conectado sin contraseña")
    conn.close()
except Exception as e:
    print(f"✗ FALLO: {e}")

# Prueba 2: Sin especificar base de datos
print("\nPrueba 2: Conectando sin base de datos específica...")
try:
    conn = pymysql.connect(
        host='localhost',
        user='root',
        password=''
    )
    print("✓ ÉXITO: Conectado al servidor MySQL")
    
    # Listar bases de datos
    cursor = conn.cursor()
    cursor.execute("SHOW DATABASES")
    databases = cursor.fetchall()
    print("\nBases de datos disponibles:")
    for db in databases:
        print(f"  - {db[0]}")
    
    conn.close()
except Exception as e:
    print(f"✗ FALLO: {e}")

print("\n" + "="*50)
print("Si ambas pruebas fallaron, tu MySQL tiene contraseña.")
print("Necesitas actualizar bd.py con la contraseña correcta.")
