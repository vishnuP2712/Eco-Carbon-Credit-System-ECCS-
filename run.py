from app import create_app

app = create_app()

# For Render deployment, ensure the app object is exposed
if __name__ != "__main__":
    # Render uses Gunicorn, which imports the app object
    gunicorn_app = app

if __name__ == "__main__":
    app.run(debug=True)