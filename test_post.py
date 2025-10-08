# test_post.py (save in backend folder)
import requests, json

url = "http://127.0.0.1:8000/api/orders/"

payload = {
    "id": "ORD-TEST-POST",
    "customer": {"firstName":"Test","lastName":"User","email":"test@example.com"},
    "shipping": {"address":"123 St","city":"City","province":"BC","postal":"A1A1A1","country":"Canada","price":5},
    "payment": {"method":"cod","summary":"Cash on Delivery"},
    "items": [{"product_id":"p1","title":"Laptop","price":100,"qty":1,"image":"/laptop.png"}],
    "subtotal":100,
    "tax":10,
    "total":115,
    "status":"pending_cod"
}

r = requests.post(url, json=payload)
print("status:", r.status_code)
print("response:", r.text)