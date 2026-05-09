import os
import uuid
import time
import logging
# pyrefly: ignore [missing-import]
from fastapi import FastAPI, Request
# pyrefly: ignore [missing-import]
from fastapi.middleware.cors import CORSMiddleware
# pyrefly: ignore [missing-import]
from fastapi.staticfiles import StaticFiles
# pyrefly: ignore [missing-import]
from fastapi.responses import FileResponse
from routes.analyze import router as analyze_router
from routes.report import router as report_router
# pyrefly: ignore [missing-import]
import uvicorn

# Snippet 17: Structured logging configuration
logging.basicConfig(
    format='%(asctime)s %(levelname)s %(name)s %(message)s',
    level=logging.INFO
)
logger = logging.getLogger("nutrilens")

app = FastAPI(title="NutriLens API", version="1.0.0")

# Snippet 14: SlowAPI for rate limiting (needs to be available globally)
# pyrefly: ignore [missing-import]
from slowapi import _rate_limit_exceeded_handler
# pyrefly: ignore [missing-import]
from slowapi.errors import RateLimitExceeded
from limiter import limiter

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Snippet 17: Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    trace_id = str(uuid.uuid4())[:8]
    start = time.time()
    
    logger.info(f"[{trace_id}] {request.method} {request.url.path}")
    
    response = await call_next(request)
    duration = round((time.time() - start) * 1000)
    
    logger.info(
        f"[{trace_id}] {response.status_code} "
        f"path={request.url.path} "
        f"duration={duration}ms"
    )
    response.headers["X-Trace-Id"] = trace_id
    return response

# Snippet 14: Security headers middleware
@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Content-Security-Policy"] = "default-src 'self'; img-src 'self' data: https:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com;"
    return response

app.include_router(analyze_router, prefix="/api")
app.include_router(report_router, prefix="/api")

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "nutrilens-api"}

# Serve React static files in production
static_dir = os.path.join(os.path.dirname(__file__), "static")
if os.path.isdir(static_dir):
    app.mount("/assets", StaticFiles(directory=os.path.join(static_dir, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        file_path = os.path.join(static_dir, full_path)
        if full_path and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(static_dir, "index.html"))

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8080, reload=True)
