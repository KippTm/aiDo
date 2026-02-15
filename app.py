# General imports
import os
import json
from dotenv import load_dotenv
from flask import Flask, render_template, request, jsonify, session

# Local imports
from models import db, init_db
from models.todo import ToDo 

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

@app.route('/note_form')
def note_form():
    return render_template('note_form.html')

@app.route('/api/notes', methods=['GET'])
def get_notes():
    """Get all notes"""
    todos = ToDo.get_all()

    todoList = []
    for todo in todos:
        todoList.append(todo.to_dict())

    return jsonify(todoList)

@app.route('/api/notes/<int:note_id>', methods=['GET'])
def get_note(note_id):
    """Get a single note by ID"""
    todo = ToDo.get_by_id(note_id)
    if todo:
        return jsonify(todo.to_dict())
    return jsonify({'error': 'Note not found'}), 404

@app.route('/api/notes', methods=['POST'])
def create_note():
    """Create a new note"""
    data = request.get_data()

    print("Received data:", data)

    try:
        if 'id' in data:
            del data['id']

        new_todo = ToDo.create(data)
        return jsonify({
            'status': 'success',
            'message': 'Todo created successfully',
            'note': new_todo.to_dict()
        }), 201
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 400

@app.route('/api/notes/<int:note_id>', methods=['PUT'])
def update_note(note_id):
    """Update an existing note"""
    data = request.get_json()
    
    # Add the note_id to the data
    data['id'] = note_id
    
    try:
        updated_todo = ToDo.edit(data)
        if updated_todo:
            return jsonify({
                'status': 'success',
                'message': 'Todo updated successfully',
                'note': updated_todo.to_dict()
            })
        else:
            return jsonify({
                'status': 'error',
                'message': 'Todo not found'
            }), 404
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 400

@app.route('/api/notes/<int:note_id>', methods=['DELETE'])
def delete_note(note_id):
    """Delete a note"""
    try:
        success = ToDo.delete(note_id)
        if success:
            return jsonify({
                'status': 'success',
                'message': 'Todo deleted successfully'
            })
        else:
            return jsonify({
                'status': 'error',
                'message': 'Todo not found'
            }), 404
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 400

if __name__ == '__main__':
    app.run(debug=True, port=3000)
