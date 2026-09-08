from security import verify_password


def authenticate_user(password, hashed_password):
    return verify_password(password, hashed_password)