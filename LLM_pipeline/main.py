from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

from transcript_utils import clean_transcript
from llm_pipeline import analyze_meeting
from email_generator import generate_email

import csv
from io import StringIO

app = FastAPI()

# Enable CORS so React/Spring Boot can call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request body structure
class TranscriptRequest(BaseModel):
    transcript: str


# Function to convert action items into CSV
def convert_to_csv(action_items):

    output = StringIO()
    writer = csv.writer(output)

    writer.writerow(["Task", "Owner", "Deadline", "Priority"])

    for item in action_items:
        writer.writerow([
            item.get("task"),
            item.get("owner"),
            item.get("deadline"),
            item.get("priority")
        ])

    return output.getvalue()


@app.post("/analyze")
def analyze_transcript(request: TranscriptRequest):

    # Logging for debugging
    print("Transcript received from frontend:")
    print(request.transcript[:200])

    # Step 1: Clean transcript
    cleaned = clean_transcript(request.transcript)

    # Step 2: Run LLM pipeline
    result = analyze_meeting(cleaned)

    # Step 3: Generate follow-up email
    email = generate_email(result["summary"], result["action_items"])

    # Step 4: Convert action items to CSV
    csv_data = convert_to_csv(result["action_items"])

    # Step 5: Return response
    return {
        "summary": result.get("summary", []),
        "action_items": result.get("action_items", []),
        "decisions": result.get("decisions", []),
        "open_questions": result.get("open_questions", []),
        "followup_email": email,
        "csv_export": csv_data
    }