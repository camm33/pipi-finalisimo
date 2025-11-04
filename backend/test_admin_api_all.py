import requests

BASE_URLS = [
    "http://localhost:5000/api/admin/total_usuarios",
    "http://localhost:5000/api/admin/publicaciones_activas",
    "http://localhost:5000/api/admin/numero_usuarios",
    "http://localhost:5000/api/admin/numero_administradores",
    "http://localhost:5000/api/admin/publicaciones_tipo"
]

headers = {
    "X-Id-Rol": "1"
}

for url in BASE_URLS:
    print(f"Probando: {url}")
    try:
        response = requests.get(url, headers=headers)
        print("Status:", response.status_code)
        print("Respuesta:", response.text)
    except Exception as e:
        print("Error al conectar con el backend:", e)
    print("-"*40)
