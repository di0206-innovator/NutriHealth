from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from database import get_db
from models.models import User, Post, followers
from routes.auth import get_current_user
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/community", tags=["Community"])

class PostCreate(BaseModel):
    content: str
    meal_id: Optional[int] = None

class UserBrief(BaseModel):
    id: int
    name: Optional[str]
    email: str
    is_following: bool = False

    class Config:
        from_attributes = True

class PostResponse(BaseModel):
    id: int
    content: str
    timestamp: datetime
    user_name: Optional[str]
    user_id: int
    meal_id: Optional[int] = None

    @classmethod
    def from_orm(cls, post):
        return cls(
            id=post.id,
            content=post.content,
            timestamp=post.timestamp,
            user_name=post.user.name or post.user.email,
            user_id=post.user_id,
            meal_id=post.meal_id
        )

@router.get("/users", response_model=List[UserBrief])
async def get_users(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    users = db.query(User).filter(User.id != current_user.id).all()
    following_ids = [u.id for u in current_user.following]
    
    result = []
    for user in users:
        result.append(UserBrief(
            id=user.id,
            name=user.name,
            email=user.email,
            is_following=user.id in following_ids
        ))
    return result

@router.post("/follow/{user_id}")
async def follow_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot follow yourself")
    
    user_to_follow = db.query(User).filter(User.id == user_id).first()
    if not user_to_follow:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user_to_follow in current_user.following:
        raise HTTPException(status_code=400, detail="Already following this user")
    
    current_user.following.append(user_to_follow)
    db.commit()
    return {"message": f"You are now following {user_to_follow.name or user_to_follow.email}"}

@router.post("/unfollow/{user_id}")
async def unfollow_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    user_to_unfollow = db.query(User).filter(User.id == user_id).first()
    if not user_to_unfollow:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user_to_unfollow not in current_user.following:
        raise HTTPException(status_code=400, detail="Not following this user")
    
    current_user.following.remove(user_to_unfollow)
    db.commit()
    return {"message": f"You have unfollowed {user_to_unfollow.name or user_to_unfollow.email}"}

@router.post("/post", response_model=PostResponse)
async def create_post(post_data: PostCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_post = Post(
        user_id=current_user.id,
        content=post_data.content,
        meal_id=post_data.meal_id
    )
    db.add(new_post)
    db.commit()
    db.refresh(new_post)
    return PostResponse.from_orm(new_post)

@router.get("/feed", response_model=List[PostResponse])
async def get_feed(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Get posts from users followed by current_user + current_user's own posts
    following_ids = [u.id for u in current_user.following]
    following_ids.append(current_user.id)
    
    posts = db.query(Post).filter(Post.user_id.in_(following_ids)).order_by(desc(Post.timestamp)).all()
    return [PostResponse.from_orm(p) for p in posts]
