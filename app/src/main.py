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
    max_people = data.get("max_people")
    latitude = data.get("latitude")
    longitude = data.get("longitude")
    current_population = data.get("current_population")

    try:

        response = supabase.table("shelters").insert({"name": name, "max_people": max_people, "latitude": latitude, "longitude": longitude, "current_population": current_population}).execute()

        return jsonify({"data": response.data, "error": None})
    
    except Exception as e:
        return jsonify({"data": None, "error": str(e)}), 400

@socketio.on('/add_shelter', methods=['POST'])
def send_shelter(n_shelter):
    print('received number of shelters: ' + n_shelter)
    emit('my response', {'data': 'Server Response'})

    try:
        response = (
            supabase.table("shelters")
            .select("*")
            .execute()
        )

        # 'data' will now be a list of dictionaries
        all_shelters = response.data
        print(f"Total shelters fetched: {len(all_shelters)}")
        
        emit('my response', {
            'data': 'All Shelters Fetched', 
            'shelters': all_shelters
        })
        
    except Exception as e:
        print(f"Error: {e}")
        emit('my response', {'data': 'Error fetching table', 'error': str(e)})


if __name__ == '__main__':
    socketio.run(app, debug=True, host="0.0.0.0", port=3000, allow_unsafe_werkzeug=True)