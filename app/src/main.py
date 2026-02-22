from flask import Flask, render_template
from flask_socketio import SocketIO, emit
app = Flask(__name__, template_folder="../templates", static_folder="../static")
socketio = SocketIO(app)

@app.route('/')
#def hello_world():
#    return 'Hello, World!'
def home():
    return render_template("UserMap.html")

if __name__ == '__main__':
    socketio.run(app, debug=True, host="0.0.0.0", port=5000, allow_unsafe_werkzeug=True)
