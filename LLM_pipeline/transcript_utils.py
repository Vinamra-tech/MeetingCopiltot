import re

def clean_transcript(text):

    if not text:
        return ""

    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text)

    # Remove timestamps like [00:12]
    text = re.sub(r'\[\d{2}:\d{2}\]', '', text)

    return text.strip()


def chunk_transcript(text, chunk_size=1500):

    if not text:
        return []

    words = text.split()
    chunks = []

    for i in range(0, len(words), chunk_size):
        chunk = " ".join(words[i:i + chunk_size])
        chunks.append(chunk)

    return chunks