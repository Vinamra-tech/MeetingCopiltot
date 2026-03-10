import ollama
import json
from transcript_utils import chunk_transcript


def extract_json(text):
    try:
        start = text.index("{")
        end = text.rindex("}") + 1
        json_text = text[start:end]
        return json.loads(json_text)
    except:
        return {
            "summary": [],
            "action_items": [],
            "decisions": [],
            "open_questions": []
        }


def analyze_meeting(transcript):

    chunks = chunk_transcript(transcript)

    final_summary = []
    final_actions = []
    final_decisions = []
    final_questions = []

    print(f"Processing {len(chunks)} transcript chunks")

    for chunk in chunks:

        prompt = f"""
You are an expert meeting assistant.

Analyze the meeting transcript and extract structured information.

Identify:

1. ACTION ITEMS
Tasks that someone agreed to perform.

Examples of action items:
- "I'll prepare the report"
- "Rahul will send the document"
- "We should schedule a meeting"
- "Anita will finalize the budget"

For each action item include:
task, owner, deadline, priority, confidence.

2. DECISIONS
Any final agreements made in the meeting.

3. OPEN QUESTIONS
Topics still unresolved.

4. SUMMARY
Maximum 5 bullet points summarizing the meeting.

Rules:
- Return ONLY JSON
- Do not include explanations
- If deadline not mentioned return "Not specified"

Return JSON in this format:

{{
"summary": [],
"action_items": [
  {{
    "task": "",
    "owner": "",
    "deadline": "",
    "priority": "",
    "confidence": 0.0
  }}
],
"decisions": [],
"open_questions": []
}}

Transcript:
{chunk}
"""

        response = ollama.chat(
            model="llama3",
            format = "json",
            messages=[{"role": "user", "content": prompt}]
        )

        text = response.get("message", {}).get("content", "")

        data = extract_json(text)

        final_summary.extend(data.get("summary", []))
        final_actions.extend(data.get("action_items", []))
        final_decisions.extend(data.get("decisions", []))
        final_questions.extend(data.get("open_questions", []))

    return {
        "summary": final_summary,
        "action_items": final_actions,
        "decisions": final_decisions,
        "open_questions": final_questions
    }