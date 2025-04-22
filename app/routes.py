from flask import Blueprint,render_template,redirect,url_for,flash,request,session,jsonify
from .forms import SignupForm
from .models import db,Employee,Employer,set_password,check_password,Trip,Trade
from datetime import datetime
from .forms import *
from .utils import *

main=Blueprint('main',__name__)


#auth route
@main.route('/signup',methods=["GET","POST"])#route
def signupPage():#views
    if "role" in session:
        return redirect(url_for(f"main.{session['role']}dashboardPage"))
    form=SignupForm()
    form.organization.choices = [(org.company_name, org.company_name) for org in Employer.query.all()]
    if request.method=="POST":   
        if form.validate_on_submit():  
            first_name = form.first_name.data
            last_name = form.last_name.data
            email = form.email.data
            phone = form.phone.data
            password = form.password.data
            account = request.form.get('accountType')
            company_name = form.company_name.data 
            organization = form.organization.data 
           
            # Hash the password before saving
            password_hash = set_password(password)
            if account == "employee":
                employer_id = Employer.query.filter_by(company_name=organization).first().employer_id 
                if Employee.query.filter_by(email=email).first():
                   return render_template('auth/signup.html', form=form,message="user exits")
                user = Employee(
                    first_name=first_name,
                    last_name=last_name,
                    email=email,
                    phone=phone,
                    password=password_hash,  # Store the hashed password
                    employer_id=employer_id,
                    created_at=datetime.now()
                )
            elif account == "employer":
                if Employer.query.filter_by(email=email).first():
                   return render_template('auth/signup.html', form=form,message="user exits")

                user = Employer(
                    company_name=company_name,
                    first_name=first_name,
                    last_name=last_name,
                    email=email,
                    phone=phone,
                    password=password_hash,  # Store the hashed password
                    is_approved=True,  # Initial approval status
                    created_at=datetime.now()
                )
            db.session.add(user)
            db.session.commit()
            print(f"Employer {first_name} {last_name} created successfully.")
            return redirect(url_for('main.loginPage'))
        else:
            return render_template('auth/signup.html', form=form,message="wrong credits")
    return render_template('auth/signup.html', form=form)



@main.route('/login/all', methods=['GET', 'POST'])
def loginPage():
    if "role" in session:
        return redirect(url_for(f"main.{session['role']}dashboardPage"))
    return render_template('auth/login.html')

@main.route('/login/<role>', methods=['GET', 'POST'])#dynamic url
def login_submit_Page(role=None):
    if 'role' in session and session['role']:
        try:
            url = f"main.{session['role']}dashboardPage"
            return redirect(url_for(url))
        except Exception as e:
            flash("Invalid role or route not found.", "danger")
            return redirect(url_for("main.loginPage"))
    if request.method == "POST":
        email = request.form.get('email')
        password = request.form.get('password')

        if role == "employee":
            user = Employee.query.filter_by(email=email).first()
            if user and check_password(password, user.password):
                if user.is_active:
                    session['role'] = 'employee'
                    session['user'] = user.employee_id
                    session['username']= user.first_name + user.last_name
                    return redirect(url_for('main.employeedashboardPage')) 
                else:
                    return render_template('auth/login.html', message="Please wait until ur employer approve u")
            else:
                
                return render_template('auth/login.html', message="User not found or incorrect password")
        
        elif role == "employer":
            user = Employer.query.filter_by(email=email).first()
            if user and check_password(password, user.password):
                if user.is_approved:
                    session['role'] = 'employer'
                    session['user'] = user.employer_id
                    session['username']= user.company_name
                    return redirect(url_for('main.employerdashboardPage'))
                return render_template('auth/login.html', message="Please wait until admin approve u")
  # Update if route name is different
            else:
                return render_template('auth/login.html', message="User not found or incorrect password")
        else:
            if email=="ccb@gmail.com" and password=="password":
                session['role'] = 'bank'
                session['user'] = "bank001"
                session['username']= "banker"
                redirect(url_for('main.bankdashboard'))
    return render_template('auth/login.html')









































#dashbaords
@main.route('/bank/dashboard')
def bankdashboardPage():
    if "role" not in session:
        return redirect(url_for('loginPage'))
    import random
    users=Employee.query.all()+Employer.query.all()
    random.shuffle(users)
    print(users)
    context={"users":users,
             "isEmployee":isEmployee,
             "total_users":Employee.query.count()+Employer.query.count(),
             "total_credits":sum(i.credits for i in Employer.query.all()),
             "pending_accounts":Employer.query.filter_by(is_approved=False).count(),
             "total_transaction":Trade.query.count(),
             "trades":Trade.query.all()}
    return render_template('bank/dashboard.html',**context)



