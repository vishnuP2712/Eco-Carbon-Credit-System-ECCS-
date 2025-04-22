from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField, SelectField, BooleanField,RadioField
from wtforms.validators import DataRequired, Email, EqualTo, Length, Optional

class SignupForm(FlaskForm):
    company_name = StringField("Company Name", validators=[Optional()])
    organization = SelectField("Organization", choices=[("govt", "Government"), ("ngo", "NGO"), ("private", "Private"), ("other", "Other")], validators=[Optional()])
    first_name = StringField("First Name", validators=[DataRequired()])
    last_name = StringField("Last Name", validators=[DataRequired()])
    email = StringField("Email", validators=[DataRequired(), Email()])
    phone = StringField("Phone Number", validators=[DataRequired(), Length(min=10, max=15)])
    password = PasswordField("Password", validators=[DataRequired(), Length(min=6)])
    confirm_password = PasswordField("Confirm Password", validators=[DataRequired(), EqualTo("password", message="Passwords must match.")])
    terms = BooleanField("Agree to Terms", validators=[DataRequired()])
    submit = SubmitField("Sign Up")
