import ollama

def generate_email(summary, action_items):

    prompt = f"""
You are an AI assistant generating a follow-up email after a meeting.

Generate:
1. Meeting title
2. Follow-up email

Meeting Summary:
{summary}

Action Items:
{action_items}

Return output strictly in this format:

Meeting Title: <title>

Email:
<email text>

Do not add explanations outside this format.
"""

    response = ollama.chat(
        model="llama3",
        format="json",
        messages=[{"role": "user", "content": prompt}]
    )

    return response.get('message', {}).get('content', "")