@main.route("/approve-user/<user_id>/<usertype>")
def approve_users(user_id, usertype):
    if usertype == "employer":
        user = Employer.query.filter_by(employer_id=user_id).first()
        if user:
            user.is_approved = 1
    else:
        user = Employee.query.filter_by(employee_id=user_id).first()
        if user:
            user.is_active = 1

    db.session.commit()
    return redirect(url_for('main.bankdashboardPage'))



@main.route("/delete-user/<user_id>/<usertype>")
def delete_user(user_id, usertype):
    if usertype == "employer":
        user = Employer.query.filter_by(employer_id=user_id).first()
        print(user)
    else:
        user = Employee.query.filter_by(employee_id=user_id).first()
        print(user)

    if user:
        db.session.delete(user)
        db.session.commit()

    return redirect(url_for('main.bankdashboardPage'))















@main.route('/employer/dashboard')
def employerdashboardPage():
    
    transactions = [
    {"title": "Credits Purchase", "date": "Apr 5, 2025", "amount": 2500},
    {"title": "Credits Transfer", "date": "Apr 3, 2025", "amount": -150},
    {"title": "Monthly Allocation", "date": "Apr 1, 2025", "amount": 1000},
    {"title": "Offset Trade", "date": "Mar 28, 2025", "amount": -300},
    {"title": "Offset Trade", "date": "Mar 28, 2025", "amount": -300},
    {"title": "Offset Trade", "date": "Mar 28, 2025", "amount": -300},
    {"title": "Offset Trade", "date": "Mar 28, 2025", "amount": -300},
    {"title": "Bonus Credits", "date": "Mar 15, 2025", "amount": 250}
]   
    trend_months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    trend_values = [10500, 11200, 12100, 11800, 12500, 13100, 13800, 14200, 14700, 15250]
    pending_employees=Employee.query.filter_by(employer_id=session['user'],is_active=0).all()
    trades = Trade.query.filter(
    Trade.isComplete == False,
    Trade.sender_id != session['user']
).all()
    context={"total_credits":Employer.query.filter_by(employer_id=session['user']).first().credits,
            "get_travel":get_travel,
            "pending_employees":pending_employees,
            "total_employees":Employee.query.filter(Employee.employer_id == session['user'],Employee.is_active == 1).count(),
            "pending_employee":Employee.query.filter(Employee.employer_id == session['user'],Employee.is_active == 0).count()
            ,"trades" : trades  ,
            "transactions" : Trade.query.filter((Trade.sender_id == session['user']) | (Trade.receiver_id == session['user'])).order_by(Trade.timestamp.desc()).all(),
            "employees":Employee.query.filter_by(employer_id=session['user'])}   
    

    return render_template('employer/dashboard.html', trend_months=['Jan', 'Feb', 'Mar'], trend_values=[5.2, 6.1, 8.3],**context)

@main.route("/create-trade",methods=["POST"])
def create_trade():
    if request.method=="POST":
        credits=int(request.form.get('credit_amount'))  
    if credits>Employer.query.filter_by(employer_id=session['user']).first().credits:
        flash("Invalid input for trade.", "danger")
        return redirect(url_for('main.employerdashboardPage'))
    trade=Trade(sender_id=session['user'],amount=credits)
    Employer.query.filter_by(employer_id=session['user']).first().credits-=credits
    db.session.add(trade)
    db.session.commit()
    return redirect(url_for('main.employerdashboardPage'))
@main.route('/delete-account/<id>', methods=['POST',"DELETE"])
def delete_account(id):
    if request.method == 'POST':
        print(id)
        user=Employee.query.filter_by(employee_id=id)
        db.session.delete(user)
        db.session.commit()
        return redirect(url_for('main.loginPage'))
    return "Invalid request", 400


@main.route('/approve', methods=['POST'])
def approve_employee():
    approved_ids = request.form.getlist('approved_ids')
    print(approved_ids)
    for emp_id in approved_ids:
        print(emp_id)
        Employee.query.filter_by(employee_id=emp_id).first().is_active=True
        db.session.commit()
    flash(f"{len(approved_ids)} employee(s) approved successfully!", "success")
    return redirect(url_for('main.employerdashboardPage'))

@main.route('/make-trade/<id>')
def make_trade(id):
    trade=Trade.query.filter_by(id=id).first()
    Employer.query.filter_by(employer_id=session['user']).first().credits+=trade.amount
    trade.isComplete=True
    trade.receiver_id=session['user']
    db.session.commit()
    return redirect(url_for('main.employerdashboardPage'))


@main.route('/manage/<employee_id>')
def manage_employee(employee_id):
    # Fetch employee details using employee_id
    return render_template('manage_employee.html')





