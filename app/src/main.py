from flask import Flask, render_template
from flask_socketio import SocketIO, emit
app = Flask(__name__)
socketio = SocketIO(app)

@app.route('/')
def user_ui():
    return render_template("user_ui.html")

if __name__ == '__main__':
    socketio.run(app, debug=True, host="0.0.0.0", port=3000, allow_unsafe_werkzeug=True)