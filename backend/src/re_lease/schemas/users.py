from pydantic import BaseModel, EmailStr, constr


class UserCreateRequest(BaseModel):
    username: constr(min_length=3, max_length=50, pattern=r"^[a-zA-Z0-9_]+$")
    email: EmailStr
    password: constr(min_length=8, max_length=64)


class Token(BaseModel):
    access_token: str
    token_type: str