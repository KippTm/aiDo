
from models import db
from datetime import datetime

class goEnt(db.model):
    __tablename__ = 'goEnt'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    token = db.Column(db.String(255), nullable=False)          # The current access token
    refresh_token = db.Column(db.String(255), nullable=True)   # Used to get a new access token
    token_uri = db.Column(db.String(255), nullable=False)
    client_id = db.Column(db.String(255), nullable=False)
    client_secret = db.Column(db.String(255), nullable=False)
    scopes = db.Column(db.Text, nullable=False)                # Comma-separated list of scopes
    expiry = db.Column(db.DateTime, nullable=False)            # When the token expires
