import pymysql

print("Probando conexión a diferentes nombres de BD...")
print("="*50)

# Prueba con Double_P
print("\nPrueba 1: Conectando a 'Double_P' (como en el código)...")
try:
    conn = pymysql.connect(
        host='localhost',
        user='root',
        password='',
        database='Double_P'
    )
    print("✓ ÉXITO: Conectado a Double_P")
    conn.close()
except Exception as e:
    print(f"✗ FALLO: {e}")

# Prueba con double_p
print("\nPrueba 2: Conectando a 'double_p' (minúsculas)...")
try:
    conn = pymysql.connect(
        host='localhost',
        user='root',
        password='',
        database='double_p'
    )
    print("✓ ÉXITO: Conectado a double_p")
    
    # Verificar si existe la vista catalogo
    cursor = conn.cursor()
    cursor.execute("SHOW FULL TABLES WHERE Table_type = 'VIEW'")
    vistas = cursor.fetchall()
    print(f"\nVistas encontradas: {len(vistas)}")
    for vista in vistas:
        print(f"  - {vista[0]}")
    
    # Verificar tablas
    cursor.execute("SHOW TABLES")
    tablas = cursor.fetchall()
    print(f"\nTablas encontradas: {len(tablas)}")
    for tabla in tablas:
        print(f"  - {tabla[0]}")
    
    conn.close()
except Exception as e:
    print(f"✗ FALLO: {e}")
