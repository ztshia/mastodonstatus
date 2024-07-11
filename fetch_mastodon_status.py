import os
import json
import requests

MASTODON_BASE_URL = "https://c7.io"
MASTODON_ACCESS_TOKEN = os.getenv("MASTODON_ACCESS_TOKEN")
MASTODON_USERNAME = os.getenv("MASTODON_USERNAME")
LAST_FETCHED_ID_FILE = "last_fetched_id.txt"
STATUS_FILE = "status.json"
IMG_FOLDER = "img"

if not os.path.exists(IMG_FOLDER):
    os.makedirs(IMG_FOLDER)

def get_last_fetched_id():
    if os.path.exists(LAST_FETCHED_ID_FILE):
        with open(LAST_FETCHED_ID_FILE, 'r') as f:
            return f.read().strip()
    return None

def save_last_fetched_id(statuses):
    if statuses:
        last_id = statuses[0]['id']
        with open(LAST_FETCHED_ID_FILE, 'w') as f:
            f.write(last_id)

def fetch_statuses(base_url, access_token, user_id):
    headers = {
        "Authorization": f"Bearer {access_token}"
    }
    last_fetched_id = get_last_fetched_id()
    params = {"limit": 40}
    if last_fetched_id:
        params["since_id"] = last_fetched_id

    response = requests.get(f"{base_url}/api/v1/accounts/{user_id}/statuses", headers=headers, params=params)
    if response.status_code != 200:
        print(f"Failed to fetch statuses: {response.status_code} {response.content}")
        return []

    return response.json()

def download_image(url, file_path):
    print(f"Downloading image from {url} to {file_path}")
    response = requests.get(url, stream=True)
    if response.status_code == 200:
        with open(file_path, 'wb') as f:
            for chunk in response.iter_content(1024):
                f.write(chunk)
        print(f"Downloaded image to {file_path}")
    else:
        print(f"Failed to download image: {response.status_code} {response.content}")

def update_status_file(new_statuses):
    if os.path.exists(STATUS_FILE):
        with open(STATUS_FILE, 'r', encoding='utf-8') as f:
            current_statuses = json.load(f)
    else:
        current_statuses = []

    combined_statuses = new_statuses + [status for status in current_statuses if status['id'] not in {s['id'] for s in new_statuses}]
    
    for status in combined_statuses:
        if 'media_attachments' in status and status['media_attachments']:
            for media in status['media_attachments']:
                if media['type'] == 'image':
                    if 'url' in media:
                        image_url = media['url']
                        image_name = os.path.join(IMG_FOLDER, f"{media['id']}.jpg")
                        download_image(image_url, image_name)
                    else:
                        print(f"No URL found in media: {media}")

    with open(STATUS_FILE, 'w', encoding='utf-8') as f:
        json.dump(combined_statuses, f, ensure_ascii=False, indent=4)

def download_images_from_history():
    if os.path.exists(STATUS_FILE):
        with open(STATUS_FILE, 'r', encoding='utf-8') as f:
            statuses = json.load(f)
            for status in statuses:
                if 'media_attachments' in status and status['media_attachments']:
                    for media in status['media_attachments']:
                        if media['type'] == 'image':
                            image_url = media['url']
                            image_name = os.path.join(IMG_FOLDER, f"{media['id']}.jpg")
                            if not os.path.exists(image_name):  # 防止重复下载
                                print(f"Downloading historical image from {image_url} to {image_name}")
                                download_image(image_url, image_name)

def main():
    if not MASTODON_ACCESS_TOKEN or not MASTODON_USERNAME:
        print("Error: MASTODON_ACCESS_TOKEN and MASTODON_USERNAME must be set")
        return

    user_lookup_url = f"{MASTODON_BASE_URL}/api/v1/accounts/lookup"
    response = requests.get(user_lookup_url, headers={"Authorization": f"Bearer {MASTODON_ACCESS_TOKEN}"}, params={"acct": MASTODON_USERNAME})
    
    if response.status_code != 200:
        print(f"Failed to lookup user: {response.status_code} {response.content}")
        return
    
    user_data = response.json()
    user_id = user_data['id']

    print(f"Fetching statuses for {MASTODON_USERNAME} from {MASTODON_BASE_URL}")
    statuses = fetch_statuses(MASTODON_BASE_URL, MASTODON_ACCESS_TOKEN, user_id)
    save_last_fetched_id(statuses)
    update_status_file(statuses)
    download_images_from_history()

if __name__ == "__main__":
    main()
