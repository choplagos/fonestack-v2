import os

# Define the file list based on the refactored code
files = {
    "package.json": """...""", # Paste package.json content
    "tailwind.config.js": """...""", # Paste tailwind content
    "app/globals.css": """...""",
    "app/layout.tsx": """...""",
    "app/page.tsx": """...""",
    "lib/supabase.ts": """...""",
    # Add all other components...
}

def create_structure():
    for path, content in files.items():
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "w", encoding="utf-8") as f:
            f.write(content)
    print("✅ Fonestack V2 Project structure created successfully!")

if __name__ == "__main__":
    create_structure()