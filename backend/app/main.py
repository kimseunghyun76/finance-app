from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import market, stock, portfolio, features

app = FastAPI(title="BlackRock Aladdin 2.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(market.router)
app.include_router(stock.router)
app.include_router(portfolio.router)
app.include_router(features.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to BlackRock Aladdin 2.0 API"}
