from flask import Flask
from flask import request
from flask import jsonify
from flask_socketio import SocketIO, emit
import os
from supabase import create_client, Client
app = Flask(__name__)
socketio = SocketIO(app)

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
@app.route('/')
def hello_world():
    return 'Hello, World!'

@app.route('/add_shelter', methods=['POST'])
def add_shelter():
    data = request.json
    name = data.get("name")
    capacity = data.get("capacity")

    response = supabase.table("shelters").insert({"name": name, "capacity": capacity}).execute()

    return jsonify({"data": response.data, "error": response.error})

if __name__ == '__main__':
    socketio.run(app, debug=True, host="0.0.0.0", port=5000, allow_unsafe_werkzeug=True)