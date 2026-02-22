from flask import Flask, jsonify, redirect, render_template, request, session, url_for
from flask_socketio import SocketIO, emit
import os
from supabase import create_client, Client
from werkzeug.security import check_password_hash, generate_password_hash



SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = Flask(__name__, template_folder="templates", static_folder="static")
app.secret_key = os.environ.get("FLASK_SECRET_KEY", "dev-secret-change-me")
socketio = SocketIO(app)

SHELTER_SESSION_KEY = "shelter_id"


def _get_shelter_by_id(shelter_id: int):
    response = (
        supabase.table("shelters")
        .select("id,name,max_people,current_population,shelter_username")
        .eq("id", shelter_id)
        .limit(1)
        .execute()
    )
    rows = response.data or []
    return rows[0] if rows else None


def _get_shelter_by_username(username: str):
    response = (
        supabase.table("shelters")
        .select("id,name,shelter_username,shelter_password_hash,max_people,current_population")
        .eq("shelter_username", username)
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
    data = request.json or {}
    name = data.get("name")
    max_people = data.get("max_people")
    latitude = data.get("latitude")
    longitude = data.get("longitude")
    current_population = data.get("current_population")
    shelter_username = data.get("username")
    shelter_password = data.get("password")

    try:
        if not shelter_username or not shelter_password:
            return jsonify({"data": None, "error": "username and password are required"}), 400

        existing = _get_shelter_by_username(shelter_username)
        if existing:
            return jsonify({"data": None, "error": "username already exists"}), 400

        password_hash = generate_password_hash(shelter_password)

        response = (
            supabase.table("shelters")
            .insert(
                {
                    "name": name,
                    "max_people": max_people,
                    "latitude": latitude,
                    "longitude": longitude,
                    "current_population": current_population,
                    "shelter_username": shelter_username,
                    "shelter_password_hash": password_hash,
                }
            )
            .execute()
        )

        inserted_rows = response.data or []
        if not inserted_rows:
            return jsonify({"data": None, "error": "Shelter was not created"}), 500

        inserted = inserted_rows[0]
        login_url = f"{request.host_url.rstrip('/')}/shelter/login"
        return jsonify({"data": inserted, "login_url": login_url, "error": None})
    
    except Exception as e:
        return jsonify({"data": None, "error": str(e)}), 400


@app.route('/shelter/login', methods=['GET'])
def shelter_login_page():
    return render_template("shelter_login.html")


@app.route('/shelter/login', methods=['POST'])
def shelter_login_submit():
    payload = request.json if request.is_json else request.form
    username = (payload.get("username") or "").strip()
    password = payload.get("password") or ""

    try:
        shelter = _get_shelter_by_username(username)
        if not shelter or not check_password_hash(shelter.get("shelter_password_hash") or "", password):
            if request.is_json:
                return jsonify({"data": None, "error": "Invalid username or password"}), 401
            return render_template("shelter_login.html", error="Invalid username or password"), 401

        session[SHELTER_SESSION_KEY] = shelter["id"]
        if request.is_json:
            return jsonify({"data": {"id": shelter["id"], "username": shelter["shelter_username"]}, "error": None})
        return redirect(url_for("shelter_manage_page"))
    except Exception as e:
        if request.is_json:
            return jsonify({"data": None, "error": str(e)}), 400
        return render_template("shelter_login.html", error=str(e)), 400


@app.route('/shelter/logout', methods=['POST'])
def shelter_logout():
    session.pop(SHELTER_SESSION_KEY, None)
    return redirect(url_for("shelter_login_page"))


@app.route('/shelter/manage', methods=['GET'])
def shelter_manage_page():
    shelter_id = session.get(SHELTER_SESSION_KEY)
    if not shelter_id:
        return redirect(url_for("shelter_login_page"))

    try:
        shelter = _get_shelter_by_id(shelter_id)
        if not shelter:
            session.pop(SHELTER_SESSION_KEY, None)
            return redirect(url_for("shelter_login_page"))
        return render_template("shelter_manage.html", shelter=shelter)
    except Exception as e:
        return f"Unable to load shelter: {e}", 400


@app.route('/shelter/manage', methods=['PATCH'])
def shelter_manage_update():
    shelter_id = session.get(SHELTER_SESSION_KEY)
    if not shelter_id:
        return jsonify({"data": None, "error": "Not authenticated"}), 401

    payload = request.json or {}
    raw_max_people = payload.get("max_people")
    raw_current_population = payload.get("current_population")

    try:
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
            .eq("id", shelter_id)
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
