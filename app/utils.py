from .models import Trip,Employee,Employer
def evaluate_monthly_progress(user_credits, monthly_target=1000):
    """
    Evaluate user's monthly progress based on credits earned.
    """
    percent_complete = (user_credits / monthly_target) * 100
    return {
        "credits": user_credits,
        "target": monthly_target,
        "progress_percent": int(percent_complete)
    }
monthly_target=100000

def calculate_leaderboard_position(user_credis, sum_credits):
    """
    Calculates the employee's percentile ranking in the company.
    
    :param employee_credits: Credits of the specific employee
    :param all_employees: List of all Employee objects
    :return: Percentile position (e.g., top 18%)
    """

    percentile = (user_credis / (sum_credits*100 if sum_credits!=0 else 1)) * 100
    return percentile


def get_travel(employee_id):
    return Trip.query.filter_by(employee_id=employee_id).count()


def isEmployee(employee_id):
    return True if Employee.query.filter_by(employee_id=employee_id).first() else False