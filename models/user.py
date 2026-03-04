from models import db

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    
    # Relationships to our credential tables
    google_creds = db.relationship('GoogleCredential', backref='user', uselist=False)
    apple_creds = db.relationship('AppleCredential', backref='user', uselist=False)
