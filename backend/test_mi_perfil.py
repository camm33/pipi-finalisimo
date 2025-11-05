import requests

s = requests.Session()
r = s.get('http://localhost:5000/api/mi_perfil')

print('Status:', r.status_code)

if r.ok:
    data = r.json()
    perfil = data.get('perfil', {})
    prendas = perfil.get('prendas', [])
    
    print(f'\n✅ Total prendas: {len(prendas)}')
    print('\n📦 PRENDAS:')
    
    for i, p in enumerate(prendas):
        print(f'\n  Prenda {i}:')
        print(f'    id_prenda: {p.get("id_prenda")}')
        print(f'    id_publicacion: {p.get("id_publicacion")}')
        print(f'    nombre_prenda: {p.get("nombre_prenda")}')
else:
    print(f'❌ Error: {r.text}')
