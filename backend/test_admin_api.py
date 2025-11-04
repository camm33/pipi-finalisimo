import requests

# Cambia la URL si tu backend corre en otro puerto o IP
BASE_URL = "http://localhost:5000/api/admin/total_usuarios"

# Enviar la cabecera de rol de administrador
headers = {
    "X-Id-Rol": "1"
}

try:
    response = requests.get(BASE_URL, headers=headers)
    print("Status:", response.status_code)
    print("Respuesta:", response.json())
except Exception as e:
    print("Error al conectar con el backend:", e)
