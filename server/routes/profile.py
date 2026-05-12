from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from database import get_db
from models.models import Profile, User
from routes.auth import get_current_user
from pydantic import BaseModel
from limiter import limiter

router = APIRouter(prefix="/profile", tags=["Profile"])

class ProfileSchema(BaseModel):
    goal: str
    activity_level: str
    restriction: str
    target_calories: int = 2000

@router.get("/")
async def get_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        profile = Profile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return {
        "goal": profile.goal,
        "activity_level": profile.activity_level,
        "restriction": profile.restriction,
        "target_calories": profile.target_calories,
        "onboarded": profile.onboarded
    }

@router.post("/")
@limiter.limit("10/minute")
async def update_profile(request: Request, profile_data: ProfileSchema, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        profile = Profile(user_id=current_user.id)
        db.add(profile)
    
    profile.goal = profile_data.goal
    profile.activity_level = profile_data.activity_level
    profile.restriction = profile_data.restriction
    profile.target_calories = profile_data.target_calories
    profile.onboarded = True

    db.commit()
    db.refresh(profile)
    return {
        "goal": profile.goal,
        "activity_level": profile.activity_level,
        "restriction": profile.restriction,
        "target_calories": profile.target_calories,
        "onboarded": profile.onboarded
    }
