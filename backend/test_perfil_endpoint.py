import requests

print("Probando endpoint de perfil...")
print("="*50)

try:
    # Crear una sesión
    session = requests.Session()
    
    # Primero login para obtener sesión
    login_data = {
        "username": "ardillalol",
        "password": "ardilla123"
    }
    
    print("1. Intentando login...")
    login_response = session.post("http://localhost:5000/login", json=login_data)
    print(f"   Status: {login_response.status_code}")
    print(f"   Response: {login_response.json()}")
    
    if login_response.status_code == 200:
        print("\n2. Intentando obtener perfil...")
        perfil_response = session.get("http://localhost:5000/api/perfil_usuario")
        print(f"   Status: {perfil_response.status_code}")
        
        if perfil_response.status_code == 200:
            print(f"   Response: {perfil_response.json()}")
            print("\n✅ ÉXITO: Endpoint funcionando correctamente")
        else:
            print(f"   ❌ ERROR: {perfil_response.text}")
    else:
        print("❌ No se pudo hacer login")
        
except Exception as e:
    print(f"\n❌ ERROR: {e}")
    import traceback
    traceback.print_exc()
