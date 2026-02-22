from flask import Flask, render_template
from flask import request
from flask import jsonify
from flask_socketio import SocketIO, emit
import os
import hashlib
import secrets
from supabase import create_client, Client



SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = Flask(__name__, template_folder="templates", static_folder="static")
socketio = SocketIO(app)

MANAGE_TOKEN_BYTES = 24


def _hash_token(raw_token: str) -> str:
    return hashlib.sha256(raw_token.encode("utf-8")).hexdigest()


def _get_shelter_by_token(raw_token: str):
    token_hash = _hash_token(raw_token)
    response = (
        supabase.table("shelters")
        .select("id,name,max_people,current_population")
        .eq("manage_token_hash", token_hash)
        .limit(1)
        .execute()
    )
    rows = response.data or []
    return rows[0] if rows else None

@app.route('/')
def user_ui():
    return render_template("user_ui.html")

@app.route('/add_shelter', methods=['POST'])
def add_shelter():
    data = request.json
    name = data.get("name")
    max_people = data.get("max_people")
    latitude = data.get("latitude")
    longitude = data.get("longitude")
    current_population = data.get("current_population")

    try:
        manage_token = secrets.token_urlsafe(MANAGE_TOKEN_BYTES)
        manage_token_hash = _hash_token(manage_token)

        response = (
            supabase.table("shelters")
            .insert(
                {
                    "name": name,
                    "max_people": max_people,
                    "latitude": latitude,
                    "longitude": longitude,
                    "current_population": current_population,
                    "manage_token_hash": manage_token_hash,
                }
            )
            .execute()
        )

        inserted_rows = response.data or []
        if not inserted_rows:
            return jsonify({"data": None, "error": "Shelter was not created"}), 500

        inserted = inserted_rows[0]
        manage_url = f"{request.host_url.rstrip('/')}/shelter/manage/{manage_token}"

        return jsonify({"data": inserted, "manage_url": manage_url, "error": None})
    
    except Exception as e:
        return jsonify({"data": None, "error": str(e)}), 400


@app.route('/shelter/manage/<token>', methods=['GET'])
def shelter_manage_page(token):
    try:
        shelter = _get_shelter_by_token(token)
        if not shelter:
            return "Invalid or expired manage link", 404
        return render_template("shelter_manage.html", shelter=shelter, token=token)
    except Exception as e:
        return f"Unable to load shelter: {e}", 400


@app.route('/shelter/manage/<token>', methods=['PATCH'])
def shelter_manage_update(token):
    payload = request.json or {}
    raw_max_people = payload.get("max_people")
    raw_current_population = payload.get("current_population")

    try:
        shelter = _get_shelter_by_token(token)
        if not shelter:
            return jsonify({"data": None, "error": "Invalid manage link"}), 404

        if raw_max_people is None or raw_current_population is None:
            return jsonify({"data": None, "error": "max_people and current_population are required"}), 400

        max_people = int(raw_max_people)
        current_population = int(raw_current_population)

        if max_people < 0 or current_population < 0:
            return jsonify({"data": None, "error": "Values must be non-negative"}), 400
        if current_population > max_people:
            return jsonify({"data": None, "error": "current_population cannot exceed max_people"}), 400

        update_response = (
            supabase.table("shelters")
            .update({"max_people": max_people, "current_population": current_population})
            .eq("id", shelter["id"])
            .execute()
        )

        rows = update_response.data or []
        return jsonify({"data": rows[0] if rows else None, "error": None})
    except ValueError:
        return jsonify({"data": None, "error": "max_people and current_population must be integers"}), 400
    except Exception as e:
        return jsonify({"data": None, "error": str(e)}), 400

@socketio.on('send_shelters')
def send_shelter():
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
        
        emit('shelter_data', {
            'data': all_shelters
        })
        
    except Exception as e:
        print(f"Error: {e}")
        emit('my response', {'data': 'Error fetching table', 'error': str(e)})


if __name__ == '__main__':
    socketio.run(app, debug=True, host="0.0.0.0", port=3000, allow_unsafe_werkzeug=True)