@main.route('/employee/dashboard')
def employeedashboardPage():
    user=Employee.query.filter_by(employee_id=session['user']).first()
    recent_trips=Trip.query.filter_by(employee_id=session['user']).all()
    total_trips=Trip.query.filter_by(employee_id=session['user']).count()
    green_trips = (Trip.query.filter(Trip.employee_id ==session['user'], Trip.travel_mode.in_(['bicycle', 'walking'])).count())/(total_trips if total_trips!=0 else 1) *100
    green_credit=sum([i.green_cred for i in recent_trips])
    private_vehicle=Trip.query.filter(Trip.employee_id==session['user'],Trip.travel_mode=="private_vehicle").count()//(total_trips*100 if total_trips!=0 else 1)*100
    walking=Trip.query.filter(Trip.employee_id==session['user'],Trip.travel_mode=="walking").count()/(total_trips*100 if total_trips!=0 else 1)*100
    bicycle=Trip.query.filter(Trip.employee_id==session['user'],Trip.travel_mode=="bicycle").count()/(total_trips*100 if total_trips!=0 else 1)*100
    public_vehicle=Trip.query.filter(Trip.employee_id==session['user'],Trip.travel_mode=="public_vehicle").count()/(total_trips*100 if total_trips!=0 else 1)*100
    reward_rankings = Employee.query.order_by(Employee.credits.desc()).all()
    all_employees=sum(i.credits for i in Employee.query.filter_by(employer_id=user.employer_id).all())
    percent_complete = int((user.credits / monthly_target) * 100)
    leaderboard_position = calculate_leaderboard_position(user.credits, all_employees)
    print(leaderboard_position)
    context={
        "leaderboard_position":leaderboard_position,
        "percent_complete":percent_complete,
        "reward_rankings": reward_rankings,
        "total_credits":user.credits,
        "recent_trips":recent_trips,
        "total_trips":len(recent_trips),
        "green_trips":int(green_trips),
        "green_credit":green_credit,
        "month":{"private_vehicle":private_vehicle,"walking":walking,"bicycle":bicycle,"public_vehicle":public_vehicle},
        "tree_planted":green_credit/ 12.5 
    }
    return render_template('employee/dasboard.html',**context)#varble keyword arg


@main.route("/record-trip", methods=["GET", "POST"])
def record_trip():
    if request.method=="POST":
        trip = Trip(
            employee_id=session['user'],
            date = datetime.now().date(),
            origin_address = request.form.get('originAddress'),
            destination_address = request.form.get('destinationAddress'),
            travel_mode = request.form.get('travelMode'),
            purpose = request.form.get('tripPurpose'),
            notes = request.form.get('tripNotes'),
            # These might be calculated on frontend and passed via hidden input fields
            distance = float(request.form.get('distance')),  # should be float
            carbon_footprint = float(request.form.get('carbon'))  ,# should be float
            green_cred = float(request.form.get('greencred')),
            
        )
        db.session.add(trip)
        employee = Employee.query.filter_by(employee_id=session['user']).first()
        employer = Employer.query.filter_by(employer_id=employee.employer_id).first()
        print(employer.employer_id,employer.credits)
        green_cred = float(request.form.get('greencred'))
        employee.credits += green_cred
        employer.credits += green_cred
        db.session.commit()
        return redirect(url_for("main.employeedashboardPage"))  


































































@main.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('main.loginPage'))





#home page views


@main.route("/environmental")
def environmentalPage():
    return render_template('main/env.html')

@main.route("/how-it-works")
def how_it_worksPage():
    return render_template('main/howitworks.html')
@main.route("/")
def benefitsPage():
    return render_template('main/benefits.html')
@main.route("/faq")
def faqPage():
    return render_template('main/faq.html')
@main.route('/api/carbon-credits-distribution', methods=['GET'])
def carbon_credits_distribution():
    try:
        # Fetch trips for the logged-in user
        employee = [i for i in Employee.query.all() if i.employer_id == session['user']]
        trips = Trip.query.all()
        prvt=pub=walk=0 
        for emp in employee:
            
            emp_trips = [j for j in trips if j.employee_id == emp.employee_id]  # Assuming trip has employee_id
            prvt += sum(j.green_cred for j in emp_trips if j.travel_mode.lower() == "private_vehicle")
            walk += sum(j.green_cred for j in emp_trips if j.travel_mode.lower() == "walking")
            pub += sum(j.green_cred for j in emp_trips if j.travel_mode.lower() == "public_transit")

        print(prvt,walk,pub)
        # Calculate totals for each travel mode
        

        credit_distribution = {
            'categories': ['PRIVATE VEHICLE', 'WALKING', 'PUBLIC TRANSIT'],
            'values': [prvt, walk, pub]
        }

        return jsonify(credit_distribution), 200

    except Exception as e:
        print(f"Error: {e}")
        return jsonify('error')