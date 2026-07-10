import os

FRONTEND_DIR = r"d:\New folder\frontend\src"
OLD_URL_1 = "http://localhost:5000"
OLD_URL_2 = "http://${networkIp}:5000"
NEW_URL = "https://media-backend-zyw5.onrender.com"

for root, _, files in os.walk(FRONTEND_DIR):
    for file in files:
        if file.endswith(".jsx") or file.endswith(".js"):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
                
            if OLD_URL_1 in content or OLD_URL_2 in content:
                new_content = content.replace(OLD_URL_1, NEW_URL).replace(OLD_URL_2, NEW_URL)
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"Updated {file}")
