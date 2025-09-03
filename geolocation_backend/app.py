from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import httpx
import os

app = FastAPI()

# It's a good practice to use environment variables for API keys
# but for this example, we'll use the one provided.
RAPIDAPI_KEY = os.environ.get("RAPIDAPI_KEY", "456d907170msh9de857a6dcd0822p1f2f7djsn17e210c970e8")
RAPIDAPI_HOST = "ip-geo-location.p.rapidapi.com"

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

@app.get("/get-location-by-ip")
async def get_location():
    url = "https://ip-geo-location.p.rapidapi.com/ip/check?format=json&language=en"
    headers = {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': RAPIDAPI_HOST
    }
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, headers=headers)
            response.raise_for_status()  # Raise an exception for bad status codes
            return response.json()
        except httpx.HTTPStatusError as exc:
            return {"error": f"HTTP error occurred: {exc.response.status_code} - {exc.response.text}"}
        except httpx.RequestError as exc:
            return {"error": f"An error occurred while requesting {exc.request.url!r}."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8007)
