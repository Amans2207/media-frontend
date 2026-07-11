import os
import glob

search_text = 'https://frugality-unhidden-tibia.ngrok-free.dev'
replace_text = 'https://media-backend-production-b846.up.railway.app'
directory = 'd:/New folder/frontend/src/components'

for filepath in glob.glob(os.path.join(directory, '*.jsx')):
    with open(filepath, 'r', encoding='utf-8') as file:
        content = file.read()
    
    if search_text in content:
        content = content.replace(search_text, replace_text)
        with open(filepath, 'w', encoding='utf-8') as file:
            file.write(content)
        print(f"Updated {filepath}")
