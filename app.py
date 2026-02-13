# General imports
import os
import json
from dotenv import load_dotenv
from flask import Flask, render_template, request, jsonify, session

# Local imports
from models import db, init_db

load_dotenv()

app = Flask(__name__)
app.secret_key = os.environ.get('FLASK_SECRET_KEY')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///aiDoer.db'

db.init_app(app)

with app.app_context():
    db.create_all()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/notes', methods=['GET'])
def get_notes():
    todos = db.ToDo.get_all()

    todoList = []
    for todo in todos:
        todo.to_dict()

    return jsonify(todoList)

@app.route('/api/notes', methods=['POST'])
def create_note():
    data = request.get_data()

    db.ToDo.create_note(data)
    
    return jsonify({
        'status': 'success',
        'message': 'Todo created successfully',
        'note': data.get('title', '')
    })

@app.route('/api/notes/<int:note_id>', methods=['PUT'])
def update_note(note_id):
    """Update an existing note"""
    data = request.get_json()
    
    db.ToDo.edit(data)

@app.route('/api/notes/<int:note_id>', methods=['DELETE'])
def delete_note(note_id):
    db.ToDo.delete(note_id)

if __name__ == '__main__':
    app.run(debug=True, port=3000)
