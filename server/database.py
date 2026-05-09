import firebase_admin
from firebase_admin import credentials, firestore

def get_db():
    try:
        firebase_admin.get_app()
    except ValueError:
        firebase_admin.initialize_app()
    return firestore.client()

db = get_db()
