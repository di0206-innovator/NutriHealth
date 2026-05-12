from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Boolean, Text, Table
from sqlalchemy.orm import relationship
import datetime
from database import Base

followers = Table(
    "followers",
    Base.metadata,
    Column("follower_id", Integer, ForeignKey("users.id")),
    Column("followed_id", Integer, ForeignKey("users.id"))
)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    name = Column(String)

    profile = relationship("Profile", back_populates="user", uselist=False)
    meals = relationship("Meal", back_populates="user")
    posts = relationship("Post", back_populates="user")
    
    following = relationship(
        "User", 
        secondary=followers,
        primaryjoin=(followers.c.follower_id == id),
        secondaryjoin=(followers.c.followed_id == id),
        backref="followers"
    )

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    goal = Column(String, default="maintain")
    activity_level = Column(String, default="active")
    restriction = Column(String, default="none")
    onboarded = Column(Boolean, default=False)
    target_calories = Column(Integer, default=2000)

    user = relationship("User", back_populates="profile")

class Meal(Base):
    __tablename__ = "meals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String, index=True)
    calories = Column(Integer)
    protein = Column(Float)
    carbs = Column(Float)
    fat = Column(Float)
    fiber = Column(Float, default=0.0)
    health_score = Column(Integer)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    
    # Store JSON strings for complex types to keep SQLite schema simple
    insights = Column(Text, default="[]") 
    healthier_alternatives = Column(Text, default="[]")
    personalized_advice = Column(Text, default="")
    top_ingredients = Column(Text, default="[]")

    user = relationship("User", back_populates="meals")

class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    content = Column(Text)
    meal_id = Column(Integer, ForeignKey("meals.id"), nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="posts")
    meal = relationship("Meal")
