import json

def generate_memos(input_file, output_file):
    with open(input_file, 'r', encoding='utf-8') as f:
        statuses = json.load(f)

    memos = []
    for status in statuses:
        memo = {
            "created_at": status.get("created_at"),
            "url": status.get("url"),
            "content": status.get("content"),
            "application": status.get("application"),
            "media_attachments": [
                {
                    "url": attachment.get("url"),
                    "preview_url": attachment.get("preview_url"),
                } for attachment in status.get("media_attachments", [])
            ],
            "tags": status.get("tags", []),
        }
        memos.append(memo)

    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(memos, f, ensure_ascii=False, indent=4)

if __name__ == "__main__":
    generate_memos('status.json', 'memos.json')
