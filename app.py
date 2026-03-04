# General imports
import os
import json
from dotenv import load_dotenv
from flask import Flask, render_template, request, jsonify, session
import google.oauth2.credentials
from google_auth_oauthlib.flow import Flow

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
    data = request.get_json()

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

os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"

CLIENT_SECRETS_FILE = "client_secret.json"
SCOPES = ['https://www.googleapis.com/auth/calendar']

# --- GOOGLE OAUTH FLOW ---

@app.route('/auth/google')
def authorize_google():
    """Step 1: Send user to Google's consent screen."""
    flow = Flow.from_client_secrets_file(CLIENT_SECRETS_FILE, scopes=SCOPES)
    flow.redirect_uri = url_for('oauth2callback', _external=True)
    
    authorization_url, state = flow.authorization_url(
        access_type='offline',          # Crucial: This gets you the refresh_token
        include_granted_scopes='true',
        prompt='consent'                # Force consent to ensure we get a refresh_token
    )
    
    session['state'] = state
    return redirect(authorization_url)

@app.route('/auth/google/callback/<int:user_id>')')
def oauth2callback(user_id):
    """Step 2: Google sends the user back with an authorization code."""
    # Ensure the user is logged into your Flask app first!
    current_user = User.query.filter_by(id=user_id).first() 
    
    state = session['state']
    flow = Flow.from_client_secrets_file(CLIENT_SECRETS_FILE, scopes=SCOPES, state=state)
    flow.redirect_uri = url_for('oauth2callback', _external=True)
    
    # Exchange code for tokens
    authorization_response = request.url
    flow.fetch_token(authorization_response=authorization_response)
    creds = flow.credentials
    
    # Save or update the database
    google_cred = GoogleCredential.query.filter_by(user_id=current_user.id).first()
    if not google_cred:
        google_cred = GoogleCredential(user_id=current_user.id)
        db.session.add(google_cred)
        
    google_cred.token = creds.token
    # Only update refresh token if Google gives us a new one
    if creds.refresh_token:
        google_cred.refresh_token = creds.refresh_token 
    google_cred.token_uri = creds.token_uri
    google_cred.client_id = creds.client_id
    google_cred.client_secret = creds.client_secret
    google_cred.scopes = ",".join(creds.scopes)
    google_cred.expiry = creds.expiry
    
    db.session.commit()
    return "Google Calendar successfully linked!"


# --- APPLE CALDAV FLOW ---

@app.route('/auth/apple/<int:user_id>')', methods=['POST'])
def authorize_apple(user_id):
    """
    Step 1: The user submits an HTML form containing their Apple ID 
    and the App-Specific Password they generated at appleid.apple.com.
    """
    current_user = User.query.filter_by(id=user_id).first() 
    
    # Grab data submitted from your HTML form
    apple_email = request.form.get('apple_id_email')
    app_pwd = request.form.get('app_password')
    
    # Basic validation (in a real app, you might try a test CalDAV connection here first)
    if not apple_email or not app_pwd:
        return "Missing email or password", 400
        
    # Save or update the database
    apple_cred = AppleCredential.query.filter_by(user_id=current_user.id).first()
    if not apple_cred:
        apple_cred = AppleCredential(user_id=current_user.id)
        db.session.add(apple_cred)
        
    apple_cred.apple_id_email = apple_email
    apple_cred.app_password = app_pwd 
    
    db.session.commit()
    return "Apple Calendar successfully linked!"

if __name__ == '__main__':
    app.run(debug=True, port=3000)
