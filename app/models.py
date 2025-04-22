from flask_sqlalchemy import SQLAlchemy
import uuid
from flask_bcrypt import Bcrypt
from sqlalchemy.sql import func
from datetime import datetime



bcrypt=Bcrypt()
db = SQLAlchemy()

# Utility functions to generate IDs
def generate_employer_id():
    return f"EMPR{uuid.uuid4().hex[:8].upper()}"#FORMAT STRINGS

def generate_employee_id():
    return f"EMPL{uuid.uuid4().hex[:8].upper()}"


# Employer model with cascading deletes for related employees
class Employer(db.Model):
    __tablename__ = 'employers'
    id = db.Column(db.Integer, primary_key=True)
    employer_id = db.Column(db.String(20), unique=True, nullable=False, default=generate_employer_id)
    company_name = db.Column(db.String(100), nullable=False)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    password = db.Column(db.String(255), nullable=False)
    credits = db.Column(db.Integer, default=1000)
    is_approved = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now())

    # Cascade delete for employees when employer is deleted
    employees = db.relationship('Employee', backref='employer', cascade='all, delete', passive_deletes=True)




# Employee model with foreign key pointing to Employer
class Employee(db.Model):
    __tablename__ = 'employees'
    id = db.Column(db.Integer, primary_key=True)
    credits=db.Column(db.Integer , default=0)
    employee_id = db.Column(db.String(20), unique=True, nullable=False, default=generate_employee_id)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    password = db.Column(db.String(255), nullable=False)
    employer_id = db.Column(db.String(20), db.ForeignKey('employers.employer_id', ondelete='CASCADE'), nullable=False)
    is_active = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now())
    trips = db.relationship('Trip', backref='employee', cascade='all, delete', passive_deletes=True)




class Trip(db.Model):
    __tablename__ = 'trips'
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date, default=datetime.utcnow)
    origin_address = db.Column(db.String(255), nullable=False)
    destination_address = db.Column(db.String(255), nullable=False)
    travel_mode = db.Column(db.String(50), nullable=False)
    distance = db.Column(db.Float)
    carbon_footprint = db.Column(db.Float)
    green_cred = db.Column(db.Float)
    purpose = db.Column(db.String(100))
    notes = db.Column(db.Text)
    employee_id = db.Column(db.Integer, db.ForeignKey('employees.id', ondelete='CASCADE'), nullable=False)

class Trade(db.Model):
    __tablename__ = 'trades'
    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.String(20), db.ForeignKey('employers.employer_id', ondelete='CASCADE'), nullable=False)
    receiver_id = db.Column(db.String(20), db.ForeignKey('employers.employer_id', ondelete='CASCADE'))
    amount = db.Column(db.Integer, nullable=False)
    timestamp = db.Column(db.DateTime(timezone=True), server_default=func.now())
    isComplete=db.Column(db.String(225),default=False)
    sender = db.relationship('Employer', foreign_keys=[sender_id], backref='sent_trades')
    receiver = db.relationship('Employer', foreign_keys=[receiver_id], backref='received_trades')



def set_password( password):
    """Hash the password before saving."""
    password = bcrypt.generate_password_hash(password).decode('utf-8')
    return password
def check_password(password,hashpassword):
    """Check the hashed password."""
    return bcrypt.check_password_hash(hashpassword,password)


"""
    to create database open cmd and start python interactive shell by pressing py or python
    then use these lines
    from app import db
    from run import app
    with app.app_context():
        db.create_all()
"""
