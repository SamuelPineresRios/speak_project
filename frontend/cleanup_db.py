import json

# Load the database
with open('data/db.json', 'r', encoding='utf-8') as f:
    db = json.load(f)

# Store the keys we're deleting for the report
deleted_keys = []
if 'stories' in db:
    deleted_keys.append(f"stories: {len(db['stories'])} items")
    del db['stories']
if 'scenes' in db:
    deleted_keys.append(f"scenes: {len(db['scenes'])} items")
    del db['scenes']
if 'story_progress' in db:
    deleted_keys.append(f"story_progress: {len(db['story_progress'])} items")
    del db['story_progress']

# Save the cleaned database
with open('data/db.json', 'w', encoding='utf-8') as f:
    json.dump(db, f, indent=2, ensure_ascii=False)

print('✓ Cleaned db.json:')
for item in deleted_keys:
    print(f'  - Removed {item}')
