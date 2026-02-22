from flask import Flask, render_template
from flask import Flask
from flask import request
from flask import jsonify
from flask_socketio import SocketIO, emit
import os
from supabase import create_client, Client

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = Flask(__name__)
socketio = SocketIO(app)

@app.route('/')
def user_ui():
    return render_template("user_ui.html")

@app.route('/add_shelter', methods=['POST'])
def add_shelter():
    data = request.json
    name = data.get("name")
    capacity = data.get("capacity")

    try:

        response = supabase.table("shelters").insert({"name": name, "capacity": capacity}).execute()

        return jsonify({"data": response.data, "error": None})
    
    except Exception as e:
        return jsonify({"data": None, "error": str(e)}), 400

if __name__ == '__main__':
    socketio.run(app, debug=True, host="0.0.0.0", port=3000, allow_unsafe_werkzeug=True)